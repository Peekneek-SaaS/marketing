import { z } from "zod";
import { baseProcedure, userProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";
// import { PLAN_LIMITS } from "@/lib/types";
// import type { CrawlMode, Plan } from "@/lib/types";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ensureDbUser } from "@/lib/ensure-db-user";

/** Generous default until billing/plan limits are wired up */
const DEFAULT_MAX_PAGES = 500;

export const crawlRouter = createTRPCRouter({
  // ============================================
  // START A CRAWL
  // ============================================
  start: baseProcedure
    .input(
      z.object({
        url: z.url("Please enter a valid URL"),
        mode: z.enum([
          "exact",
          "path",
          "domain",
          "subdomain",
          "domain-subdomains",
        ]),
        checkExternal: z.boolean().default(false),
        followRedirects: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId: clerkUserId } = await auth();

      let dbUserId: string | null = null;
      if (clerkUserId) {
        const dbUser = await ensureDbUser(clerkUserId);
        dbUserId = dbUser?.id ?? null;
      }

      // --- Plan / payment limits (restore when billing is implemented) ---
      // let plan: Plan = "free";
      // if (clerkUserId) {
      //   const user = await prisma.user.findUnique({ where: { userId: clerkUserId } });
      //   plan = (user?.plan as Plan) || "free";
      // }
      // const limits = PLAN_LIMITS[plan];
      // if (!limits.modes.includes(input.mode as CrawlMode)) { ... }
      // if (input.checkExternal && !limits.checkExternal) { ... }
      // if (input.followRedirects && !limits.followRedirects) { ... }
      // Daily crawl cap for free tier: ...

      const maxPages = DEFAULT_MAX_PAGES;

      const crawl = await prisma.crawl.create({
        data: {
          url: input.url,
          mode: input.mode,
          checkExternal: input.checkExternal,
          followRedirects: input.followRedirects,
          maxPages,
          status: "pending",
          userId: dbUserId,
        },
      });

      await inngest.send({
        name: "crawl/start",
        data: {
          crawlId: crawl.id,
          url: input.url,
          mode: input.mode,
          checkExternal: input.checkExternal,
          followRedirects: input.followRedirects,
          maxPages,
          userId: dbUserId,
        },
      });

      return { crawlId: crawl.id };
    }),

  // ============================================
  // GET CRAWL STATUS
  // Polled every 2s from frontend
  // ============================================
  status: baseProcedure
    .input(
      z.object({
        crawlId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const row = await prisma.crawl.findUnique({
        where: { id: input.crawlId },
        select: {
          id: true,
          status: true,
          totalLinks: true,
          brokenLinks: true,
          workingLinks: true,
          redirectLinks: true,
          externalLinks: true,
          startedAt: true,
          finishedAt: true,
          durationMs: true,
          url: true,
          mode: true,
          userId: true,
        },
      });

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Crawl not found",
        });
      }

      const { userId: _ownerId, ...crawl } = row;
      return {
        ...crawl,
        /** Started while signed out — can be claimed to show in sidebar history */
        isUnowned: _ownerId === null,
      };
    }),

  // ============================================
  // GET CRAWL RESULTS (links)
  // Also polled from frontend for real time updates
  // ============================================
  results: baseProcedure
    .input(
      z.object({
        crawlId: z.string(),
        filter: z
          .enum(["all", "broken", "working", "redirects", "external"])
          .default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: any = { crawlId: input.crawlId };

      // Apply filter
      switch (input.filter) {
        case "broken":
          where.isBroken = true;
          break;
        case "working":
          where.isBroken = false;
          where.isRedirect = false;
          break;
        case "redirects":
          where.isRedirect = true;
          break;
        case "external":
          where.isExternal = true;
          break;
      }

      const links = await prisma.link.findMany({
        where,
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          url: true,
          parentUrl: true,
          status: true,
          redirectedTo: true,
          responseTime: true,
          error: true,
          isBroken: true,
          isRedirect: true,
          isExternal: true,
          createdAt: true,
        },
      });

      return links;
    }),

  // ============================================
  // GET ALL CRAWLS FOR A USER
  // For dashboard history
  // ============================================
  history: userProcedure.query(async ({ ctx }) => {
    const crawls = await prisma.crawl.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        url: true,
        mode: true,
        status: true,
        totalLinks: true,
        brokenLinks: true,
        workingLinks: true,
        durationMs: true,
        createdAt: true,
      },
    });

    return crawls;
  }),

  // ============================================
  // ATTACH ANONYMOUS CRAWL TO CURRENT USER (sidebar history)
  // ============================================
  claimIfOrphan: userProcedure
    .input(z.object({ crawlId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const crawl = await prisma.crawl.findUnique({
        where: { id: input.crawlId },
      });
      if (!crawl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Crawl not found",
        });
      }
      if (crawl.userId !== null) {
        if (crawl.userId !== ctx.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This crawl belongs to another account",
          });
        }
        return { claimed: false };
      }
      await prisma.crawl.update({
        where: { id: input.crawlId },
        data: { userId: ctx.userId },
      });
      return { claimed: true };
    }),

  // ============================================
  // DELETE A CRAWL
  // ============================================
  delete: userProcedure
    .input(
      z.object({
        crawlId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure crawl belongs to user
      const crawl = await prisma.crawl.findUnique({
        where: { id: input.crawlId },
      });

      if (!crawl || crawl.userId !== ctx.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Crawl not found",
        });
      }

      await prisma.crawl.delete({
        where: { id: input.crawlId },
      });

      return { success: true };
    }),
});

import { z } from "zod";
import { userProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
// import { PLAN_LIMITS } from "@/lib/types";
import prisma from "@/lib/prisma";

export const websiteRouter = createTRPCRouter({
  // ============================================
  // LIST ALL SAVED WEBSITES
  // For dashboard sidebar
  // ============================================
  list: userProcedure.query(async ({ ctx }) => {
    const websites = await prisma.website.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      include: {
        crawls: {
          orderBy: { createdAt: "desc" },
          take: 1, // latest crawl only
          select: {
            id: true,
            status: true,
            brokenLinks: true,
            createdAt: true,
          },
        },
      },
    });

    return websites;
  }),

  // ============================================
  // SAVE A WEBSITE TO DASHBOARD
  // ============================================
  save: userProcedure
    .input(
      z.object({
        url: z.url(),
        name: z.string().optional(),
        crawlId: z.string().optional(), // link existing crawl to website
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // --- Plan / saved-website limit (restore with PLAN_LIMITS when billing exists) ---
      // const plan = (ctx.user.plan as Plan) || "free";
      // const limits = PLAN_LIMITS[plan];
      // if (limits.savedWebsites !== Infinity) {
      //   const count = await prisma.website.count({ where: { userId: ctx.userId } });
      //   if (count >= limits.savedWebsites) {
      //     throw new TRPCError({ code: "FORBIDDEN", message: "..." });
      //   }
      // }

      // Check if already saved
      const existing = await prisma.website.findUnique({
        where: {
          userId_url: {
            userId: ctx.userId,
            url: input.url,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This website is already saved to your dashboard.",
        });
      }

      const website = await prisma.website.create({
        data: {
          url: input.url,
          name: input.name || new URL(input.url).hostname,
          userId: ctx.userId,
        },
      });

      // Link crawl to website if provided
      if (input.crawlId) {
        await prisma.crawl.update({
          where: { id: input.crawlId },
          data: { websiteId: website.id },
        });
      }

      return website;
    }),

  // ============================================
  // DELETE A WEBSITE
  // ============================================
  delete: userProcedure
    .input(
      z.object({
        websiteId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const website = await prisma.website.findUnique({
        where: { id: input.websiteId },
      });

      if (!website || website.userId !== ctx.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Website not found",
        });
      }

      await prisma.website.delete({
        where: { id: input.websiteId },
      });

      return { success: true };
    }),
});

import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { STATUS } from "@/schema/status";

export const appRouter = createTRPCRouter({
  scrapeUrl: protectedProcedure
    .input(
      z.object({
        url: z.url(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const product = await prisma.product.create({
        data: {
          productId: ctx.userId,
          url: input.url,
          title: "",
          description: "",
          price: "",
          brand: "",
          category: "",
          features: [],
          benefits: [],
          images: [],
          status: STATUS.PENDING,
        },
      });

      const result = await inngest.send({
        name: "scrape/url",
        data: {
          userId: ctx.userId,
          url: input.url,
          productId: product.id,
        },
      });

      if (!result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return { productId: product.id };
    }),

  getAllProducts: protectedProcedure.query(async ({ ctx }) => {
    const products = await prisma.product.findMany({
      where: {
        productId: ctx.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { products };
  }),

  getProductById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const product = await prisma.product.findUnique({
        where: {
          id: input,
          productId: ctx.userId,
        },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { product };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

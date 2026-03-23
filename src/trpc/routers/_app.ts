import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
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
          userId: ctx.userId,
          url: input.url,
          title: "",
          description: "",
          brand: "",
          category: "",
          price: "",
          features: [],
          benefits: [],
          images: [],

          // optional fields can be omitted
        },
      });

      const result = await inngest.send({
        name: "scrape/url",
        data: {
          productId: product.id,
          url: input.url,
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
        userId: ctx.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { products };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;

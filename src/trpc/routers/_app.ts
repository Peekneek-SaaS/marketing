import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
export const appRouter = createTRPCRouter({
  hello: baseProcedure.query(async () => {
    return {
      status: "ok",
    };
  }),
  scrapeUrl: protectedProcedure
    .input(
      z.object({
        url: z.url(),
      }),
    )
    .mutation(async ({ input }) => {
      return {
        status: "ok",
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;

import { baseProcedure, createTRPCRouter } from "../init";
import { crawlRouter } from "./crawl";
import { websiteRouter } from "./website";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  crawl: crawlRouter,
  website: websiteRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

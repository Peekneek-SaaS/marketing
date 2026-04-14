import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { ensureDbUser } from "@/lib/ensure-db-user";
/**
 * This context creator accepts `headers` so it can be reused in both
 * the RSC server caller (where you pass `next/headers`) and the
 * API route handler (where you pass the request headers).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // const user = await auth(opts.headers);
  return {};
};
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    // transformer: superjson,
  });
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { userId } = await auth();
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId } });
});

// Must be logged in + fetch user from DB (ctx.userId = Prisma User.id)
export const userProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await ensureDbUser(clerkUserId);
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Could not load your account",
    });
  }

  return next({
    ctx: { ...ctx, userId: user.id, clerkUserId, user },
  });
});

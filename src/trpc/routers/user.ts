import { createTRPCRouter, userProcedure } from "../init";

export const userRouter = createTRPCRouter({
  // ============================================
  // GET CURRENT USER
  // Plan, usage, limits
  // ============================================
  me: userProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      firstName: ctx.user.firstName,
      lastName: ctx.user.lastName,
      imageUrl: ctx.user.imageUrl,
      //   plan: ctx.user.plan,
      //   planExpiresAt: ctx.user.planExpiresAt,
    };
  }),
});

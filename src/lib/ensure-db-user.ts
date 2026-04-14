import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/** Resolve Clerk session → Prisma User row, creating the row if missing (e.g. webhook delay). */
export async function ensureDbUser(clerkUserId: string) {
  const existing = await prisma.user.findUnique({
    where: { userId: clerkUserId },
  });
  if (existing) return existing;

  const cu = await currentUser();
  if (!cu || cu.id !== clerkUserId) return null;

  const email = cu.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  return prisma.user.create({
    data: {
      userId: clerkUserId,
      email,
      firstName: cu.firstName ?? undefined,
      lastName: cu.lastName ?? undefined,
      imageUrl: cu.imageUrl,
    },
  });
}

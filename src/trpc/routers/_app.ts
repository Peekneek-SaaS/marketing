import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";

export const appRouter = createTRPCRouter({});

// export type definition of API
export type AppRouter = typeof appRouter;

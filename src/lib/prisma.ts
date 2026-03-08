import { PrismaClient } from "@prisma/client";

/**
 * ---------------------------------------------------------
 *  TechHat Typing Master — Prisma Client Singleton
 * ---------------------------------------------------------
 *  Next.js hot-reloads in development create new PrismaClient
 *  instances on every module reload. This singleton pattern
 *  attaches the client to `globalThis` so we always reuse the
 *  same connection pool across hot-reloads.
 *
 *  In production, a single PrismaClient instance is used.
 *
 *  Usage anywhere in the codebase:
 *    import { prisma } from "@/lib/prisma";
 * ---------------------------------------------------------
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

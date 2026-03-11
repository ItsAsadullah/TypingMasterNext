import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

/**
 * ---------------------------------------------------------
 *  TechHat Typing Master — Prisma Client Singleton
 * ---------------------------------------------------------
 *  Prisma 7 + Neon HTTP adapter (PrismaNeonHttp).
 *  HTTP mode works reliably in Next.js Node.js runtime
 *  without needing a WebSocket polyfill or Pool config.
 *
 *  The globalThis pattern prevents new instances on every
 *  Next.js hot-reload in development.
 *
 *  Usage: import { prisma } from "@/lib/prisma";
 * ---------------------------------------------------------
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

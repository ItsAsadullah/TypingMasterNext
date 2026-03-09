import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

/**
 * ---------------------------------------------------------
 *  TechHat Typing Master — Prisma Client Singleton
 * ---------------------------------------------------------
 *  Prisma 7 uses a Wasm-based client engine that requires
 *  a driver adapter. We use the Neon serverless adapter.
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
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

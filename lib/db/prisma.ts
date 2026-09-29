import { PrismaClient } from "@prisma/client";

// Standard Next.js pattern: reuse the client across hot reloads in dev
// so we don't open a new PostgreSQL connection pool on every save.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

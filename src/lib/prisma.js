import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot-reloads in development so we don't
// open a new database connection on every change and exhaust the pool.
// In production a fresh instance per server process is fine.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


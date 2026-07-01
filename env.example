import { PrismaClient } from "@prisma/client";

// Standard Next.js Prisma Singleton-Pattern, verhindert zu viele
// Verbindungen im Dev-Modus durch Hot-Reloading.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

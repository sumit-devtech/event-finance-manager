import { PrismaClient as PrismaClientSimplifi } from "./generated/prisma-simplifi";

const globalForPrisma = globalThis as unknown as {
  prismaSimplifi: PrismaClientSimplifi | undefined;
};

export const prismaSimplifi =
  globalForPrisma.prismaSimplifi ??
  new PrismaClientSimplifi({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaSimplifi = prismaSimplifi;

export { PrismaClientSimplifi };


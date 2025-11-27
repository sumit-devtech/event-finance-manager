import { PrismaClient as PrismaClientEventDb } from "./generated/prisma-database";

const globalForPrisma = globalThis as unknown as {
  prismaEventDb: PrismaClientEventDb | undefined;
};

export const prismaEventDb =
  globalForPrisma.prismaEventDb ??
  new PrismaClientEventDb({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaEventDb = prismaEventDb;

export { PrismaClientEventDb };


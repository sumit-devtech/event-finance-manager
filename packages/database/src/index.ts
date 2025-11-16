export { PrismaClient } from "@prisma/client";

// Export Prisma types
export type {
  NotificationType,
  UserRole,
  EventStatus,
  BudgetItemCategory,
} from "@prisma/client";

export * from "./client";


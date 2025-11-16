export { PrismaClient } from "@prisma/client";

// Export Prisma enums (as values, not types, since enums are both types and values)
export {
  NotificationType,
  UserRole,
  EventStatus,
  BudgetItemCategory,
} from "@prisma/client";

export * from "./client";


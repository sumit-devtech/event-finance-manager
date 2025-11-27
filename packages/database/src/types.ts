// Re-export Prisma types for use in frontend and other packages
export type {
  Organization,
  User,
  Subscription,
  SubscriptionHistory,
  Event,
  EventAssignment,
  EventStakeholder,
  Vendor,
  VendorEvent,
  BudgetItem,
  Expense,
  ApprovalWorkflow,
  Insight,
  ROIMetrics,
  CRMSync,
  Report,
  Notification,
  ActivityLog,
  File,
  AiBudgetSuggestion,
} from "./generated/prisma-database";

// Re-export Prisma namespace (for advanced type operations)
export { Prisma } from "./generated/prisma-database";

// Re-export Prisma enums
export { 
  UserRole, 
  EventStatus, 
  BudgetItemCategory, 
  NotificationType,
  ExpenseStatus,
  SubscriptionStatus,
  BillingCycle
} from "./generated/prisma-database";


// Re-export Prisma enums and create union types for better type safety

export {
  UserRole,
  EventStatus,
  BudgetItemCategory,
  ExpenseStatus,
  BudgetItemStatus,
  NotificationType,
} from "@event-finance-manager/database";

// Union types for better type safety
export type UserRoleType = "Admin" | "EventManager" | "Finance" | "Viewer";
export type EventStatusType = "Planning" | "Active" | "Completed" | "Cancelled";
export type BudgetItemCategoryType =
  | "Venue"
  | "Catering"
  | "Marketing"
  | "Logistics"
  | "Entertainment"
  | "StaffTravel"
  | "Miscellaneous";
export type ExpenseStatusType = "Pending" | "Approved" | "Rejected";
export type BudgetItemStatusType = "Pending" | "Approved" | "Closed";
export type NotificationTypeType = "Info" | "Warning" | "Error" | "Success";


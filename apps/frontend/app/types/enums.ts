// Re-export Prisma enums and create union types for better type safety

export {
  UserRole,
  EventStatus,
  BudgetItemCategory,
  ExpenseStatus,
  NotificationType,
} from "@event-finance-manager/database";

// Define these locally since they're not exported from the database package
export type BudgetItemStatus = "Pending" | "Approved" | "Rejected";
export type BudgetStatus = "Draft" | "Review" | "Approved";

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
  | "Technology"
  | "Miscellaneous";
export type ExpenseStatusType = "Pending" | "Approved" | "Rejected";
export type BudgetItemStatusType = "Pending" | "Approved" | "Rejected";
export type BudgetStatusType = "Draft" | "Review" | "Approved";
export type NotificationTypeType = "Info" | "Warning" | "Error" | "Success";


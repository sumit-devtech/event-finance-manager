export { PrismaClient } from "@prisma/client";

// Import Prisma's $Enums namespace to access enum types and values
import { $Enums } from "@prisma/client";

// Re-export enum values (const objects) - these can be used at runtime
export const NotificationType = $Enums.NotificationType;
export const UserRole = $Enums.UserRole;
export const EventStatus = $Enums.EventStatus;
export const BudgetItemCategory = $Enums.BudgetItemCategory;

// Re-export enum types - these can be used for type annotations
export type NotificationType = $Enums.NotificationType;
export type UserRole = $Enums.UserRole;
export type EventStatus = $Enums.EventStatus;
export type BudgetItemCategory = $Enums.BudgetItemCategory;

export * from "./client";


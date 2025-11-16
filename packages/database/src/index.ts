export { PrismaClient } from "@prisma/client";

// Re-export Prisma enums directly - Prisma exports them as both const and type
// Using type-only import first to get the types, then importing values
import type { UserRole as UserRoleType, EventStatus as EventStatusType, BudgetItemCategory as BudgetItemCategoryType, NotificationType as NotificationTypeType } from "@prisma/client";

// Import enum values using require to avoid TypeScript resolution issues
const prismaClient = require("@prisma/client");

// Re-export enum values (const objects) - these can be used at runtime
export const UserRole = prismaClient.UserRole;
export const EventStatus = prismaClient.EventStatus;
export const BudgetItemCategory = prismaClient.BudgetItemCategory;
export const NotificationType = prismaClient.NotificationType;

// Re-export enum types - these can be used for type annotations
export type UserRole = UserRoleType;
export type EventStatus = EventStatusType;
export type BudgetItemCategory = BudgetItemCategoryType;
export type NotificationType = NotificationTypeType;

export * from "./client";


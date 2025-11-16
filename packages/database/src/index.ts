export { PrismaClient } from "@prisma/client";

// Import enum values using require to avoid TypeScript resolution issues
const prismaClient = require("@prisma/client");

// Re-export enum values (const objects) - these can be used at runtime
export const UserRole = prismaClient.UserRole;
export const EventStatus = prismaClient.EventStatus;
export const BudgetItemCategory = prismaClient.BudgetItemCategory;
export const NotificationType = prismaClient.NotificationType;

// Define enum types based on the actual enum values
// This ensures TypeScript can resolve the types correctly
export type UserRole = typeof UserRole[keyof typeof UserRole];
export type EventStatus = typeof EventStatus[keyof typeof EventStatus];
export type BudgetItemCategory = typeof BudgetItemCategory[keyof typeof BudgetItemCategory];
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export * from "./client";


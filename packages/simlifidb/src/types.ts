// Re-export Prisma enums
// TypeScript workaround: Define enum to match Prisma's generated enum
// At runtime, Prisma client will provide the actual enum values
export enum NotificationType {
  Info = "Info",
  Warning = "Warning",
  Error = "Error",
  Success = "Success",
}


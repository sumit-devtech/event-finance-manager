export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  FINANCE: "finance",
  VIEWER: "viewer",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "users:create",
    "users:update",
    "users:delete",
    "events:create",
    "events:update",
    "events:delete",
    "budgets:create",
    "budgets:update",
    "budgets:finalize",
    "expenses:create",
    "expenses:approve",
    "vendors:create",
    "vendors:update",
    "vendors:delete",
    "reports:generate",
    "organizations:update",
  ],
  manager: [
    "events:create",
    "events:update",
    "budgets:create",
    "budgets:update",
    "expenses:create",
    "expenses:approve",
    "vendors:create",
    "vendors:update",
    "reports:generate",
  ],
  finance: [
    "budgets:view",
    "budgets:update",
    "expenses:create",
    "expenses:approve",
    "expenses:view",
    "reports:generate",
  ],
  viewer: [
    "events:view",
    "budgets:view",
    "expenses:view",
    "vendors:view",
    "reports:view",
  ],
};

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}


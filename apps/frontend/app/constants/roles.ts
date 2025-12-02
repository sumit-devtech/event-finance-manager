/**
 * User role and permission constants
 */

export const USER_ROLES = {
  ADMIN: 'Admin',
  ADMIN_LOWERCASE: 'admin',
  EVENT_MANAGER: 'EventManager',
  FINANCE: 'Finance',
  VIEWER: 'Viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_PERMISSIONS = {
  // Expense permissions
  CAN_CREATE_EXPENSE: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE, USER_ROLES.EVENT_MANAGER, USER_ROLES.FINANCE],
  CAN_APPROVE_EXPENSE: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE, USER_ROLES.EVENT_MANAGER],
  
  // Event permissions
  CAN_CREATE_EVENT: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE, USER_ROLES.EVENT_MANAGER],
  CAN_EDIT_EVENT: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE, USER_ROLES.EVENT_MANAGER],
  CAN_DELETE_EVENT: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE],
  
  // Budget permissions
  CAN_MANAGE_BUDGET: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE, USER_ROLES.EVENT_MANAGER, USER_ROLES.FINANCE],
  
  // Vendor permissions
  CAN_MANAGE_VENDORS: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE, USER_ROLES.EVENT_MANAGER, USER_ROLES.FINANCE],
  
  // Reports permissions
  CAN_VIEW_REPORTS: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE, USER_ROLES.EVENT_MANAGER, USER_ROLES.FINANCE],
  
  // User management permissions
  CAN_MANAGE_USERS: [USER_ROLES.ADMIN, USER_ROLES.ADMIN_LOWERCASE],
} as const;

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: string | null | undefined, permission: readonly string[]): boolean {
  if (!role) return false;
  return permission.includes(role);
}

/**
 * Check if user is admin (case-insensitive)
 */
export function isAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  return role === USER_ROLES.ADMIN || role === USER_ROLES.ADMIN_LOWERCASE;
}



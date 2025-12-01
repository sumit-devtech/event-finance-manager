import type { User } from "~/lib/auth";

interface RoleAccess {
  isAdmin: boolean;
  isEventManager: boolean;
  isFinance: boolean;
  isViewer: boolean;
  canCreateEvent: boolean;
  canEditEvent: (event?: { createdBy?: string | null; assignments?: Array<{ userId?: string }> }) => boolean;
  canDeleteEvent: boolean;
  canManageBudget: boolean;
  canViewReports: boolean;
  canCreateExpense: boolean;
  canApproveExpense: boolean;
  canPerformBulkActions: boolean;
}

/**
 * Hook to centralize role-based access control logic
 * @param user - Current user object
 * @param isDemo - Whether in demo mode (grants all permissions)
 * @returns Object with boolean flags for various permissions
 */
export function useRoleAccess(user: User | null, isDemo = false): RoleAccess {
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin' || isDemo;
  const isEventManager = user?.role === 'EventManager' || isDemo;
  const isFinance = user?.role === 'Finance' || isDemo;
  const isViewer = user?.role === 'Viewer' || isDemo;

  const canCreateEvent = isAdmin || isEventManager || isDemo;
  
  const canEditEvent = (event?: { createdBy?: string | null; assignments?: Array<{ userId?: string }> }) => {
    if (isDemo) return true;
    if (isAdmin) return true;
    if (isEventManager && event) {
      const isCreator = event.createdBy === user?.id;
      const isAssigned = event.assignments?.some((a) => a.userId === user?.id);
      return isCreator || isAssigned;
    }
    return false;
  };

  const canDeleteEvent = isAdmin || isDemo;
  const canManageBudget = !isViewer || isDemo;
  const canViewReports = isAdmin || isEventManager || isFinance || isDemo;
  const canCreateExpense = isAdmin || isEventManager || isFinance || isDemo;
  const canApproveExpense = isAdmin || isEventManager || isDemo;
  const canPerformBulkActions = isAdmin || isEventManager || isDemo;

  return {
    isAdmin,
    isEventManager,
    isFinance,
    isViewer,
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,
    canManageBudget,
    canViewReports,
    canCreateExpense,
    canApproveExpense,
    canPerformBulkActions,
  };
}



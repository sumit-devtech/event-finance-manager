/**
 * Hook for budget-related permissions
 */

import { useMemo } from 'react';
import { BUDGET_ROLE_PERMISSIONS } from '~/constants/budget';
import { USER_ROLES } from '~/constants/roles';
import type { User } from '~/lib/auth';

export function useBudgetPermissions(user: User | null, isDemo: boolean) {
  return useMemo(() => {
    if (isDemo) {
      return {
        canEditBudget: true,
        canEditEstimated: true,
        canEditActual: true,
        canEditAll: true,
        isViewer: false,
      };
    }

    const userRole = user?.role?.toLowerCase() || '';
    const isViewer = user?.role === USER_ROLES.VIEWER;

    return {
      canEditBudget: !isViewer,
      canEditEstimated: BUDGET_ROLE_PERMISSIONS.CAN_EDIT_ESTIMATED.includes(userRole as any),
      canEditActual: BUDGET_ROLE_PERMISSIONS.CAN_EDIT_ACTUAL.includes(userRole as any),
      canEditAll: BUDGET_ROLE_PERMISSIONS.CAN_EDIT_ALL.includes(userRole as any),
      isViewer,
    };
  }, [user, isDemo]);
}


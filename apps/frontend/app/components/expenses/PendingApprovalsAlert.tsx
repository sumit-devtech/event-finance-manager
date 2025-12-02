/**
 * Pending Approvals Alert Component
 */

import { AlertCircle } from "~/components/Icons";
import { EXPENSE_LABELS } from "~/constants/expenses";

interface PendingApprovalsAlertProps {
  pendingCount: number;
  pendingTotal: number;
}

export function PendingApprovalsAlert({
  pendingCount,
  pendingTotal,
}: PendingApprovalsAlertProps) {
  if (pendingCount === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-yellow-800 font-medium">
          {EXPENSE_LABELS.PENDING_APPROVALS_ALERT(pendingCount)}
        </p>
        <p className="text-yellow-700 text-sm mt-1">
          {EXPENSE_LABELS.TOTAL_PENDING_AMOUNT(`$${pendingTotal.toLocaleString()}`)}
        </p>
      </div>
    </div>
  );
}



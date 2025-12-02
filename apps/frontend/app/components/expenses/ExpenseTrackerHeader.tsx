/**
 * Expense Tracker Header Component
 */

import { Plus } from "~/components/Icons";
import { EXPENSE_LABELS } from "~/constants/expenses";

interface ExpenseTrackerHeaderProps {
  canCreateExpense: boolean;
  onAddExpense: () => void;
  isDemo?: boolean;
}

export function ExpenseTrackerHeader({
  canCreateExpense,
  onAddExpense,
  isDemo = false,
}: ExpenseTrackerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{EXPENSE_LABELS.EXPENSE_TRACKER}</h2>
        <p className="text-gray-600 mt-1">{EXPENSE_LABELS.TRACK_AND_APPROVE}</p>
        {isDemo && (
          <p className="text-yellow-700 text-sm mt-2">Demo Mode: Changes are not saved</p>
        )}
      </div>
      {canCreateExpense && (
        <button
          onClick={onAddExpense}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition-colors"
        >
          <Plus size={20} />
          <span>{EXPENSE_LABELS.SUBMIT_EXPENSE}</span>
        </button>
      )}
    </div>
  );
}



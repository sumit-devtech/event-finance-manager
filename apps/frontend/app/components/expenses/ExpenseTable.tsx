/**
 * Expense Table Component
 */

import { Download, Check, X } from "~/components/Icons";
import { DataTable, EmptyState } from "~/components/shared";
import { AlertCircle } from "~/components/Icons";
import { EXPENSE_LABELS, EXPENSE_STATUS } from "~/constants/expenses";
import { getExpenseStatusColor } from "~/lib/utils";
import { getStatusIcon } from "./utils/expenseHelpers";
import type { TransformedExpense } from "./utils/expenseTransformers";
import type { TableColumn } from "~/types";

interface ExpenseTableProps {
  expenses: TransformedExpense[];
  searchQuery: string;
  onRowClick: (expense: TransformedExpense) => void;
  onApprove: (id: string | number) => void;
  onReject: (id: string | number) => void;
  canApprove: boolean;
}

export function ExpenseTable({
  expenses,
  searchQuery,
  onRowClick,
  onApprove,
  onReject,
  canApprove,
}: ExpenseTableProps) {
  const columns: TableColumn<TransformedExpense>[] = [
    {
      key: "date",
      label: "Date",
      render: (expense) => new Date(expense.date).toLocaleDateString(),
    },
    {
      key: "event",
      label: "Event",
    },
    {
      key: "item",
      label: "Item",
      render: (expense) => (
        <div>
          <p className="text-gray-900 font-medium">{expense.item}</p>
          <p className="text-sm text-gray-500">{expense.category}</p>
        </div>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (expense) => (
        <span className="font-semibold">${expense.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "submittedBy",
      label: "Submitted By",
    },
    {
      key: "status",
      label: "Status",
      render: (expense) => (
        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${getExpenseStatusColor(expense.status)}`}>
          {getStatusIcon(expense.status)}
          {expense.status}
        </span>
      ),
    },
  ];

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} className="text-gray-400" />}
        title={EXPENSE_LABELS.NO_EXPENSES_FOUND}
        description={searchQuery ? EXPENSE_LABELS.TRY_ADJUSTING_SEARCH : EXPENSE_LABELS.NO_EXPENSES_SUBMITTED}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{EXPENSE_LABELS.EXPENSE_SUBMISSIONS}</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={16} />
          <span>{EXPENSE_LABELS.EXPORT}</span>
        </button>
      </div>
      <div className="p-6">
        <DataTable
          columns={columns}
          data={expenses}
          onRowClick={onRowClick}
          actions={(expense) => (
            <div className="flex items-center justify-center gap-2">
              {expense.status === EXPENSE_STATUS.PENDING && canApprove && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(expense.id);
                    }}
                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                    title={EXPENSE_LABELS.APPROVE}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(expense.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                    title={EXPENSE_LABELS.REJECT}
                  >
                    <X size={16} />
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(expense);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {EXPENSE_LABELS.VIEW}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}



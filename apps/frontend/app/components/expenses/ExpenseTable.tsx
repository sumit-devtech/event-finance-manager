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
        title={searchQuery ? EXPENSE_LABELS.NO_EXPENSES_FOUND : EXPENSE_LABELS.NO_EXPENSES_SUBMITTED}
        description={searchQuery ? EXPENSE_LABELS.TRY_ADJUSTING_SEARCH : undefined}
      />
    );
  }

  return (
    <div className="bg-white rounded-[6px] border border-[#E2E2E2]">
      <div className="p-6 border-b border-[#E2E2E2] flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1A1A1A]">{EXPENSE_LABELS.EXPENSE_SUBMISSIONS}</h3>
        <button className="flex items-center gap-2 px-4 h-9 border border-[#E2E2E2] rounded-[6px] hover:bg-[#F3F3F6] transition-colors text-sm text-[#5E5E5E]">
          <Download size={16} />
          <span>{EXPENSE_LABELS.EXPORT}</span>
        </button>
      </div>
      <div className="p-6">
        <DataTable
          columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
          data={expenses as unknown as Record<string, unknown>[]}
          onRowClick={onRowClick as (item: Record<string, unknown>) => void}
          actions={(expense) => {
            const typedExpense = expense as TransformedExpense;
            return (
              <div className="flex items-center justify-center gap-2">
                {typedExpense.status === EXPENSE_STATUS.PENDING && canApprove && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(typedExpense.id);
                      }}
                      className="p-2 hover:bg-[#1BBE63]/10 rounded-[6px] text-[#1BBE63] transition-colors"
                      title={EXPENSE_LABELS.APPROVE}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(typedExpense.id);
                      }}
                      className="p-2 hover:bg-[#D92C2C]/10 rounded-[6px] text-[#D92C2C] transition-colors"
                      title={EXPENSE_LABELS.REJECT}
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(typedExpense);
                  }}
                  className="text-[#672AFA] hover:text-[#5A1FE6] text-sm font-medium"
                >
                  {EXPENSE_LABELS.VIEW}
                </button>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}



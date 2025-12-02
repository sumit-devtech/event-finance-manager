/**
 * Expense Summary Statistics Component
 */

import { SummaryStats } from "~/components/shared";
import { EXPENSE_LABELS } from "~/constants/expenses";
import type { SummaryStat } from "~/types";

interface ExpenseSummaryStatsProps {
  totalExpenses: number;
  approvedTotal: number;
  pendingTotal: number;
  expensesCount: number;
  approvedCount: number;
  pendingCount: number;
}

export function ExpenseSummaryStats({
  totalExpenses,
  approvedTotal,
  pendingTotal,
  expensesCount,
  approvedCount,
  pendingCount,
}: ExpenseSummaryStatsProps) {
  const stats: SummaryStat[] = [
    {
      label: EXPENSE_LABELS.TOTAL_EXPENSES,
      value: `$${totalExpenses.toLocaleString()}`,
      description: `${expensesCount} submissions`,
    },
    {
      label: EXPENSE_LABELS.APPROVED,
      value: `$${approvedTotal.toLocaleString()}`,
      description: `${approvedCount} expenses`,
      color: "text-green-600",
    },
    {
      label: EXPENSE_LABELS.PENDING_APPROVAL,
      value: `$${pendingTotal.toLocaleString()}`,
      description: `${pendingCount} expenses`,
      color: "text-yellow-600",
    },
  ];

  return <SummaryStats stats={stats} />;
}



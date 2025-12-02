/**
 * Expense Filters Component
 */

import { FilterBar } from "~/components/shared";
import { EXPENSE_LABELS, EXPENSE_STATUS, EXPENSE_STATUS_LABELS } from "~/constants/expenses";
import type { FilterConfig } from "~/types";

interface ExpenseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (value: string) => void;
  statusCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function ExpenseFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  statusCounts,
}: ExpenseFiltersProps) {
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: EXPENSE_LABELS.STATUS,
      type: "select",
      value: filterStatus,
      onChange: onFilterChange,
      options: [
        { value: EXPENSE_STATUS.ALL, label: `${EXPENSE_STATUS_LABELS[EXPENSE_STATUS.ALL]} (${statusCounts.all})` },
        { value: EXPENSE_STATUS.PENDING, label: `${EXPENSE_STATUS_LABELS[EXPENSE_STATUS.PENDING]} (${statusCounts.pending})` },
        { value: EXPENSE_STATUS.APPROVED, label: `${EXPENSE_STATUS_LABELS[EXPENSE_STATUS.APPROVED]} (${statusCounts.approved})` },
        { value: EXPENSE_STATUS.REJECTED, label: `${EXPENSE_STATUS_LABELS[EXPENSE_STATUS.REJECTED]} (${statusCounts.rejected})` },
      ],
    },
  ];

  return (
    <FilterBar
      searchPlaceholder={EXPENSE_LABELS.SEARCH_PLACEHOLDER}
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      filters={filters}
    />
  );
}



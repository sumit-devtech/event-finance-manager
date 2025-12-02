/**
 * Hook for filtering expenses
 */

import { useState, useMemo } from 'react';
import { EXPENSE_STATUS } from "~/constants/expenses";
import type { TransformedExpense } from '../utils/expenseTransformers';

export function useExpenseFilters(expenses: TransformedExpense[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(EXPENSE_STATUS.ALL);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = 
        expense.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.event.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === EXPENSE_STATUS.ALL || expense.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [expenses, searchQuery, filterStatus]);

  return {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filteredExpenses,
  };
}



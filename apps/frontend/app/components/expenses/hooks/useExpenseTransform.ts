/**
 * Hook for transforming expense data
 */

import { useState, useEffect } from 'react';
import { transformExpenses, type TransformedExpense } from '../utils/expenseTransformers';
import type { ExpenseWithVendor } from "~/types";

export function useExpenseTransform(
  initialExpenses: ExpenseWithVendor[],
  isDemo: boolean,
  demoExpenses?: TransformedExpense[]
) {
  const [expenses, setExpenses] = useState<TransformedExpense[]>(() => {
    if (isDemo && demoExpenses) {
      return demoExpenses;
    }
    return transformExpenses(initialExpenses);
  });

  useEffect(() => {
    if (isDemo) {
      // Keep demo expenses as-is
      return;
    }
    // Always sync when initialExpenses changes (including empty array)
    const transformed = transformExpenses(initialExpenses);
    setExpenses(transformed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExpenses, isDemo]);

  return { expenses, setExpenses };
}



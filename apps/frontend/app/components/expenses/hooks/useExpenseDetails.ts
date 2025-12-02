/**
 * Hook for fetching expense details
 */

import { useState } from 'react';
import { useFetcher } from "@remix-run/react";
import { EXPENSE_INTENTS } from "~/constants/expenses";

export function useExpenseDetails(isDemo: boolean) {
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [loadingExpenseDetails, setLoadingExpenseDetails] = useState(false);
  const expenseDetailsFetcher = useFetcher();

  const handleViewExpense = async (expense: any) => {
    // Show modal immediately with available data
    // The expense might be in transformed format, so extract original if available
    const expenseToShow = expense._original || expense;

    setSelectedExpense(expenseToShow);
    setShowExpenseDetails(true);
    setLoadingExpenseDetails(true);

    if (!isDemo) {
      // Ensure expense ID is a string - use original expense if available
      const expenseId = String(expenseToShow.id);

      setLoadingExpenseDetails(true);

      // Use Remix fetcher to fetch expense details through server-side action
      const formData = new FormData();
      formData.append("intent", EXPENSE_INTENTS.GET_EXPENSE_DETAILS);
      formData.append("expenseId", expenseId);

      expenseDetailsFetcher.submit(formData, {
        method: "POST",
        action: "/expenses",
      });
    } else {
      setLoadingExpenseDetails(false);
    }
  };

  const handleCloseExpenseDetails = () => {
    setShowExpenseDetails(false);
    setSelectedExpense(null);
  };

  return {
    selectedExpense,
    showExpenseDetails,
    loadingExpenseDetails,
    handleViewExpense,
    handleCloseExpenseDetails,
    expenseDetailsFetcher,
  };
}



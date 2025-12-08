/**
 * Hook for budget item actions (approve, reject)
 */

import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { BUDGET_ITEM_STATUS } from "~/constants/budget";
import type { User } from "~/lib/auth";

interface UseBudgetItemActionsProps {
  fetcher?: ReturnType<typeof useFetcher>;
  isDemo: boolean;
  user: User | null;
}

export function useBudgetItemActions({
  fetcher,
  isDemo,
  user,
}: UseBudgetItemActionsProps) {
  // Track which budget item ID is currently being processed
  const processingBudgetItemIdRef = useRef<string | number | null>(null);

  // Handle fetcher errors and success
  useEffect(() => {
    if (!fetcher || fetcher.state !== "idle") {
      return;
    }

    const fetcherData = fetcher.data as { error?: string; success?: boolean; message?: string } | undefined;
    
    // Handle errors
    if (fetcherData?.error) {
      processingBudgetItemIdRef.current = null;
      toast.error(fetcherData.error);
    } else if (fetcherData?.success) {
      // Success case - clear the processing state and show success message
      processingBudgetItemIdRef.current = null;
      
      // Show success message if provided
      if (fetcherData.message) {
        toast.success(fetcherData.message);
      }
    }
  }, [fetcher?.state, fetcher?.data]);

  const handleApprove = (id: string | number) => {
    // Track which budget item is being processed
    processingBudgetItemIdRef.current = id;

    if (isDemo) {
      toast.success("Budget item approved successfully (Demo Mode)");
      processingBudgetItemIdRef.current = null;
      return;
    }

    if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "approveBudgetItem");
      formDataToSubmit.append("budgetItemId", String(id));

      fetcher.submit(formDataToSubmit, { method: "post" });
    }
  };

  const handleReject = (id: string | number) => {
    // Track which budget item is being processed
    processingBudgetItemIdRef.current = id;

    if (isDemo) {
      toast.success("Budget item rejected (Demo Mode)");
      processingBudgetItemIdRef.current = null;
      return;
    }

    if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "rejectBudgetItem");
      formDataToSubmit.append("budgetItemId", String(id));

      fetcher.submit(formDataToSubmit, { method: "post" });
    }
  };

  return {
    handleApprove,
    handleReject,
  };
}


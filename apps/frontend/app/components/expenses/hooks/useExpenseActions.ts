/**
 * Hook for expense actions (approve, reject, submit)
 */

import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { EXPENSE_INTENTS, EXPENSE_MESSAGES, DEFAULT_EXPENSE_VALUES, EXPENSE_STATUS } from "~/constants/expenses";
import type { ExpenseFormData } from "~/components/shared";
import type { TransformedExpense } from '../utils/expenseTransformers';
import type { User } from "~/lib/auth";
import type { EventWithDetails, VendorWithStats } from "~/types";

interface UseExpenseActionsProps {
  expenses: TransformedExpense[];
  setExpenses: (expenses: TransformedExpense[] | ((prev: TransformedExpense[]) => TransformedExpense[])) => void;
  fetcher?: ReturnType<typeof useFetcher>;
  isDemo: boolean;
  user: User | null;
  events: EventWithDetails[];
  vendors: VendorWithStats[];
  event?: EventWithDetails | null;
}

export function useExpenseActions({
  expenses,
  setExpenses,
  fetcher,
  isDemo,
  user,
  events,
  vendors,
  event,
}: UseExpenseActionsProps) {
  // Track previous expense states for error recovery (keyed by expense ID)
  const previousExpenseStatesRef = useRef<Map<string | number, TransformedExpense>>(new Map());
  // Track which expense ID is currently being processed
  const processingExpenseIdRef = useRef<string | number | null>(null);

  // Handle fetcher errors and revert optimistic updates if needed
  useEffect(() => {
    if (!fetcher || fetcher.state !== "idle") {
      return;
    }

    const fetcherData = fetcher.data as { error?: string; success?: boolean; message?: string } | undefined;
    
    // Handle errors
    if (fetcherData?.error) {
      const expenseId = processingExpenseIdRef.current;
      
      // Only revert the specific expense that had the error
      if (expenseId) {
        const previousState = previousExpenseStatesRef.current.get(expenseId);
        if (previousState) {
          setExpenses(prevExpenses => {
            return prevExpenses.map(exp => 
              exp.id === expenseId ? previousState : exp
            );
          });
          previousExpenseStatesRef.current.delete(expenseId);
        }
      }
      
      // Clear processing state
      processingExpenseIdRef.current = null;
      
      // Show error message
      toast.error(fetcherData.error);
    } else if (fetcherData?.success) {
      // Success case - clear the processing state and show success message
      const expenseId = processingExpenseIdRef.current;
      if (expenseId) {
        previousExpenseStatesRef.current.delete(expenseId);
        processingExpenseIdRef.current = null;
      }
      
      // Show success message if provided
      if (fetcherData.message) {
        toast.success(fetcherData.message);
      }
    }
  }, [fetcher?.state, fetcher?.data, setExpenses]);
  const handleWizardSubmit = async (wizardData: ExpenseFormData) => {
    if (isDemo) {
      setExpenses([
        ...expenses,
        {
          id: Date.now(),
          event: events.find(e => e.id === wizardData.eventId)?.name || DEFAULT_EXPENSE_VALUES.EVENT_NAME,
          category: wizardData.category,
          item: wizardData.title,
          amount: parseFloat(wizardData.amount) || 0,
          vendor: vendors.find(v => v.id === wizardData.vendorId)?.name || DEFAULT_EXPENSE_VALUES.VENDOR,
          date: wizardData.date,
          submittedBy: user?.name || DEFAULT_EXPENSE_VALUES.USER,
          status: EXPENSE_STATUS.PENDING,
          notes: wizardData.description,
          _original: {},
        },
      ]);
      toast.success(EXPENSE_MESSAGES.SUBMITTED_SUCCESS_DEMO);
      return;
    }

    if (!fetcher) {
      toast.error(EXPENSE_MESSAGES.UNABLE_TO_SUBMIT);
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", EXPENSE_INTENTS.CREATE_EXPENSE);
      formDataToSubmit.append("eventId", wizardData.eventId);
      formDataToSubmit.append("category", wizardData.category);
      formDataToSubmit.append("title", wizardData.title);
      formDataToSubmit.append("amount", wizardData.amount);
      if (wizardData.vendorId) formDataToSubmit.append("vendorId", wizardData.vendorId);
      if (wizardData.description) formDataToSubmit.append("description", wizardData.description);
      if (wizardData.file) {
        formDataToSubmit.append("file", wizardData.file);
      }

      // Submit to the event route if we have an event, otherwise submit to expenses route
      const actionUrl = event?.id ? `/events/${event.id}` : "/expenses";
      fetcher.submit(formDataToSubmit, { method: "post", action: actionUrl });
      // Note: Wizard will close when fetcher completes successfully (handled in ExpenseTracker useEffect)
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast.error(EXPENSE_MESSAGES.FAILED_TO_SUBMIT);
      throw error;
    }
  };

  const handleApprove = (id: string | number) => {
    // Find the expense to approve
    const expenseToApprove = expenses.find(exp => exp.id === id);
    if (!expenseToApprove) return;

    // Track which expense is being processed
    processingExpenseIdRef.current = id;
    
    // Store previous state for error recovery
    if (!isDemo) {
      previousExpenseStatesRef.current.set(id, expenseToApprove);
    }

    // Don't do optimistic update - let server data refresh handle it

    if (isDemo) {
      // For demo, update optimistically
      setExpenses(
        expenses.map(exp =>
          exp.id === id
            ? { ...exp, status: EXPENSE_STATUS.APPROVED, approver: user?.name || DEFAULT_EXPENSE_VALUES.APPROVER }
            : exp
        )
      );
      toast.success("Expense approved successfully (Demo Mode)");
      processingExpenseIdRef.current = null;
      return;
    }

    if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", EXPENSE_INTENTS.APPROVE);
      formDataToSubmit.append("expenseId", String(id));

      // Submit to the event route if we have an event, otherwise submit to expenses route
      const actionUrl = event?.id ? `/events/${event.id}` : "/expenses";
      fetcher.submit(formDataToSubmit, { method: "post", action: actionUrl });
    }
  };

  const handleReject = (id: string | number) => {
    // Find the expense to reject
    const expenseToReject = expenses.find(exp => exp.id === id);
    if (!expenseToReject) return;

    // Track which expense is being processed
    processingExpenseIdRef.current = id;

    // Store previous state for error recovery
    if (!isDemo) {
      previousExpenseStatesRef.current.set(id, expenseToReject);
    }

    // Optimistically update state immediately for better UX
    setExpenses(
      expenses.map(exp =>
        exp.id === id
          ? { ...exp, status: EXPENSE_STATUS.REJECTED, approver: user?.name || DEFAULT_EXPENSE_VALUES.APPROVER }
          : exp
      )
    );

    if (isDemo) {
      toast.success("Expense rejected (Demo Mode)");
      processingExpenseIdRef.current = null;
      return;
    }

    if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", EXPENSE_INTENTS.REJECT);
      formDataToSubmit.append("expenseId", String(id));

      // Submit to the event route if we have an event, otherwise submit to expenses route
      const actionUrl = event?.id ? `/events/${event.id}` : "/expenses";
      fetcher.submit(formDataToSubmit, { method: "post", action: actionUrl });
    }
  };

  return {
    handleWizardSubmit,
    handleApprove,
    handleReject,
  };
}



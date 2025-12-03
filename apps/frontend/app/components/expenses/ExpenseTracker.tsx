/**
 * Expense Tracker - Main Component
 * 
 * Orchestrates all expense-related functionality using smaller sub-components.
 */

import { useState, useEffect, useRef } from 'react';
import { useFetcher } from "@remix-run/react";
import type { User } from "~/lib/auth";
import type { ExpenseWithVendor, VendorWithStats, EventWithDetails } from "~/types";
import { ExpenseWizard } from "~/components/shared";
import toast from "react-hot-toast";
import { EXPENSE_STATUS, EXPENSE_MESSAGES } from "~/constants/expenses";
import { ROLE_PERMISSIONS, hasPermission } from "~/constants/roles";
import { demoExpenseTrackerExpenses } from "~/lib/demoData";
import { useExpenseTransform } from "./hooks/useExpenseTransform";
import { useExpenseFilters } from "./hooks/useExpenseFilters";
import { useExpenseActions } from "./hooks/useExpenseActions";
import { useExpenseDetails } from "./hooks/useExpenseDetails";
import { calculateExpenseStats } from "./utils/expenseHelpers";
import { ExpenseTrackerHeader } from "./ExpenseTrackerHeader";
import { ExpenseSummaryStats } from "./ExpenseSummaryStats";
import { ExpenseFilters } from "./ExpenseFilters";
import { ExpenseTable } from "./ExpenseTable";
import { PendingApprovalsAlert } from "./PendingApprovalsAlert";
import { ExpenseDetailsModal } from "./ExpenseDetailsModal";
import type { TransformedExpense } from "./utils/expenseTransformers";

interface ExpenseTrackerProps {
  user: User | null;
  organization?: { name?: string } | null;
  event?: EventWithDetails | null;
  expenses?: ExpenseWithVendor[];
  events?: EventWithDetails[];
  vendors?: VendorWithStats[];
  isDemo?: boolean;
  fetcher?: ReturnType<typeof useFetcher>;
}

export function ExpenseTracker({
  user,
  organization,
  event,
  expenses: initialExpenses = [],
  events = [],
  vendors = [],
  isDemo = false,
  fetcher,
}: ExpenseTrackerProps) {
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Transform expenses
  const demoExpenses = isDemo
    ? demoExpenseTrackerExpenses.map(exp => ({
        ...exp,
        event: event?.name || exp.event,
        submittedBy: user?.name || exp.submittedBy,
      }))
    : undefined;

  const { expenses, setExpenses } = useExpenseTransform(initialExpenses, isDemo, demoExpenses);

  // Filters
  const { searchQuery, setSearchQuery, filterStatus, setFilterStatus, filteredExpenses } =
    useExpenseFilters(expenses);

  // Expense details
  const {
    selectedExpense,
    showExpenseDetails,
    loadingExpenseDetails,
    handleViewExpense,
    handleCloseExpenseDetails,
  } = useExpenseDetails(isDemo);

  // Role-based access control
  const userRole = user?.role || null;
  const canCreateExpense =
    hasPermission(userRole, ROLE_PERMISSIONS.CAN_CREATE_EXPENSE) || isDemo;
  const canApproveExpense =
    hasPermission(userRole, ROLE_PERMISSIONS.CAN_APPROVE_EXPENSE) || isDemo;

  // Actions
  const { handleWizardSubmit, handleApprove, handleReject } = useExpenseActions({
    expenses,
    setExpenses,
    fetcher,
    isDemo,
    user,
    events,
    vendors,
    event,
  });

  // Track previous fetcher state to detect transitions
  const prevFetcherStateRef = useRef<string | undefined>(undefined);
  const submissionIntentRef = useRef<string | null>(null);

  // Handle fetcher state changes
  useEffect(() => {
    if (!fetcher) {
      return;
    }

    const prevState = prevFetcherStateRef.current;
    const currentState = fetcher.state;

    // Track when a submission starts (check formData to confirm it's an expense submission)
    if (currentState === "submitting" && fetcher.formData && fetcher.formMethod === "post") {
      const intent = fetcher.formData.get("intent");
      if (intent === "createExpense") {
        submissionIntentRef.current = "createExpense";
      }
    }

    // Only process when fetcher transitions from submitting to idle (meaning a submission just completed)
    // AND we have a tracked submission intent
    // AND the modal is currently open
    if (
      prevState === "submitting" && 
      currentState === "idle" && 
      submissionIntentRef.current === "createExpense" &&
      showAddExpense
    ) {
      // Clear the intent
      submissionIntentRef.current = null;

      // When fetcher completes, check for errors or success
      if (fetcher.data) {
        const fetcherData = fetcher.data as any;

        // Check for error
        if (typeof fetcherData === 'object' && 'error' in fetcherData) {
          toast.error(fetcherData.error);
          // Don't close wizard on error - let user retry
          prevFetcherStateRef.current = currentState;
          return;
        }
      }

      // Success case - close wizard and refresh data
      // For redirects, fetcher.data will be undefined but state will be idle
      // The route will revalidate and initialExpenses will update via useExpenseTransform
      setShowAddExpense(false);
      // Show success message
      toast.success('Expense submitted successfully');
      // Reset wizard form state by triggering a re-render
      // The ExpenseWizard will reset when isOpen becomes false
      // Note: Data will refresh via route revalidation after redirect
    }
    
    // Update ref AFTER checking condition
    prevFetcherStateRef.current = currentState;
  }, [fetcher?.state, fetcher?.data, fetcher?.formData, showAddExpense]);

  // Calculate statistics
  const { statusCounts, totalExpenses, approvedTotal, pendingTotal } =
    calculateExpenseStats(expenses);

  // Handle approve/reject with modal close
  const handleApproveWithClose = () => {
    if (selectedExpense) {
      handleApprove(selectedExpense.id);
      handleCloseExpenseDetails();
    }
  };

  const handleRejectWithClose = () => {
    if (selectedExpense) {
      handleReject(selectedExpense.id);
      handleCloseExpenseDetails();
    }
  };

  return (
    <div className="space-y-6">
      <ExpenseTrackerHeader
        canCreateExpense={canCreateExpense}
        onAddExpense={() => setShowAddExpense(true)}
        isDemo={isDemo}
      />

      <ExpenseSummaryStats
        totalExpenses={totalExpenses}
        approvedTotal={approvedTotal}
        pendingTotal={pendingTotal}
        expensesCount={expenses.length}
        approvedCount={statusCounts.approved}
        pendingCount={statusCounts.pending}
      />

      <ExpenseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        statusCounts={statusCounts}
      />

      <PendingApprovalsAlert
        pendingCount={statusCounts.pending}
        pendingTotal={pendingTotal}
      />

      <ExpenseTable
        expenses={filteredExpenses}
        searchQuery={searchQuery}
        onRowClick={handleViewExpense}
        onApprove={handleApprove}
        onReject={handleReject}
        canApprove={canApproveExpense}
      />

      <ExpenseWizard
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSubmit={handleWizardSubmit}
        events={events}
        vendors={vendors}
        event={event}
        isLoading={fetcher?.state === "submitting"}
      />

      {showExpenseDetails && selectedExpense && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          isOpen={showExpenseDetails}
          onClose={handleCloseExpenseDetails}
          isLoading={loadingExpenseDetails}
          canApprove={canApproveExpense}
          onApprove={handleApproveWithClose}
          onReject={handleRejectWithClose}
        />
      )}
    </div>
  );
}



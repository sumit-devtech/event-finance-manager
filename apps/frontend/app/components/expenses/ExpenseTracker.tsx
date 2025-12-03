/**
 * Expense Tracker - Main Component
 * 
 * Orchestrates all expense-related functionality using smaller sub-components.
 */

import { useState, useEffect, useRef } from 'react';
import { useFetcher, useRevalidator } from "@remix-run/react";
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
  const previousFetcherStateRef = useRef<string | undefined>(fetcher?.state);
  const wasSubmittingRef = useRef(false);
  const revalidator = useRevalidator();

  // Transform expenses
  const demoExpenses = isDemo
    ? demoExpenseTrackerExpenses.map(exp => {
        const transformed = {
          ...exp,
          event: event?.name || exp.event,
          submittedBy: user?.name || exp.submittedBy,
          _original: exp, // Add _original property required by TransformedExpense
        };
        return transformed;
      })
    : undefined;

  const { expenses, setExpenses } = useExpenseTransform(initialExpenses, isDemo, demoExpenses);

  // Filter expenses by event if event prop is provided
  const eventFilteredExpenses = event?.id 
    ? expenses.filter(exp => {
        // Check if expense belongs to the current event
        // The expense might have event as string (name) or object with id
        const expenseEventId = exp._original?.eventId || exp._original?.event?.id;
        return expenseEventId === event.id;
      })
    : expenses;

  // Filters
  const { searchQuery, setSearchQuery, filterStatus, setFilterStatus, filteredExpenses } =
    useExpenseFilters(eventFilteredExpenses);

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

  // Handle fetcher state changes - only close modal when transitioning from submitting to idle
  useEffect(() => {
    if (!fetcher) return;

    const currentState = fetcher.state;
    const previousState = previousFetcherStateRef.current;

    // Track when we start submitting
    if (currentState === "submitting" && previousState !== "submitting") {
      wasSubmittingRef.current = true;
    }

    // Only process when fetcher transitions from submitting to idle
    if (currentState === "idle" && wasSubmittingRef.current && previousState === "submitting") {
      // When fetcher completes, check for errors or success
      if (fetcher.data) {
        const fetcherData = fetcher.data as any;

        // Check for error
        if (typeof fetcherData === 'object' && 'error' in fetcherData) {
          toast.error(fetcherData.error);
          wasSubmittingRef.current = false;
          // Don't close wizard on error - let user retry
          previousFetcherStateRef.current = currentState;
          return;
        }
      }

      // Success case - close wizard and refresh data
      // For redirects, fetcher.data will be undefined but state will be idle
      // The route will revalidate and initialExpenses will update via useExpenseTransform
      if (showAddExpense) {
        setShowAddExpense(false);
        // Show success message
        toast.success(EXPENSE_MESSAGES.SUBMITTED_SUCCESS);
        // Revalidate to refresh expenses list
        // Add a small delay to allow the redirect to complete
        setTimeout(() => {
          revalidator.revalidate();
        }, 300);
        // Reset wizard form state by triggering a re-render
        // The ExpenseWizard will reset when isOpen becomes false
      }
      wasSubmittingRef.current = false;
    }

    // Update previous state
    previousFetcherStateRef.current = currentState;
  }, [fetcher?.state, fetcher?.data, showAddExpense]);

  // Calculate statistics (use event-filtered expenses if event is provided)
  const { statusCounts, totalExpenses, approvedTotal, pendingTotal } =
    calculateExpenseStats(eventFilteredExpenses);

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
        expensesCount={eventFilteredExpenses.length}
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
        events={
          // Ensure the current event is included in the events array
          event && !events.find(e => e.id === event.id)
            ? [...events, event]
            : events
        }
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



/**
 * Main Dashboard Component
 * Orchestrates all dashboard sub-components
 * Minimal code - only composition and prop passing
 */

import { Suspense, lazy, useMemo, useCallback } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DashboardAlerts } from "./DashboardAlerts";
import { DashboardBudgetOverview } from "./DashboardBudgetOverview";
import { DashboardRecentEvents } from "./DashboardRecentEvents";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardFreeTrialBanner } from "./DashboardFreeTrialBanner";
import { DashboardOrganizationInfo } from "./DashboardOrganizationInfo";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { calculateBudgetTotals } from "./utils/dashboardCalculations";
import type { DashboardProps } from "./types";
import type { User } from "~/lib/auth";

// Lazy load chart components for better performance
const LazyDashboardSpendChart = lazy(() =>
  import("./DashboardSpendChart").then((module) => ({
    default: module.DashboardSpendChart,
  }))
);
const LazyDashboardExpenseDistribution = lazy(() =>
  import("./DashboardExpenseDistribution").then((module) => ({
    default: module.DashboardExpenseDistribution,
  }))
);

/**
 * Skeleton loader for charts
 */
function ChartSkeleton() {
  return (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="h-[350px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
        <p>Loading chart...</p>
      </div>
    </div>
  );
}

/**
 * Main Dashboard component
 * Composes all dashboard sub-components
 * All calculations happen server-side, component only displays
 */
export function Dashboard({
  user,
  organization,
  events,
  stats,
  budgetData = [],
  expenseCategories = [],
  alerts = [],
  isDemo = false,
}: DashboardProps) {
  // Role-based access control (calculated once)
  const permissions = useMemo(() => {
    const isAdmin = user?.role === "Admin" || user?.role === "admin";
    const isEventManager = user?.role === "EventManager";
    const isFinance = user?.role === "Finance";
    const isViewer = user?.role === "Viewer";

    return {
      canCreateEvent: isAdmin || isEventManager || isDemo,
      canManageBudget: !isViewer || isDemo,
      canViewReports: isAdmin || isEventManager || isFinance || isDemo,
    };
  }, [user?.role, isDemo]);

  // Calculate budget totals (memoized)
  const budgetTotals = useMemo(() => calculateBudgetTotals(events), [events]);

  // Filter hooks with debouncing
  const { filters, setSelectedEventFilter, setDateRangeFilter } = useDashboardFilters();

  // Memoize handlers to prevent re-renders
  const handleEventFilterChange = useCallback(
    (value: string) => {
      setSelectedEventFilter(value);
    },
    [setSelectedEventFilter]
  );

  const handleDateRangeFilterChange = useCallback(
    (value: string) => {
      setDateRangeFilter(value);
    },
    [setDateRangeFilter]
  );

  // Free user check
  const isFreeUser = user?.subscription === "free";
  const freeEventsRemaining = user?.freeEventsRemaining || 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <DashboardHeader user={user} isDemo={isDemo} />

      {/* Free Trial Banner */}
      {isFreeUser && !isDemo && (
        <DashboardFreeTrialBanner freeEventsRemaining={freeEventsRemaining} />
      )}

      {/* Organization Info */}
      {organization && <DashboardOrganizationInfo organization={organization} />}

      {/* Budget Overview Stats */}
      <DashboardStats totals={budgetTotals} />

      {/* Alerts Section */}
      {alerts.length > 0 && <DashboardAlerts alerts={alerts} isDemo={isDemo} />}

      {/* Budget Overview by Category */}
      {expenseCategories.length > 0 && (
        <DashboardBudgetOverview expenseCategories={expenseCategories} />
      )}

      {/* Spend Over Time Chart - Lazy Loaded */}
      {budgetData.length > 0 && (
        <Suspense fallback={<ChartSkeleton />}>
          <LazyDashboardSpendChart
            budgetData={budgetData}
            events={events}
            selectedEventFilter={filters.selectedEventFilter}
            dateRangeFilter={filters.dateRangeFilter}
            onEventFilterChange={handleEventFilterChange}
            onDateRangeFilterChange={handleDateRangeFilterChange}
          />
        </Suspense>
      )}

      {/* Expense Distribution Chart - Lazy Loaded */}
      {expenseCategories.length > 0 && (
        <Suspense fallback={<ChartSkeleton />}>
          <LazyDashboardExpenseDistribution expenseCategories={expenseCategories} />
        </Suspense>
      )}

      {/* Recent Events */}
      {stats.recentEvents.length > 0 && (
        <DashboardRecentEvents events={stats.recentEvents} isDemo={isDemo} />
      )}

      {/* Quick Actions */}
      <DashboardQuickActions
        canCreateEvent={permissions.canCreateEvent}
        canManageBudget={permissions.canManageBudget}
        canViewReports={permissions.canViewReports}
        isDemo={isDemo}
      />
    </div>
  );
}


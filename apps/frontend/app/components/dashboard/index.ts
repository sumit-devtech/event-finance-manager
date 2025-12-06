/**
 * Barrel exports for dashboard components
 * Centralized exports for easy imports
 */

// Components
export { Dashboard } from "./Dashboard";
export { DashboardHeader } from "./DashboardHeader";
export { DashboardStats } from "./DashboardStats";
export { DashboardAlerts } from "./DashboardAlerts";
export { DashboardBudgetOverview } from "./DashboardBudgetOverview";
export { DashboardSpendChart } from "./DashboardSpendChart";
export { DashboardExpenseDistribution } from "./DashboardExpenseDistribution";
export { DashboardRecentEvents } from "./DashboardRecentEvents";
export { DashboardQuickActions } from "./DashboardQuickActions";
export { DashboardFreeTrialBanner } from "./DashboardFreeTrialBanner";
export { DashboardOrganizationInfo } from "./DashboardOrganizationInfo";

// Hooks
export { useDashboardFilters } from "./hooks/useDashboardFilters";
export type { UseDashboardFiltersReturn, DashboardFilters } from "./hooks/useDashboardFilters";

// Utils
export {
  transformEventsToDashboardFormat,
  calculateEventProgress,
  transformStatsData,
  filterChartData,
} from "./utils/dashboardTransformers";
export {
  calculateBudgetTotals,
  calculateUtilizationPercentage,
  getBudgetStatus,
} from "./utils/dashboardCalculations";

// Types
export type {
  DashboardEvent,
  DashboardStats as DashboardStatsData,
  BudgetDataPoint,
  ExpenseCategory,
  DashboardAlert,
  BudgetStatus,
  BudgetTotals,
  DashboardProps,
  ApiEvent,
} from "./types";

// Constants
export {
  BUDGET_STATUS_THRESHOLDS,
  MAX_PROGRESS,
  CHART_COLORS,
  CATEGORY_COLORS,
  DATE_RANGE_OPTIONS,
  INITIAL_DATA_LIMITS,
  FILTER_DEBOUNCE_DELAY,
  MONTH_NAMES,
} from "./constants";


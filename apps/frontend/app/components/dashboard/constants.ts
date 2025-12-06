/**
 * Named constants for dashboard
 * All magic numbers and strings are defined here for easy maintenance
 */

/**
 * Budget status thresholds (percentages)
 */
export const BUDGET_STATUS_THRESHOLDS = {
  OVER_BUDGET: 90,
  AT_RISK: 75,
} as const;

/**
 * Maximum progress percentage
 */
export const MAX_PROGRESS = 100;

/**
 * Chart colors for consistency
 */
export const CHART_COLORS = {
  BUDGET: '#3b82f6',
  SPENT: '#10b981',
  VENUE: '#3b82f6',
  CATERING: '#10b981',
  MARKETING: '#f59e0b',
  ENTERTAINMENT: '#8b5cf6',
  LOGISTICS: '#ef4444',
  STAFF_TRAVEL: '#8b5cf6',
  MISCELLANEOUS: '#6b7280',
} as const;

/**
 * Category color mapping
 */
export const CATEGORY_COLORS: Record<string, string> = {
  Venue: CHART_COLORS.VENUE,
  Catering: CHART_COLORS.CATERING,
  Marketing: CHART_COLORS.MARKETING,
  Entertainment: CHART_COLORS.ENTERTAINMENT,
  Logistics: CHART_COLORS.LOGISTICS,
  StaffTravel: CHART_COLORS.STAFF_TRAVEL,
  Miscellaneous: CHART_COLORS.MISCELLANEOUS,
};

/**
 * Date range filter options
 */
export const DATE_RANGE_OPTIONS = [
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '12months', label: 'Last 12 Months' },
] as const;

/**
 * Initial data limits for performance
 */
export const INITIAL_DATA_LIMITS = {
  EVENTS: 10,
  ALERTS: 5,
  RECENT_EVENTS: 10,
} as const;

/**
 * Debounce delay for filter inputs (milliseconds)
 */
export const FILTER_DEBOUNCE_DELAY = 300;

/**
 * Month names for date calculations
 */
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;


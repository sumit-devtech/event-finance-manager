/**
 * Event-related constants
 */

import { DEFAULT_STRINGS } from "./common";

export const EVENT_STATUS = {
  ALL: 'all',
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  // Lowercase versions for filtering
  planning: 'planning',
  active: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];

export const EVENT_STATUS_OPTIONS = [
  { value: EVENT_STATUS.PLANNING, label: EVENT_STATUS.PLANNING },
  { value: EVENT_STATUS.ACTIVE, label: EVENT_STATUS.ACTIVE },
  { value: EVENT_STATUS.COMPLETED, label: EVENT_STATUS.COMPLETED },
  { value: EVENT_STATUS.CANCELLED, label: EVENT_STATUS.CANCELLED },
] as const;

export const EVENT_TYPES = {
  ALL: 'all',
  CONFERENCE: 'conference',
  WORKSHOP: 'workshop',
  GALA: 'gala',
  PRODUCT_LAUNCH: 'product_launch',
  CORPORATE: 'corporate',
  TRADE_SHOW: 'trade_show',
  OTHER: 'other',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

export const EVENT_TYPE_OPTIONS = [
  { value: EVENT_TYPES.CONFERENCE, label: 'Conference' },
  { value: EVENT_TYPES.WORKSHOP, label: 'Workshop' },
  { value: EVENT_TYPES.GALA, label: 'Gala' },
  { value: EVENT_TYPES.PRODUCT_LAUNCH, label: 'Product Launch' },
  { value: EVENT_TYPES.CORPORATE, label: 'Corporate Event' },
  { value: EVENT_TYPES.TRADE_SHOW, label: 'Trade Show' },
  { value: EVENT_TYPES.OTHER, label: 'Other' },
] as const;

export const TIME_RANGE_FILTERS = {
  ALL: 'all',
  THIS_WEEK: 'thisWeek',
  THIS_MONTH: 'thisMonth',
  THIS_QUARTER: 'thisQuarter',
  THIS_YEAR: 'thisYear',
  PAST: 'past',
  UPCOMING: 'upcoming',
} as const;

export type TimeRangeFilter = typeof TIME_RANGE_FILTERS[keyof typeof TIME_RANGE_FILTERS];

export const TIME_RANGE_OPTIONS = [
  { value: TIME_RANGE_FILTERS.ALL, label: 'All Time' },
  { value: TIME_RANGE_FILTERS.THIS_WEEK, label: 'This Week' },
  { value: TIME_RANGE_FILTERS.THIS_MONTH, label: 'This Month' },
  { value: TIME_RANGE_FILTERS.THIS_QUARTER, label: 'This Quarter' },
  { value: TIME_RANGE_FILTERS.THIS_YEAR, label: 'This Year' },
  { value: TIME_RANGE_FILTERS.PAST, label: 'Past Events' },
  { value: TIME_RANGE_FILTERS.UPCOMING, label: 'Upcoming Events' },
] as const;

export const BUDGET_HEALTH_FILTERS = {
  ALL: 'all',
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CAUTION: 'caution',
  CRITICAL: 'critical',
  AT_RISK: 'atRisk',
  OVER_BUDGET: 'overBudget',
} as const;

export type BudgetHealthFilter = typeof BUDGET_HEALTH_FILTERS[keyof typeof BUDGET_HEALTH_FILTERS];

export const DEFAULT_EVENT_VALUES = {
  ROI: DEFAULT_STRINGS.NA,
} as const;

export const FREE_EVENT_LIMIT_MESSAGE = 'You have reached your free event limit. Please upgrade to create more events.';



/**
 * Event helper functions
 */

import { TIME_RANGE_FILTERS, BUDGET_HEALTH_FILTERS } from "~/constants/events";
import type { EventWithDetails } from "~/types";

/**
 * Calculate budget health status for an event
 */
export function getBudgetHealth(event: EventWithDetails | any): string {
  // Try to get budget from event.budget field first (handle null, undefined, 0)
  let budget = event.budget ?? 0;
  if (budget === null || budget === undefined) {
    budget = 0;
  }
  
  // If budget is 0, try calculating from budget items (estimatedCost)
  if (budget === 0 && event.budgetItems && Array.isArray(event.budgetItems) && event.budgetItems.length > 0) {
    budget = event.budgetItems.reduce((sum: number, item: any) => {
      const estimated = item.estimatedCost || 0;
      return sum + (typeof estimated === 'number' ? estimated : parseFloat(String(estimated)) || 0);
    }, 0);
  }
  
  const spent = event.spent ?? 0;
  
  // Debug logging for all events to help diagnose
  if (typeof window !== 'undefined') {
    const percentage = budget > 0 ? (spent / budget) * 100 : (spent > 0 ? Infinity : 0);
    console.log('[BudgetHealth]', {
      eventName: event.name || event.id,
      budget,
      spent,
      percentage: budget > 0 ? percentage.toFixed(2) + '%' : (spent > 0 ? '∞% (over budget)' : '0%'),
      isOverBudget: spent > budget && budget > 0,
      hasBudgetItems: !!(event.budgetItems && Array.isArray(event.budgetItems) && event.budgetItems.length > 0),
    });
  }
  
  // If no budget set and no spent, return healthy (can't determine health)
  if (budget === 0 && spent === 0) {
    return BUDGET_HEALTH_FILTERS.HEALTHY;
  }
  
  // If spent > 0 but budget is 0, it's over budget (CRITICAL)
  if (budget === 0 && spent > 0) {
    return BUDGET_HEALTH_FILTERS.CRITICAL;
  }
  
  // If budget is 0, can't calculate percentage, return healthy
  if (budget === 0) {
    return BUDGET_HEALTH_FILTERS.HEALTHY;
  }
  
  const percentage = (spent / budget) * 100;
  
  // Over budget (>=100%) is always CRITICAL - check this FIRST
  if (percentage >= 100) {
    return BUDGET_HEALTH_FILTERS.CRITICAL;
  }
  
  if (percentage < 50) return BUDGET_HEALTH_FILTERS.HEALTHY;
  if (percentage < 75) return BUDGET_HEALTH_FILTERS.WARNING;
  if (percentage < 90) return BUDGET_HEALTH_FILTERS.CAUTION;
  return BUDGET_HEALTH_FILTERS.CRITICAL;
}

/**
 * Get color class for budget health indicator
 */
export function getBudgetHealthColor(health: string): string {
  switch (health) {
    case BUDGET_HEALTH_FILTERS.HEALTHY: return 'bg-green-500';
    case BUDGET_HEALTH_FILTERS.WARNING: return 'bg-yellow-500';
    case BUDGET_HEALTH_FILTERS.CAUTION: return 'bg-orange-500';
    case BUDGET_HEALTH_FILTERS.CRITICAL: return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

/**
 * Check if event is within the specified time range
 */
export function isEventInTimeRange(event: EventWithDetails | any, range: string): boolean {
  if (range === TIME_RANGE_FILTERS.ALL) return true;
  
  const eventDate = new Date(event.date || event.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (range) {
    case 'today':
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      return eventDate >= today && eventDate <= todayEnd;
    
    case TIME_RANGE_FILTERS.THIS_WEEK:
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return eventDate >= weekStart && eventDate <= weekEnd;
    
    case TIME_RANGE_FILTERS.THIS_MONTH:
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      return eventDate >= monthStart && eventDate <= monthEnd;
    
    case 'nextMonth':
      const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      nextMonthEnd.setHours(23, 59, 59, 999);
      return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
    
    case TIME_RANGE_FILTERS.THIS_QUARTER:
      const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
      const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
      const quarterEnd = new Date(today.getFullYear(), quarterMonth + 3, 0);
      quarterEnd.setHours(23, 59, 59, 999);
      return eventDate >= quarterStart && eventDate <= quarterEnd;
    
    case TIME_RANGE_FILTERS.THIS_YEAR:
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      yearEnd.setHours(23, 59, 59, 999);
      return eventDate >= yearStart && eventDate <= yearEnd;
    
    case TIME_RANGE_FILTERS.PAST:
      return eventDate < today;
    
    case TIME_RANGE_FILTERS.UPCOMING:
      return eventDate >= today;
    
    default:
      return true;
  }
}

/**
 * Format event date for display
 */
export function formatEventDate(event: EventWithDetails | any): string {
  if (event.date || event.startDate) {
    const date = new Date(event.date || event.startDate!);
    return date.toLocaleDateString();
  }
  return 'TBD';
}

/**
 * Extract region from event location
 */
export function getEventRegion(event: EventWithDetails | any): string | null {
  if (event.region) return event.region;
  if (event.location) {
    const parts = event.location.split(',');
    return parts.length > 1 ? parts[1].trim() : null;
  }
  return null;
}

/**
 * Get unique regions from events array
 */
export function getRegions(events: EventWithDetails[]): string[] {
  const regions = new Set(
    events
      .map(e => getEventRegion(e))
      .filter((r): r is string => Boolean(r))
  );
  return Array.from(regions);
}

/**
 * Get unique event types from events array
 */
export function getEventTypes(events: EventWithDetails[]): string[] {
  const types = new Set(
    events
      .map(e => e.type || e.eventType)
      .filter((t): t is string => Boolean(t))
  );
  return Array.from(types);
}


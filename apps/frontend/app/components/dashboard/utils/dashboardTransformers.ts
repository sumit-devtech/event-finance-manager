/**
 * Data transformation utilities for dashboard
 * All transformations happen here for consistency and reusability
 */

import type { ApiEvent, DashboardEvent } from "../types";
import { MAX_PROGRESS } from "../constants";

/**
 * Calculate event progress percentage
 * Formula: (spent / budget) * 100, capped at 100%
 * @param budget - Event budget
 * @param spent - Amount spent
 * @returns Progress percentage (0-100)
 */
export function calculateEventProgress(budget: number, spent: number): number {
  if (!budget || budget <= 0) return 0;
  return Math.min(MAX_PROGRESS, Math.round((spent / budget) * MAX_PROGRESS));
}

/**
 * Transform API events to dashboard format with progress calculation
 * @param events - Array of events from API
 * @returns Transformed events with progress calculated
 */
export function transformEventsToDashboardFormat(events: ApiEvent[]): DashboardEvent[] {
  return events.map((event) => ({
    id: event.id,
    name: event.name,
    status: event.status,
    budget: event.budget || 0,
    spent: event.spent || 0,
    progress: calculateEventProgress(event.budget || 0, event.spent || 0),
  }));
}

/**
 * Transform stats data for display
 * Adds progress calculation to upcoming and recent events
 * @param stats - Statistics object
 * @param events - Array of events with budget/spent data
 * @returns Transformed stats with progress calculated
 */
export function transformStatsData(
  stats: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    planningEvents: number;
    cancelledEvents: number;
    totalBudgetItems: number;
    upcomingEvents: ApiEvent[];
    recentEvents: ApiEvent[];
  },
  events: ApiEvent[]
): {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  planningEvents: number;
  cancelledEvents: number;
  totalBudgetItems: number;
  upcomingEvents: DashboardEvent[];
  recentEvents: DashboardEvent[];
} {
  return {
    ...stats,
    upcomingEvents: stats.upcomingEvents.map((event) => {
      const fullEvent = events.find((e) => e.id === event.id) || event;
      // Use name from fullEvent if event.name is missing (handles cached metrics without name)
      const eventName = event.name || fullEvent.name || 'Unnamed Event';
      return {
        id: event.id,
        name: eventName,
        status: event.status,
        budget: fullEvent.budget || 0,
        spent: fullEvent.spent || 0,
        progress: calculateEventProgress(fullEvent.budget || 0, fullEvent.spent || 0),
      };
    }),
    recentEvents: stats.recentEvents.map((event) => {
      // Find the full event from the events array to get budget/spent data
      const fullEvent = events.find((e) => e.id === event.id);
      
      // Use name from event (metrics) first, then fallback to fullEvent.name
      // This handles both old metrics (without name) and new metrics (with name)
      const eventName = event.name || fullEvent?.name || 'Unnamed Event';
      const eventStatus = event.status || fullEvent?.status || 'Unknown';
      
      return {
        id: event.id,
        name: eventName,
        status: eventStatus,
        budget: fullEvent?.budget || 0,
        spent: fullEvent?.spent || 0,
        progress: calculateEventProgress(fullEvent?.budget || 0, fullEvent?.spent || 0),
      };
    }),
  };
}

/**
 * Filter chart data based on date range
 * @param data - Array of budget data points
 * @param dateRange - Date range filter ('3months', '6months', '12months')
 * @returns Filtered data array
 */
export function filterChartData(
  data: Array<{ month: string; budget: number; spent: number }>,
  dateRange: string
): Array<{ month: string; budget: number; spent: number }> {
  if (dateRange === "3months") {
    return data.slice(-3);
  }
  if (dateRange === "6months") {
    return data;
  }
  if (dateRange === "12months") {
    return data;
  }
  return data;
}


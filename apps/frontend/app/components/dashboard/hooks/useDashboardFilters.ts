/**
 * Hook for managing dashboard filter state with debouncing
 * Optimized for performance with debounced filter changes
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { FILTER_DEBOUNCE_DELAY } from "../constants";

/**
 * Filter state interface
 */
export interface DashboardFilters {
  selectedEventFilter: string;
  dateRangeFilter: string;
}

/**
 * Hook return type
 */
export interface UseDashboardFiltersReturn {
  filters: DashboardFilters;
  setSelectedEventFilter: (value: string) => void;
  setDateRangeFilter: (value: string) => void;
  debouncedFilters: DashboardFilters;
}

/**
 * Custom hook for dashboard filters with debouncing
 * Debounces filter changes to reduce re-renders and improve performance
 * @param initialEventFilter - Initial event filter value
 * @param initialDateRangeFilter - Initial date range filter value
 * @returns Filter state and setters with debounced values
 */
export function useDashboardFilters(
  initialEventFilter: string = "all",
  initialDateRangeFilter: string = "6months"
): UseDashboardFiltersReturn {
  const [selectedEventFilter, setSelectedEventFilter] = useState(initialEventFilter);
  const [dateRangeFilter, setDateRangeFilter] = useState(initialDateRangeFilter);
  const [debouncedEventFilter, setDebouncedEventFilter] = useState(initialEventFilter);
  const [debouncedDateRangeFilter, setDebouncedDateRangeFilter] = useState(initialDateRangeFilter);

  // Refs to store timeout IDs for cleanup
  const eventFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dateRangeFilterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce event filter changes
  useEffect(() => {
    if (eventFilterTimeoutRef.current) {
      clearTimeout(eventFilterTimeoutRef.current);
    }
    eventFilterTimeoutRef.current = setTimeout(() => {
      setDebouncedEventFilter(selectedEventFilter);
    }, FILTER_DEBOUNCE_DELAY);

    return () => {
      if (eventFilterTimeoutRef.current) {
        clearTimeout(eventFilterTimeoutRef.current);
      }
    };
  }, [selectedEventFilter]);

  // Debounce date range filter changes
  useEffect(() => {
    if (dateRangeFilterTimeoutRef.current) {
      clearTimeout(dateRangeFilterTimeoutRef.current);
    }
    dateRangeFilterTimeoutRef.current = setTimeout(() => {
      setDebouncedDateRangeFilter(dateRangeFilter);
    }, FILTER_DEBOUNCE_DELAY);

    return () => {
      if (dateRangeFilterTimeoutRef.current) {
        clearTimeout(dateRangeFilterTimeoutRef.current);
      }
    };
  }, [dateRangeFilter]);

  const filters = useMemo(
    () => ({
      selectedEventFilter,
      dateRangeFilter,
    }),
    [selectedEventFilter, dateRangeFilter]
  );

  const debouncedFilters = useMemo(
    () => ({
      selectedEventFilter: debouncedEventFilter,
      dateRangeFilter: debouncedDateRangeFilter,
    }),
    [debouncedEventFilter, debouncedDateRangeFilter]
  );

  return {
    filters,
    setSelectedEventFilter,
    setDateRangeFilter,
    debouncedFilters,
  };
}

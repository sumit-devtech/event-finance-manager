/**
 * Hook for filtering events
 */

import { useState, useMemo, useEffect } from 'react';
import { EVENT_STATUS, EVENT_TYPES, TIME_RANGE_FILTERS, BUDGET_HEALTH_FILTERS, type EventStatus } from "~/constants/events";
import type { EventWithDetails } from "~/types";
import { getBudgetHealth, isEventInTimeRange, getEventRegion } from "../utils/eventHelpers";

interface EventFilters {
  status: EventStatus | string;
  type: string;
  budgetHealth: string;
  region: string;
  timeRange: string;
}

export function useEventFilters(events: EventWithDetails[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventFilters>({
    status: EVENT_STATUS.ALL,
    type: EVENT_TYPES.ALL,
    budgetHealth: BUDGET_HEALTH_FILTERS.ALL,
    region: 'all',
    timeRange: TIME_RANGE_FILTERS.ALL,
  });

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter (using debounced query)
      const matchesSearch = 
        event.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (event.location?.toLowerCase() || '').includes(debouncedSearchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = 
        filters.status === EVENT_STATUS.ALL || 
        event.status === filters.status || 
        event.status?.toLowerCase() === filters.status;
      
      // Type filter
      const matchesType = 
        filters.type === EVENT_TYPES.ALL || 
        (event.type || event.eventType) === filters.type;
      
      // Budget health filter
      const matchesBudgetHealth = 
        filters.budgetHealth === BUDGET_HEALTH_FILTERS.ALL || 
        getBudgetHealth(event) === filters.budgetHealth;
      
      // Region filter
      const eventRegion = getEventRegion(event);
      const matchesRegion = 
        filters.region === 'all' || 
        eventRegion === filters.region;
      
      // Time range filter
      const matchesTimeRange = isEventInTimeRange(event, filters.timeRange);
      
      return matchesSearch && matchesStatus && matchesType && matchesBudgetHealth && matchesRegion && matchesTimeRange;
    });
  }, [events, debouncedSearchQuery, filters]);

  const updateFilter = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: EVENT_STATUS.ALL,
      type: EVENT_TYPES.ALL,
      budgetHealth: BUDGET_HEALTH_FILTERS.ALL,
      region: 'all',
      timeRange: TIME_RANGE_FILTERS.ALL,
    });
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    filteredEvents,
  };
}


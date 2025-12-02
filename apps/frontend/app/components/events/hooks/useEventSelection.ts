/**
 * Hook for managing event selection (for bulk actions)
 */

import { useState, useCallback } from 'react';
import type { EventWithDetails } from "~/types";

export function useEventSelection(events: EventWithDetails[]) {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((eventId: string) => {
    setSelectedEvents(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(eventId)) {
        newSelected.delete(eventId);
      } else {
        newSelected.add(eventId);
      }
      return newSelected;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedEvents(prev => {
      // If all are selected, deselect all
      if (prev.size === events.length && events.length > 0) {
        return new Set();
      }
      // Otherwise, select all
      return new Set(events.map(e => e.id));
    });
  }, [events]);

  const clearSelection = useCallback(() => {
    setSelectedEvents(new Set());
  }, []);

  const isSelected = useCallback((eventId: string) => {
    return selectedEvents.has(eventId);
  }, [selectedEvents]);

  const isAllSelected = events.length > 0 && selectedEvents.size === events.length;

  return {
    selectedEvents,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    selectedCount: selectedEvents.size,
  };
}


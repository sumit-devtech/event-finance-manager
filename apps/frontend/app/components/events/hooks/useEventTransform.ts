/**
 * Hook for transforming event data
 */

import { useMemo } from 'react';
import { transformEvents, type TransformedEvent } from '../utils/eventTransformers';
import { getBudgetHealth } from '../utils/eventHelpers';
import type { EventWithDetails } from "~/types";

export function useEventTransform(events: EventWithDetails[]) {
  const transformedEvents = useMemo(() => {
    return transformEvents(events);
  }, [events]);

  const getEventMetadata = (event: TransformedEvent) => {
    return {
      date: event.formattedDate,
      location: event.location,
      attendees: event.attendees,
      budgetPercentage: event.budgetPercentage,
      roi: event.roi,
    };
  };

  return {
    transformedEvents,
    getBudgetHealth,
    getEventMetadata,
  };
}


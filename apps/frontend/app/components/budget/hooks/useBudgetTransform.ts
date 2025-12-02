/**
 * Hook for transforming budget data
 */

import { useMemo } from 'react';
import { transformBudgetItems } from '../utils/budgetTransformers';
import type { BudgetLineItem } from '../utils/budgetTransformers';

interface UseBudgetTransformProps {
  budgetItems: any[];
  events: Array<{ id: string; name: string }>;
  isDemo: boolean;
  demoBudgetLines: BudgetLineItem[];
  currentUserName?: string;
}

export function useBudgetTransform({
  budgetItems,
  events,
  isDemo,
  demoBudgetLines,
  currentUserName,
}: UseBudgetTransformProps) {
  const getEventName = useMemo(() => {
    return (eventId: string | undefined): string => {
      if (!eventId) return '';
      const foundEvent = events.find((e: any) => e.id === eventId);
      return foundEvent?.name || '';
    };
  }, [events]);

  const budgetLines = useMemo(() => {
    if (isDemo) {
      return demoBudgetLines;
    }
    return transformBudgetItems(budgetItems, getEventName, currentUserName);
  }, [isDemo, demoBudgetLines, budgetItems, getEventName, currentUserName]);

  return {
    budgetLines,
    getEventName,
  };
}


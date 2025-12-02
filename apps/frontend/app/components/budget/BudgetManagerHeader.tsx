/**
 * Budget Manager Header Component
 */

import { BUDGET_MESSAGES } from '~/constants/budget';

interface BudgetManagerHeaderProps {
  event?: { id: string; name: string } | null;
  events: Array<{ id: string; name: string }>;
  budgetLines: Array<{ eventId?: string }>;
  isDemo: boolean;
  error: string | null;
}

export function BudgetManagerHeader({
  event,
  events,
  budgetLines,
  isDemo,
  error,
}: BudgetManagerHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{BUDGET_MESSAGES.TITLE}</h2>
      <p className="text-gray-600 mt-1">{BUDGET_MESSAGES.DESCRIPTION}</p>
      {event ? (
        <p className="text-sm text-gray-500 mt-1">
          {BUDGET_MESSAGES.EVENT_LABEL} {event.name}
        </p>
      ) : events.length > 0 && budgetLines.some((line) => line.eventId) && (
        <p className="text-sm text-gray-500 mt-1">{BUDGET_MESSAGES.SHOWING_ALL_EVENTS}</p>
      )}
      {isDemo && (
        <p className="text-yellow-700 text-sm mt-2">{BUDGET_MESSAGES.DEMO_MODE}</p>
      )}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}


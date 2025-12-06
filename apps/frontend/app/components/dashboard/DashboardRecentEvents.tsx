/**
 * Dashboard Recent Events Component
 * Displays recent events in table (desktop) or card (mobile) view
 * Memoized and optimized for performance
 */

import { memo, useMemo } from "react";
import { Link } from "@remix-run/react";
import { Calendar } from "~/components/Icons";
import { ProgressBar } from "~/components/shared/ProgressBar";
import type { DashboardEvent } from "./types";
import { INITIAL_DATA_LIMITS, BUDGET_STATUS_THRESHOLDS } from "./constants";

interface DashboardRecentEventsProps {
  events: DashboardEvent[];
  isDemo?: boolean;
}

/**
 * Get status color classes
 * @param status - Event status
 * @returns Tailwind CSS classes for status badge
 */
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-blue-100 text-blue-700";
    case "planning":
      return "bg-yellow-100 text-yellow-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * Recent events component with responsive views
 * Memoized to prevent unnecessary re-renders
 * Limits to 10 events for performance
 */
export const DashboardRecentEvents = memo(function DashboardRecentEvents({
  events,
  isDemo = false,
}: DashboardRecentEventsProps) {
  // Limit events to initial limit for performance
  const limitedEvents = useMemo(
    () => events.slice(0, INITIAL_DATA_LIMITS.RECENT_EVENTS),
    [events]
  );

  if (limitedEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
        <p className="text-gray-600 mb-6">Get started by creating your first event</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h3 className="text-lg md:text-xl font-semibold">Recent Events</h3>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden divide-y divide-gray-200">
        {limitedEvents.map((event, index) => (
          <div key={event.id || index} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {event.id ? (
                  <Link
                    to={isDemo ? `/events/${event.id}?demo=true` : `/events/${event.id}`}
                    className="font-medium truncate text-blue-600 hover:underline block"
                  >
                    {event.name}
                  </Link>
                ) : (
                  <p className="font-medium truncate text-gray-900">{event.name}</p>
                )}
              </div>
              <span
                className={`ml-3 px-3 py-1 rounded-full text-sm whitespace-nowrap capitalize ${getStatusColor(event.status)}`}
              >
                {event.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget:</span>
              <span className="font-medium">${event.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Spent:</span>
              <span className="font-medium">${event.spent.toLocaleString()}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress:</span>
                <span className="font-medium">{event.progress}%</span>
              </div>
              <ProgressBar
                value={event.progress}
                variant={
                  event.progress > BUDGET_STATUS_THRESHOLDS.OVER_BUDGET
                    ? "danger"
                    : event.progress > BUDGET_STATUS_THRESHOLDS.AT_RISK
                      ? "warning"
                      : "primary"
                }
                height="md"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 font-medium">Event Name</th>
              <th className="px-6 py-3 text-left text-gray-600 font-medium">Status</th>
              <th className="px-6 py-3 text-left text-gray-600 font-medium">Budget</th>
              <th className="px-6 py-3 text-left text-gray-600 font-medium">Spent</th>
              <th className="px-6 py-3 text-left text-gray-600 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {limitedEvents.map((event, index) => (
              <tr key={event.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {event.id ? (
                    <Link
                      to={isDemo ? `/events/${event.id}?demo=true` : `/events/${event.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {event.name}
                    </Link>
                  ) : (
                    <p className="text-gray-900">{event.name}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(event.status)}`}
                  >
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">${event.budget.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600">${event.spent.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[100px]">
                      <ProgressBar
                        value={event.progress}
                        variant={
                          event.progress > BUDGET_STATUS_THRESHOLDS.OVER_BUDGET
                            ? "danger"
                            : event.progress > BUDGET_STATUS_THRESHOLDS.AT_RISK
                              ? "warning"
                              : "primary"
                        }
                        height="sm"
                      />
                    </div>
                    <span className="text-sm text-gray-600">{event.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});


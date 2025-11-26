/**
 * Event Limit Guard Component
 * 
 * Checks subscription limits and blocks event creation if limit exceeded
 */

import { Link } from "@remix-run/react";

interface EventLimitGuardProps {
  currentEventCount: number;
  subscriptionPlan: "premium" | "enterprise" | null;
  children: React.ReactNode;
}

export function EventLimitGuard({ currentEventCount, subscriptionPlan, children }: EventLimitGuardProps) {
  // Premium plan allows 1 free event
  const isPremium = subscriptionPlan === "premium";
  const hasReachedLimit = isPremium && currentEventCount >= 1;

  if (hasReachedLimit) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Event Limit Reached
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            You've used your 1 free event on the Premium plan. Upgrade to Enterprise for unlimited events.
          </p>
          <Link
            to="/subscription"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Upgrade to Enterprise
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


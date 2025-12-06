/**
 * Dashboard Header Component
 * Displays welcome message and demo mode indicator
 */

import { memo } from "react";
import type { User } from "~/lib/auth";

interface DashboardHeaderProps {
  user: User | null;
  isDemo?: boolean;
}

/**
 * Dashboard header with welcome message
 * Memoized to prevent unnecessary re-renders
 */
export const DashboardHeader = memo(function DashboardHeader({
  user,
  isDemo = false,
}: DashboardHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h2>
      <p className="text-gray-600 mt-1 text-sm md:text-base">
        {isDemo
          ? "Welcome! Here's what's happening with your events."
          : `Welcome back${user?.name ? `, ${user.name}` : ""}! Here's what's happening with your events.`}
      </p>
      {isDemo && (
        <p className="text-yellow-700 text-sm mt-1">
          You're viewing demo data. Sign up to create your own events.
        </p>
      )}
    </div>
  );
});


/**
 * Organization Info Component
 * Displays organization details
 */

import { memo } from "react";

interface DashboardOrganizationInfoProps {
  organization: { name?: string; industry?: string; members?: unknown[] } | null;
}

/**
 * Organization info card component
 * Memoized to prevent unnecessary re-renders
 */
export const DashboardOrganizationInfo = memo(function DashboardOrganizationInfo({
  organization,
}: DashboardOrganizationInfoProps) {
  if (!organization) return null;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-sm mb-1">Organization</p>
          <h3 className="text-lg md:text-xl font-semibold truncate">{organization.name}</h3>
          {organization.industry && (
            <p className="text-gray-600 text-sm mt-1">{organization.industry}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-gray-600 text-xs md:text-sm">Team Members</p>
          <p className="text-xl md:text-2xl font-bold">{organization.members?.length || 1}</p>
        </div>
      </div>
    </div>
  );
});


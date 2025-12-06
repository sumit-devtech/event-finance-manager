/**
 * Free Trial Banner Component
 * Displays free trial information and upgrade CTA
 */

import { memo } from "react";
import { Crown } from "~/components/Icons";

interface DashboardFreeTrialBannerProps {
  freeEventsRemaining: number;
}

/**
 * Free trial banner component
 * Memoized to prevent unnecessary re-renders
 */
export const DashboardFreeTrialBanner = memo(function DashboardFreeTrialBanner({
  freeEventsRemaining,
}: DashboardFreeTrialBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={20} className="md:w-6 md:h-6" />
            <h3 className="text-lg md:text-xl font-semibold">Free Trial Active</h3>
          </div>
          <p className="opacity-90 text-sm md:text-base">
            You have {freeEventsRemaining} free event(s) remaining. Upgrade to unlock unlimited
            events and premium features.
          </p>
        </div>
        <button className="w-full sm:w-auto px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 whitespace-nowrap font-medium text-sm md:text-base">
          Upgrade Now
        </button>
      </div>
    </div>
  );
});


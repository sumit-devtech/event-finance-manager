import { Link } from "@remix-run/react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface SubscriptionStatusProps {
  subscription?: {
    planName: string;
    status: string;
    currentPeriodEnd?: string;
  } | null;
  limits: {
    maxEvents: number | null;
    features: string[];
  };
  currentEventCount: number;
  className?: string;
}

export function SubscriptionStatus({
  subscription,
  limits,
  currentEventCount,
  className = "",
}: SubscriptionStatusProps) {
  const isFree = !subscription || subscription.planName?.toLowerCase() === "free";
  const isAtLimit = limits.maxEvents !== null && currentEventCount >= limits.maxEvents;
  const remainingEvents = limits.maxEvents === null 
    ? "Unlimited" 
    : Math.max(0, limits.maxEvents - currentEventCount);

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {isFree ? "Free Plan" : `${subscription?.planName || "Unknown"} Plan`}
          </h3>
          <p className="text-sm text-gray-600">
            {limits.maxEvents === null 
              ? "Unlimited events" 
              : `${currentEventCount} / ${limits.maxEvents} events`}
          </p>
        </div>
        {isAtLimit && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle size={16} />
            <span className="text-xs font-medium">Limit Reached</span>
          </div>
        )}
      </div>

      {isAtLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
          <div className="flex items-start gap-2">
            <Info className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">
                You've reached your event limit
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Upgrade your plan to create more events
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAtLimit && limits.maxEvents !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={16} />
            <p className="text-sm text-blue-800">
              {remainingEvents} event{remainingEvents !== 1 ? "s" : ""} remaining
            </p>
          </div>
        </div>
      )}

      <Link
        to="/setup/subscription"
        className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
      >
        {isFree ? "Upgrade Plan" : "Manage Subscription"}
      </Link>
    </div>
  );
}


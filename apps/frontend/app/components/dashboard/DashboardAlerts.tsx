/**
 * Dashboard Alerts Component
 * Displays alerts and notifications
 * Memoized for performance
 */

import { memo } from "react";
import { Link } from "@remix-run/react";
import { AlertCircle } from "~/components/Icons";
import type { DashboardAlert } from "./types";

interface DashboardAlertsProps {
  alerts: DashboardAlert[];
  isDemo?: boolean;
}

/**
 * Alerts and notifications component
 * Memoized to prevent unnecessary re-renders
 */
export const DashboardAlerts = memo(function DashboardAlerts({
  alerts,
  isDemo = false,
}: DashboardAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={20} className="text-amber-600" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">Alerts & Notifications</h3>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${
              alert.urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`p-1.5 rounded-lg ${alert.urgent ? "bg-red-100" : "bg-amber-100"}`}
                >
                  <AlertCircle
                    size={16}
                    className={alert.urgent ? "text-red-600" : "text-amber-600"}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${alert.urgent ? "text-red-900" : "text-amber-900"}`}
                  >
                    {alert.message}
                  </p>
                  {alert.details && (
                    <p
                      className={`text-sm mt-1 ${alert.urgent ? "text-red-700" : "text-amber-700"}`}
                    >
                      {alert.details}
                    </p>
                  )}
                  {alert.count && alert.count > 1 && !alert.details && (
                    <p
                      className={`text-sm mt-1 ${alert.urgent ? "text-red-700" : "text-amber-700"}`}
                    >
                      {alert.count} items require attention
                    </p>
                  )}
                </div>
              </div>
              {(alert.type === "approval" || alert.type === "notification") && (
                <Link
                  to={
                    alert.type === "approval"
                      ? isDemo ? "/expenses?demo=true&status=Pending" : "/expenses?status=Pending"
                      : isDemo ? "/notifications?demo=true" : "/notifications"
                  }
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {alert.type === "approval" ? "Review" : "View"}
                </Link>
              )}
              {alert.type === "overspending" && (
                <Link
                  to={isDemo ? "/events?demo=true" : "/events"}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View Events
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});


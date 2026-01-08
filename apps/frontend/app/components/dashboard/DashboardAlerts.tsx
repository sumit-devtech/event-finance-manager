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
    <div className="bg-white rounded-[6px] border border-[#E2E2E2] p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={20} className="text-[#FF751F]" />
        <h3 className="text-h3 text-[#1A1A1A]">Alerts & Notifications</h3>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          // Determine alert type styling based on alert type
          const getAlertStyles = () => {
            if (alert.type === "overspending") {
              return {
                container: "bg-[#D92C2C]/10 border-[#D92C2C]/30",
                iconBg: "bg-[#D92C2C]/20",
                iconColor: "text-[#D92C2C]",
                titleColor: "text-[#D92C2C]",
                textColor: "text-[#D92C2C]",
              };
            } else if (alert.type === "approval") {
              return {
                container: "bg-[#FF751F]/10 border-[#FF751F]/30",
                iconBg: "bg-[#FF751F]/20",
                iconColor: "text-[#FF751F]",
                titleColor: "text-[#FF751F]",
                textColor: "text-[#5E5E5E]",
              };
            } else {
              // Success/reconciled
              return {
                container: "bg-[#1BBE63]/10 border-[#1BBE63]/30",
                iconBg: "bg-[#1BBE63]/20",
                iconColor: "text-[#1BBE63]",
                titleColor: "text-[#1BBE63]",
                textColor: "text-[#5E5E5E]",
              };
            }
          };

          const styles = getAlertStyles();

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-[6px] border ${styles.container}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-1.5 rounded-[6px] ${styles.iconBg}`}>
                    <AlertCircle size={16} className={styles.iconColor} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-interface-bold ${styles.titleColor} mb-1`}>
                      {alert.type === "overspending" 
                        ? "Budget threshold exceeded"
                        : alert.type === "approval"
                        ? "Approval pending"
                        : "Event reconciled"}
                    </p>
                    <p className={`text-interface ${styles.textColor}`}>
                      {alert.message}
                    </p>
                    {alert.details && (
                      <p className={`text-interface mt-2 ${styles.textColor}`}>
                        {alert.details}
                      </p>
                    )}
                    {alert.count && alert.count > 1 && !alert.details && (
                      <p className={`text-interface mt-2 ${styles.textColor}`}>
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
                    className="px-4 h-9 bg-white border border-[#E2E2E2] rounded-[6px] text-interface font-medium hover:bg-[#F3F3F6] transition-colors"
                  >
                    {alert.type === "approval" ? "Review" : "View"}
                  </Link>
                )}
                {alert.type === "overspending" && (
                  <Link
                    to={isDemo ? "/events?demo=true" : "/events"}
                    className="px-4 h-9 bg-white border border-[#E2E2E2] rounded-[6px] text-interface font-medium hover:bg-[#F3F3F6] transition-colors"
                  >
                    View Events
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});


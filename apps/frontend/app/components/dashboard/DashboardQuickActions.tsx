/**
 * Dashboard Quick Actions Component
 * Displays quick action cards for common tasks
 * Memoized for performance
 */

import { memo } from "react";
import { Link } from "@remix-run/react";
import { Plus, DollarSign, FileText } from "~/components/Icons";

interface DashboardQuickActionsProps {
  canCreateEvent: boolean;
  canManageBudget: boolean;
  canViewReports: boolean;
  isDemo?: boolean;
}

/**
 * Quick actions component
 * Memoized to prevent unnecessary re-renders
 */
export const DashboardQuickActions = memo(function DashboardQuickActions({
  canCreateEvent,
  canManageBudget,
  canViewReports,
  isDemo = false,
}: DashboardQuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* New Event */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-lg">
            <Plus size={20} className="text-white" />
          </div>
          <h4 className="text-lg md:text-xl font-semibold text-gray-900">New Event</h4>
        </div>
        <p className="text-gray-700 text-sm mb-5">
          Start planning your next event with our easy-to-use tools
        </p>
        {canCreateEvent ? (
          <Link
            to={isDemo ? "/events/new?demo=true" : "/events/new"}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span>Create Event</span>
          </Link>
        ) : (
          <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
            <Plus size={18} />
            <span>Create Event</span>
          </div>
        )}
      </div>

      {/* Budget Line */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-600 rounded-lg">
            <DollarSign size={20} className="text-white" />
          </div>
          <h4 className="text-lg md:text-xl font-semibold text-gray-900">Budget Line</h4>
        </div>
        <p className="text-gray-700 text-sm mb-5">
          Add budget line items and track expenses across events
        </p>
        {canManageBudget ? (
          <Link
            to={isDemo ? "/budget?demo=true" : "/budget"}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <DollarSign size={18} />
            <span>Manage Budget</span>
          </Link>
        ) : (
          <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
            <DollarSign size={18} />
            <span>Manage Budget</span>
          </div>
        )}
      </div>

      {/* Generate Report */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-purple-600 rounded-lg">
            <FileText size={20} className="text-white" />
          </div>
          <h4 className="text-lg md:text-xl font-semibold text-gray-900">Generate Report</h4>
        </div>
        <p className="text-gray-700 text-sm mb-5">
          Create comprehensive reports and export your data
        </p>
        {canViewReports ? (
          <Link
            to={isDemo ? "/reports?demo=true" : "/reports"}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <FileText size={18} />
            <span>View Reports</span>
          </Link>
        ) : (
          <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
            <FileText size={18} />
            <span>View Reports</span>
          </div>
        )}
      </div>
    </div>
  );
});


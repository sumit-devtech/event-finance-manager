/**
 * Dashboard Budget Overview Component
 * Displays budget breakdown by category with progress bars
 */

import { memo } from "react";
import { ProgressBar } from "~/components/shared/ProgressBar";
import type { ExpenseCategory } from "./types";
import { BUDGET_STATUS_THRESHOLDS } from "./constants";

interface DashboardBudgetOverviewProps {
  expenseCategories: ExpenseCategory[];
}

/**
 * Budget overview by category component
 * Memoized to prevent unnecessary re-renders
 */
export const DashboardBudgetOverview = memo(function DashboardBudgetOverview({
  expenseCategories,
}: DashboardBudgetOverviewProps) {
  if (expenseCategories.length === 0) return null;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Budget Overview by Category</h3>
      <div className="space-y-4">
        {expenseCategories.map((category, index) => {
          const percentage = category.value;
          const variant =
            percentage > BUDGET_STATUS_THRESHOLDS.OVER_BUDGET
              ? "danger"
              : percentage > BUDGET_STATUS_THRESHOLDS.AT_RISK
                ? "warning"
                : "safe";

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-sm md:text-base text-gray-700 truncate">
                  {category.name}
                </span>
                <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                  {category.value}%
                </span>
              </div>
              <ProgressBar value={percentage} variant={variant} height="md" />
            </div>
          );
        })}
      </div>
    </div>
  );
});


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
    <div className="bg-white p-5 rounded-[6px] border border-[#E2E2E2]">
      <h3 className="text-base font-semibold mb-4 text-[#1A1A1A]">Budget Overview by Category</h3>
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
                <span className="text-sm text-[#1A1A1A] truncate">
                  {category.name}
                </span>
                <span className="text-xs text-[#5E5E5E] whitespace-nowrap">
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


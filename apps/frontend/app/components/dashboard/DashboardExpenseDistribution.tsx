/**
 * Dashboard Expense Distribution Component
 * Displays expense distribution pie chart
 * Lazy loaded for performance optimization
 */

import { memo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ExpenseCategory } from "./types";

interface DashboardExpenseDistributionProps {
  expenseCategories: ExpenseCategory[];
}

/**
 * Expense distribution pie chart component
 * Memoized to prevent unnecessary re-renders
 */
export const DashboardExpenseDistribution = memo(function DashboardExpenseDistribution({
  expenseCategories,
}: DashboardExpenseDistributionProps) {
  if (expenseCategories.length === 0) return null;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseCategories}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => `${entry.value}%`}
            >
              {expenseCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {expenseCategories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded color-swatch"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm">
                {category.name}: {category.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});


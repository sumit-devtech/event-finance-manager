/**
 * Dashboard Stats Component
 * Displays budget overview cards (Total Budget, Utilized, Remaining)
 * All calculations are done server-side, component only displays
 */

import { memo, useMemo } from "react";
import { DollarSign, TrendingUp } from "~/components/Icons";
import type { BudgetTotals } from "./types";

interface DashboardStatsProps {
  totals: BudgetTotals;
}

/**
 * Budget statistics cards component
 * Memoized to prevent unnecessary re-renders
 * Uses useMemo for card data to optimize performance
 */
export const DashboardStats = memo(function DashboardStats({ totals }: DashboardStatsProps) {
  // Memoize card data to prevent recalculation
  const cardsData = useMemo(
    () => [
      {
        label: "Total Budget",
        value: totals.totalBudget,
        icon: DollarSign,
        color: "blue",
        description: "All events combined",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        dotColor: "bg-blue-500",
      },
      {
        label: "Utilized",
        value: totals.totalSpent,
        icon: TrendingUp,
        color: totals.status.text.split("-")[1], // Extract color from status
        description: `${totals.utilizationPercentage.toFixed(1)}% - ${totals.status.label}`,
        bgColor: totals.status.bg,
        iconColor: totals.status.text,
        dotColor: totals.status.indicator,
        borderColor: totals.status.border,
      },
      {
        label: "Remaining",
        value: Math.abs(totals.totalRemaining),
        icon: DollarSign,
        color: totals.totalRemaining < 0 ? "red" : "emerald",
        description: totals.totalRemaining < 0 ? "Over budget" : "Available",
        bgColor: totals.totalRemaining < 0 ? "bg-red-100" : "bg-emerald-100",
        iconColor: totals.totalRemaining < 0 ? "text-red-600" : "text-emerald-600",
        dotColor: totals.totalRemaining < 0 ? "bg-red-500" : "bg-emerald-500",
        borderColor: totals.totalRemaining < 0 ? "border-red-200" : "border-emerald-200",
        textColor: totals.totalRemaining < 0 ? "text-red-600" : "text-emerald-600",
      },
    ],
    [totals]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      {cardsData.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-white p-5 md:p-6 rounded-xl border-2 ${card.borderColor || "border-gray-200"} hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {card.label}
              </p>
              <div className={`p-2.5 ${card.bgColor} rounded-lg`}>
                <Icon size={20} className={card.iconColor} />
              </div>
            </div>
            <p
              className={`text-3xl md:text-4xl font-bold mb-2 ${card.textColor || "text-gray-900"}`}
            >
              ${card.value.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${card.dotColor}`}></div>
              <p className={`text-xs ${card.textColor || "text-gray-500"} ${index === 1 ? "font-medium" : ""}`}>
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});


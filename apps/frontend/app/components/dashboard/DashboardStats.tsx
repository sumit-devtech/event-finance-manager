/**
 * Dashboard Stats Component
 * Displays budget overview cards (Total Budget, Utilized, Remaining)
 * Enterprise design: white cards, subtle borders, minimal indicators
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
        description: "All events combined",
      },
      {
        label: "Utilized",
        value: totals.totalSpent,
        icon: TrendingUp,
        description: `${totals.utilizationPercentage.toFixed(1)}% - ${totals.status.label}`,
        statusColor: totals.utilizationPercentage > 100
          ? "#D92C2C"
          : totals.utilizationPercentage > 80
            ? "#FF751F"
            : "#1BBE63",
      },
      {
        label: "Remaining",
        value: Math.abs(totals.totalRemaining),
        icon: DollarSign,
        description: totals.totalRemaining < 0 ? "Over budget" : "Available",
        statusColor: totals.totalRemaining < 0 ? "#D92C2C" : "#5E5E5E",
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
            className="bg-white p-5 rounded-[6px] border border-[#E2E2E2] hover:border-[#C6C6C6] transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-[#5E5E5E] uppercase tracking-wide">
                {card.label}
              </p>
              <div className="p-2 rounded-[6px] bg-[#F3F3F6]">
                <Icon size={18} className="text-[#5E5E5E]" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-2 text-[#1A1A1A]">
              ${card.value.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: card.statusColor || "#5E5E5E" }}
              ></div>
              <p className={`text-xs text-[#5E5E5E] ${index === 1 ? "font-medium" : ""}`}>
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});


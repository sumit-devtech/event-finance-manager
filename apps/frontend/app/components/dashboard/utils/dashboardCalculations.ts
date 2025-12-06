/**
 * Calculation utilities for dashboard
 * All calculations happen here for consistency and server-side security
 */

import type { BudgetTotals, BudgetStatus, DashboardEvent } from "../types";
import { BUDGET_STATUS_THRESHOLDS, MAX_PROGRESS } from "../constants";

/**
 * Calculate budget totals (budget, spent, remaining, utilization)
 * @param events - Array of events with budget/spent data
 * @returns Calculated budget totals and status
 */
export function calculateBudgetTotals(events: DashboardEvent[]): BudgetTotals {
  const totalBudget = events.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalSpent = events.reduce((sum, event) => sum + (event.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * MAX_PROGRESS : 0;

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    utilizationPercentage,
    status: getBudgetStatus(utilizationPercentage),
  };
}

/**
 * Calculate utilization percentage
 * @param totalBudget - Total budget amount
 * @param totalSpent - Total amount spent
 * @returns Utilization percentage (0-100)
 */
export function calculateUtilizationPercentage(totalBudget: number, totalSpent: number): number {
  if (!totalBudget || totalBudget <= 0) return 0;
  return Math.min(MAX_PROGRESS, Math.round((totalSpent / totalBudget) * MAX_PROGRESS));
}

/**
 * Get budget status based on utilization percentage
 * Thresholds: >90% = Over Budget, >75% = At Risk, else = On Track
 * @param percentage - Utilization percentage (0-100)
 * @returns Budget status with styling classes and label
 */
export function getBudgetStatus(percentage: number): BudgetStatus {
  if (percentage > BUDGET_STATUS_THRESHOLDS.OVER_BUDGET) {
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      indicator: "bg-red-500",
      label: "Over Budget",
    };
  }
  if (percentage > BUDGET_STATUS_THRESHOLDS.AT_RISK) {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      indicator: "bg-amber-500",
      label: "At Risk",
    };
  }
  return {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    indicator: "bg-emerald-500",
    label: "On Track",
  };
}


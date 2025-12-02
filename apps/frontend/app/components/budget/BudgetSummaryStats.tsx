/**
 * Budget Summary Statistics Component
 */

import { BUDGET_SUMMARY_LABELS } from '~/constants/budget';
import { calculateBudgetTotals } from './utils/budgetHelpers';

interface BudgetSummaryStatsProps {
  budgetLines: Array<{ estimatedCost?: number; actualCost?: number }>;
}

export function BudgetSummaryStats({ budgetLines }: BudgetSummaryStatsProps) {
  const { totalAllocated, totalSpent, remaining, percentageSpent } = calculateBudgetTotals(budgetLines);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">{BUDGET_SUMMARY_LABELS.TOTAL_ALLOCATED}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">
          ${totalAllocated.toLocaleString()}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">{BUDGET_SUMMARY_LABELS.TOTAL_SPENT}</div>
        <div className="text-2xl font-bold text-blue-600 mt-1">
          ${totalSpent.toLocaleString()}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">{BUDGET_SUMMARY_LABELS.REMAINING}</div>
        <div className={`text-2xl font-bold mt-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${remaining.toLocaleString()}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">{BUDGET_SUMMARY_LABELS.PERCENTAGE_SPENT}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">
          {percentageSpent.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}


/**
 * Category Breakdown Component
 */

import { BUDGET_SUMMARY_LABELS } from '~/constants/budget';
import { calculateCategoryTotals } from './utils/budgetHelpers';

interface CategoryBreakdownProps {
  budgetLines: Array<{ category: string; estimatedCost?: number; actualCost?: number }>;
}

export function CategoryBreakdown({ budgetLines }: CategoryBreakdownProps) {
  const categoryTotals = calculateCategoryTotals(budgetLines);

  if (Object.keys(categoryTotals).length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{BUDGET_SUMMARY_LABELS.CATEGORY_BREAKDOWN}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryTotals).map(([category, totals]) => (
          <div key={category} className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">{category}</div>
            <div className="text-sm text-gray-600 mt-1">
              Allocated: ${totals.allocated.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Spent: ${totals.spent.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


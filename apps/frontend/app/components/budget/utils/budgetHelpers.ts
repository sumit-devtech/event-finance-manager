/**
 * Budget helper functions
 */

import { BUDGET_ITEM_STATUS } from '~/constants/budget';
import { getBudgetStatusColor } from '~/lib/utils';

/**
 * Get status color class for budget item
 */
export function getBudgetItemStatusColor(status: string): string {
  return getBudgetStatusColor(status);
}

/**
 * Format variance display text
 */
export function formatVariance(variance: number): { amount: string; label: string } {
  const amount = Math.abs(variance).toLocaleString();
  const label = variance >= 0 ? 'under' : 'over';
  return { amount, label };
}

/**
 * Calculate budget totals
 */
export function calculateBudgetTotals(budgetLines: Array<{ estimatedCost?: number; actualCost?: number }>) {
  const totalAllocated = budgetLines.reduce((sum, line) => sum + (line.estimatedCost || 0), 0);
  const totalSpent = budgetLines.reduce((sum, line) => sum + (line.actualCost || 0), 0);
  const remaining = totalAllocated - totalSpent;
  const percentageSpent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  
  return {
    totalAllocated,
    totalSpent,
    remaining,
    percentageSpent,
  };
}

/**
 * Calculate category totals
 */
export function calculateCategoryTotals(budgetLines: Array<{ category: string; estimatedCost?: number; actualCost?: number }>) {
  return budgetLines.reduce((acc, line) => {
    if (!acc[line.category]) {
      acc[line.category] = { allocated: 0, spent: 0 };
    }
    acc[line.category].allocated += (line.estimatedCost || 0);
    acc[line.category].spent += (line.actualCost || 0);
    return acc;
  }, {} as Record<string, { allocated: number; spent: number }>);
}

/**
 * Parse decimal value from various formats
 */
export function parseDecimal(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return 0;
}


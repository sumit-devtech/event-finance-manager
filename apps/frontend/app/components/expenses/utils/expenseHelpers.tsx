/**
 * Expense helper functions
 */

import { Check, Clock, X } from "~/components/Icons";
import type { ReactNode } from "react";
import { EXPENSE_STATUS } from "~/constants/expenses";

/**
 * Get status icon for expense
 */
export function getStatusIcon(status: string): ReactNode | null {
  switch (status) {
    case EXPENSE_STATUS.APPROVED:
      return <Check size={16} />;
    case EXPENSE_STATUS.PENDING:
      return <Clock size={16} />;
    case EXPENSE_STATUS.REJECTED:
      return <X size={16} />;
    default:
      return null;
  }
}

/**
 * Check if file is an image based on MIME type or extension
 */
export function isImageFile(mimeType: string | null | undefined, filename: string): boolean {
  if (!mimeType && !filename) return false;
  const mime = mimeType?.toLowerCase() || '';
  const ext = filename?.toLowerCase().split('.').pop() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return mime.startsWith('image/') || imageExtensions.includes(ext);
}

/**
 * Calculate expense statistics
 */
export function calculateExpenseStats(expenses: Array<{ status: string; amount: number }>) {
  const statusCounts = {
    all: expenses.length,
    pending: expenses.filter(e => e.status === EXPENSE_STATUS.PENDING).length,
    approved: expenses.filter(e => e.status === EXPENSE_STATUS.APPROVED).length,
    rejected: expenses.filter(e => e.status === EXPENSE_STATUS.REJECTED).length,
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses
    .filter(e => e.status === EXPENSE_STATUS.APPROVED)
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = expenses
    .filter(e => e.status === EXPENSE_STATUS.PENDING)
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    statusCounts,
    totalExpenses,
    approvedTotal,
    pendingTotal,
  };
}


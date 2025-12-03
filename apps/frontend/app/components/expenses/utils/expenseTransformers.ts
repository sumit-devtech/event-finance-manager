/**
 * Expense data transformation utilities
 */

import { DEFAULT_EXPENSE_VALUES, EXPENSE_STATUS } from "~/constants/expenses";

export interface TransformedExpense extends Record<string, unknown> {
  id: string | number;
  event: string;
  category: string;
  item: string;
  amount: number;
  vendor: string;
  date: string;
  submittedBy: string;
  status: string;
  approver?: string;
  notes?: string;
  _original: any;
}

/**
 * Transform API expense to component format
 */
export function transformExpense(exp: any): TransformedExpense {
  return {
    id: exp.id,
    event: exp.event?.name || DEFAULT_EXPENSE_VALUES.EVENT,
    category: exp.category || DEFAULT_EXPENSE_VALUES.CATEGORY,
    item: exp.title,
    amount: exp.amount,
    vendor: exp.vendor || exp.vendorLink?.name || DEFAULT_EXPENSE_VALUES.VENDOR,
    date: exp.createdAt 
      ? new Date(exp.createdAt).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    submittedBy: exp.creator?.fullName || exp.creator?.email || DEFAULT_EXPENSE_VALUES.SUBMITTED_BY,
    status: exp.status?.toLowerCase() || EXPENSE_STATUS.PENDING,
    approver: exp.workflows?.find((w: any) => w.action === 'approved')?.approver?.fullName,
    notes: exp.description,
    // Preserve original expense data for modal (including receiptFiles)
    _original: exp,
  };
}

/**
 * Transform multiple expenses
 */
export function transformExpenses(expenses: any[]): TransformedExpense[] {
  return expenses.map(transformExpense);
}



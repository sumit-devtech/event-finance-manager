/**
 * Expenses Module - Main Export
 * 
 * This module contains all expense-related components, hooks, and utilities.
 */

// Main component
export { ExpenseTracker } from './ExpenseTracker';

// Sub-components
export { ExpenseTrackerHeader } from './ExpenseTrackerHeader';
export { ExpenseSummaryStats } from './ExpenseSummaryStats';
export { ExpenseFilters } from './ExpenseFilters';
export { ExpenseTable } from './ExpenseTable';
export { ExpenseDetailsModal } from './ExpenseDetailsModal';
export { PendingApprovalsAlert } from './PendingApprovalsAlert';
export { ReceiptFilesList } from './ReceiptFilesList';
export { ReceiptFileItem } from './ReceiptFileItem';

// Hooks
export { useExpenseTransform } from './hooks/useExpenseTransform';
export { useExpenseFilters } from './hooks/useExpenseFilters';
export { useExpenseActions } from './hooks/useExpenseActions';
export { useExpenseDetails } from './hooks/useExpenseDetails';

// Utilities
export { transformExpense, transformExpenses } from './utils/expenseTransformers';
export { getStatusIcon, isImageFile, calculateExpenseStats } from './utils/expenseHelpers';
export { validateExpenseForm } from './utils/expenseValidators';

// Types
export type { TransformedExpense } from './utils/expenseTransformers';



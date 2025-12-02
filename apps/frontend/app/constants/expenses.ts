/**
 * Expense-related constants
 */

import { DEFAULT_STRINGS } from "./common";

export const EXPENSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ALL: 'all',
} as const;

export type ExpenseStatus = typeof EXPENSE_STATUS[keyof typeof EXPENSE_STATUS];

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  [EXPENSE_STATUS.PENDING]: 'Pending',
  [EXPENSE_STATUS.APPROVED]: 'Approved',
  [EXPENSE_STATUS.REJECTED]: 'Rejected',
  [EXPENSE_STATUS.ALL]: 'All',
} as const;

export const EXPENSE_INTENTS = {
  CREATE_EXPENSE: 'createExpense',
  APPROVE: 'approve',
  REJECT: 'reject',
  GET_EXPENSE_DETAILS: 'getExpenseDetails',
} as const;

export const DEFAULT_EXPENSE_VALUES = {
  EVENT: DEFAULT_STRINGS.UNKNOWN_EVENT,
  CATEGORY: 'Miscellaneous',
  VENDOR: DEFAULT_STRINGS.NA,
  SUBMITTED_BY: DEFAULT_STRINGS.UNKNOWN,
  STATUS: EXPENSE_STATUS.PENDING,
  APPROVER: 'Approver',
  USER: 'User',
  EVENT_NAME: 'Event',
  NO_DESCRIPTION: 'No description provided',
} as const;

export const EXPENSE_FILTER_OPTIONS = [
  { value: EXPENSE_STATUS.ALL, label: EXPENSE_STATUS_LABELS[EXPENSE_STATUS.ALL] },
  { value: EXPENSE_STATUS.PENDING, label: EXPENSE_STATUS_LABELS[EXPENSE_STATUS.PENDING] },
  { value: EXPENSE_STATUS.APPROVED, label: EXPENSE_STATUS_LABELS[EXPENSE_STATUS.APPROVED] },
  { value: EXPENSE_STATUS.REJECTED, label: EXPENSE_STATUS_LABELS[EXPENSE_STATUS.REJECTED] },
] as const;

export const EXPENSE_MESSAGES = {
  SUBMITTED_SUCCESS: 'Expense submitted successfully',
  SUBMITTED_SUCCESS_DEMO: 'Expense submitted successfully (Demo Mode)',
  UNABLE_TO_SUBMIT: 'Unable to submit expense',
  FAILED_TO_SUBMIT: 'Failed to submit expense',
  FILE_DOWNLOAD_SUCCESS: 'File downloaded successfully',
  FILE_DOWNLOAD_FAILED: 'Failed to download file',
} as const;

export const EXPENSE_LABELS = {
  EXPENSE_TRACKER: 'Expense Tracker',
  TRACK_AND_APPROVE: 'Track and approve expenses for your events',
  SUBMIT_EXPENSE: 'Submit Expense',
  TOTAL_EXPENSES: 'Total Expenses',
  APPROVED: 'Approved',
  PENDING_APPROVAL: 'Pending Approval',
  SEARCH_PLACEHOLDER: 'Search expenses...',
  STATUS: 'Status',
  EXPENSE_SUBMISSIONS: 'Expense Submissions',
  EXPORT: 'Export',
  NO_EXPENSES_FOUND: 'No expenses found',
  TRY_ADJUSTING_SEARCH: 'Try adjusting your search',
  NO_EXPENSES_SUBMITTED: 'No expenses submitted yet',
  PENDING_APPROVALS_ALERT: (count: number) => 
    `You have ${count} expense${count > 1 ? 's' : ''} waiting for approval`,
  TOTAL_PENDING_AMOUNT: (amount: string) => `Total pending amount: ${amount}`,
  BASIC_INFORMATION: 'Basic Information',
  EXPENSE_TITLE: 'Expense Title',
  CATEGORY: 'Category',
  AMOUNT: 'Amount',
  DATE: 'Date',
  EVENT: 'Event',
  VENDOR: 'Vendor',
  SUBMITTED_BY: 'Submitted By',
  STATUS_LABEL: 'Status',
  DESCRIPTION: 'Description',
  APPROVAL_HISTORY: 'Approval History',
  APPROVED_BY: 'Approved by',
  REJECTED_BY: 'Rejected by',
  ACTION: 'Action',
  RECEIPTS: 'Receipts',
  NO_RECEIPT_FILES: 'No receipt files attached',
  CLOSE: 'Close',
  REJECT: 'Reject',
  APPROVE: 'Approve',
  VIEW: 'View',
  HIDE: 'Hide',
  PREVIEW: 'Preview',
  DOWNLOAD: 'Download',
  LOADING_PREVIEW: 'Loading preview...',
  PREVIEW_NOT_AVAILABLE: 'Preview not available',
  RETRY: 'Retry',
  HIDE_PREVIEW: 'Hide preview',
  SHOW_PREVIEW: 'Show preview',
  DOWNLOAD_FILE: 'Download file',
  CLOSE_PREVIEW: 'Close preview',
} as const;


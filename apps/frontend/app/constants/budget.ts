/**
 * Budget-related constants
 */

import { DEFAULT_STRINGS } from './common';
import { USER_ROLES } from './roles';

// Budget Item Status
export const BUDGET_ITEM_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type BudgetItemStatus = typeof BUDGET_ITEM_STATUS[keyof typeof BUDGET_ITEM_STATUS];

export const BUDGET_ITEM_STATUS_OPTIONS = [
  { value: BUDGET_ITEM_STATUS.PENDING, label: BUDGET_ITEM_STATUS.PENDING },
  { value: BUDGET_ITEM_STATUS.APPROVED, label: BUDGET_ITEM_STATUS.APPROVED },
  { value: BUDGET_ITEM_STATUS.REJECTED, label: BUDGET_ITEM_STATUS.REJECTED },
] as const;

// Budget Item Categories
export const BUDGET_ITEM_CATEGORY = {
  VENUE: 'Venue',
  CATERING: 'Catering',
  MARKETING: 'Marketing',
  LOGISTICS: 'Logistics',
  ENTERTAINMENT: 'Entertainment',
  STAFF_TRAVEL: 'StaffTravel',
  TECHNOLOGY: 'Technology',
  MISCELLANEOUS: 'Miscellaneous',
} as const;

export type BudgetItemCategory = typeof BUDGET_ITEM_CATEGORY[keyof typeof BUDGET_ITEM_CATEGORY];

export const BUDGET_ITEM_CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category' },
  { value: BUDGET_ITEM_CATEGORY.VENUE, label: BUDGET_ITEM_CATEGORY.VENUE },
  { value: BUDGET_ITEM_CATEGORY.CATERING, label: BUDGET_ITEM_CATEGORY.CATERING },
  { value: BUDGET_ITEM_CATEGORY.MARKETING, label: BUDGET_ITEM_CATEGORY.MARKETING },
  { value: BUDGET_ITEM_CATEGORY.LOGISTICS, label: BUDGET_ITEM_CATEGORY.LOGISTICS },
  { value: BUDGET_ITEM_CATEGORY.ENTERTAINMENT, label: BUDGET_ITEM_CATEGORY.ENTERTAINMENT },
  { value: BUDGET_ITEM_CATEGORY.STAFF_TRAVEL, label: 'Staff Travel' },
  { value: BUDGET_ITEM_CATEGORY.TECHNOLOGY, label: BUDGET_ITEM_CATEGORY.TECHNOLOGY },
  { value: BUDGET_ITEM_CATEGORY.MISCELLANEOUS, label: BUDGET_ITEM_CATEGORY.MISCELLANEOUS },
] as const;

// Form Intents
export const BUDGET_INTENTS = {
  CREATE_BUDGET_ITEM: 'createBudgetItem',
  UPDATE_BUDGET_ITEM: 'updateBudgetItem',
  DELETE_BUDGET_ITEM: 'deleteBudgetItem',
} as const;

// Form Field Names
export const BUDGET_FORM_FIELDS = {
  INTENT: 'intent',
  BUDGET_ITEM_ID: 'budgetItemId',
  EVENT_ID: 'eventId',
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory',
  DESCRIPTION: 'description',
  ESTIMATED_COST: 'estimatedCost',
  ACTUAL_COST: 'actualCost',
  STATUS: 'status',
  NOTES: 'notes',
  ASSIGNED_USER: 'assignedUser',
  STRATEGIC_GOAL_ID: 'strategicGoalId',
  VENDOR: 'vendor',
  VENDOR_ID: 'vendorId',
  FILE_ATTACHMENT: 'fileAttachment',
} as const;

// Default Form Values
export const DEFAULT_BUDGET_FORM_DATA = {
  category: '',
  subcategory: '',
  description: '',
  estimatedCost: '',
  actualCost: '',
  status: BUDGET_ITEM_STATUS.PENDING,
  notes: '',
  assignedUser: '',
  strategicGoalId: '',
  vendor: '',
  vendorId: '',
  fileAttachment: null,
} as const;

// Messages
export const BUDGET_MESSAGES = {
  TITLE: 'Budget Planner',
  DESCRIPTION: 'Manage budget line items with detailed tracking and role-based access',
  DEMO_MODE: 'Demo Mode: Changes are not saved',
  NO_ITEMS: 'No budget items found.',
  NO_ITEMS_WITH_EVENT: 'Click "Add Line Item" to create one.',
  NO_ITEMS_WITHOUT_EVENT: 'Select an event to add budget items.',
  EVENT_LABEL: 'Event:',
  SHOWING_ALL_EVENTS: 'Showing budgets for all events',
  ADD_LINE_ITEM: 'Add Line Item',
  EDIT_BUDGET_ITEM: 'Edit Budget Item',
  ADD_BUDGET_ITEM: 'Add Budget Item',
  DELETE_BUDGET_ITEM: 'Delete Budget Item',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this budget item? This action cannot be undone.',
  DELETE_SUCCESS: 'Budget item deleted successfully',
  CREATED_SUCCESS: 'Budget item created successfully',
  UPDATED_SUCCESS: 'Budget item updated successfully',
  SELECT_EVENT_ERROR: 'Please select an event first',
  DEMO_MODE_TITLE: 'Demo Mode',
  DEMO_MODE_DESCRIPTION: 'This budget item won\'t be saved in demo mode.',
  UPDATING: 'Updating...',
  ADDING: 'Adding...',
  UPDATE: 'Update',
  ADD: 'Add',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  LINE_ITEM: 'Line Item',
} as const;

// Table Headers
export const BUDGET_TABLE_HEADERS = {
  EVENT: 'Event',
  CATEGORY: 'Category',
  SUBCATEGORY: 'Subcategory',
  DESCRIPTION: 'Description',
  ESTIMATED: 'Estimated',
  ACTUAL: 'Actual',
  VARIANCE: 'Variance',
  STATUS: 'Status',
  ASSIGNED: 'Assigned',
  ACTIONS: 'Actions',
} as const;

// Summary Labels
export const BUDGET_SUMMARY_LABELS = {
  TOTAL_ALLOCATED: 'Total Allocated',
  TOTAL_SPENT: 'Total Spent',
  REMAINING: 'Remaining',
  PERCENTAGE_SPENT: 'Percentage Spent',
  CATEGORY_BREAKDOWN: 'Category Breakdown',
  BUDGET_LINE_ITEMS: 'Budget Line Items',
} as const;

// Form Labels
export const BUDGET_FORM_LABELS = {
  CATEGORY: 'Category',
  SUBCATEGORY: 'Subcategory',
  DESCRIPTION: 'Description',
  ESTIMATED_SPEND: 'Estimated Spend',
  ACTUAL_SPEND: 'Actual Spend',
  STATUS: 'Status',
  ASSIGNED_USER: 'Assigned User',
  VENDOR: 'Vendor',
  STRATEGIC_GOAL_MAPPING: 'Strategic Goal Mapping',
  NOTES: 'Notes',
  FILE_ATTACHMENT: 'File Attachment',
  READ_ONLY: '(Read-only)',
  SELECT_CATEGORY: 'Select a category',
  SELECT_USER: 'Select user',
  SELECT_STATUS: 'Select status',
  NO_VENDOR_SELECTED: 'No vendor selected',
  NO_STRATEGIC_GOAL: 'No strategic goal',
  NO_VENDORS_AVAILABLE: 'No vendors available.',
  ADD_VENDORS: 'Add vendors',
  NO_STRATEGIC_GOALS_AVAILABLE: 'No strategic goals available. Create goals in the Strategic Goals section.',
  ADD_NOTES_PLACEHOLDER: 'Add any additional notes...',
  SUBCATEGORY_PLACEHOLDER: 'e.g., Rental, Equipment, Meals',
  DESCRIPTION_PLACEHOLDER: 'Enter description',
  COST_PLACEHOLDER: '0.00',
} as const;

// Expanded Row Labels
export const BUDGET_EXPANDED_LABELS = {
  NOTES: 'Notes',
  NO_NOTES: 'No notes',
  FILE_ATTACHMENT: 'File Attachment',
  VIEW_ATTACHMENT: 'View Attachment',
  NO_ATTACHMENT: 'No attachment',
  STRATEGIC_GOAL: 'Strategic Goal',
  NOT_MAPPED: 'Not mapped',
  VENDOR: 'Vendor',
  AUDIT_LOG: 'Audit Log',
  LAST_EDITED_BY: 'Last edited by:',
} as const;

// Variance Labels
export const BUDGET_VARIANCE_LABELS = {
  UNDER: 'under',
  OVER: 'over',
} as const;

// Role Permissions
export const BUDGET_ROLE_PERMISSIONS = {
  CAN_EDIT_ESTIMATED: [USER_ROLES.ADMIN_LOWERCASE, 'marketing', 'eventmanager'],
  CAN_EDIT_ACTUAL: [USER_ROLES.ADMIN_LOWERCASE, 'finance', 'accountant', 'eventmanager'],
  CAN_EDIT_ALL: [USER_ROLES.ADMIN_LOWERCASE, 'eventmanager'],
} as const;

// Empty States
export const BUDGET_EMPTY_STATES = {
  NO_ITEMS: DEFAULT_STRINGS.NA,
  NO_VENDOR: DEFAULT_STRINGS.NA,
  NO_USER: '-',
  NO_SUBCATEGORY: '-',
} as const;


/**
 * Budget data transformation utilities
 */

import { BUDGET_ITEM_STATUS, DEFAULT_BUDGET_FORM_DATA } from '~/constants/budget';
import { DEFAULT_STRINGS } from '~/constants/common';
import { parseDecimal } from './budgetHelpers';

export interface BudgetLineItem {
  id: string | number;
  category: string;
  subcategory?: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  status: string;
  notes?: string;
  fileAttachment?: string;
  assignedUser?: string;
  assignedUserId?: string;
  strategicGoalId?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  vendor?: string;
  vendorId?: string;
  eventId?: string;
  eventName?: string;
}

/**
 * Transform budget item from API format to display format
 */
export function transformBudgetItem(
  item: any,
  getEventName: (eventId?: string) => string,
  currentUserName?: string
): BudgetLineItem {
  const estimated = parseDecimal(item.estimatedCost);
  const actual = parseDecimal(item.actualCost);
  const variance = estimated - actual;

  // Extract vendor information - check both vendor (text field) and vendorLink (relation)
  const vendorName = item.vendor || item.vendorLink?.name || '';
  const vendorIdValue = item.vendorId || item.vendorLink?.id || '';
  
  // Extract assigned user ID - check both direct field and object
  const assignedUserIdValue = item.assignedUserId || 
    (typeof item.assignedUser === 'object' && item.assignedUser?.id ? item.assignedUser.id : '') ||
    '';

  return {
    id: item.id,
    category: item.category || '',
    subcategory: item.subcategory || '',
    description: item.description || '',
    estimatedCost: estimated,
    actualCost: actual,
    variance,
    status: (item.status || BUDGET_ITEM_STATUS.PENDING) as string,
    notes: item.notes || '',
    fileAttachment: item.fileAttachment || '',
    assignedUser: typeof item.assignedUser === 'string' 
      ? item.assignedUser 
      : (item.assignedUser?.fullName || item.assignedUser?.name || item.assignedUser?.email || ''),
    assignedUserId: assignedUserIdValue,
    strategicGoalId: item.strategicGoalId || '',
    lastEditedBy: item.lastEditedBy || item.updatedBy || currentUserName || DEFAULT_STRINGS.UNKNOWN,
    lastEditedAt: item.updatedAt || item.lastEditedAt || new Date().toISOString(),
    vendor: vendorName,
    vendorId: vendorIdValue,
    eventId: item.eventId || '',
    eventName: getEventName(item.eventId),
  };
}

/**
 * Transform multiple budget items
 */
export function transformBudgetItems(
  items: any[],
  getEventName: (eventId?: string) => string,
  currentUserName?: string
): BudgetLineItem[] {
  return items.map(item => transformBudgetItem(item, getEventName, currentUserName));
}

/**
 * Get default form data
 */
export function getDefaultFormData(): {
  category: string;
  subcategory: string;
  description: string;
  estimatedCost: string;
  actualCost: string;
  status: string;
  notes: string;
  assignedUser: string;
  strategicGoalId: string;
  vendor: string;
  vendorId: string;
  fileAttachment: null;
} {
  return {
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
  };
}


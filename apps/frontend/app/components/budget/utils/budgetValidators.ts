/**
 * Budget validation utilities
 */

import { BUDGET_MESSAGES } from '~/constants/budget';

/**
 * Validate budget form data
 */
export function validateBudgetForm(formData: {
  category: string;
  description: string;
  estimatedCost?: string | number;
  actualCost?: string | number;
}): { isValid: boolean; error?: string } {
  if (!formData.category) {
    return { isValid: false, error: 'Category is required' };
  }
  
  if (!formData.description || formData.description.trim() === '') {
    return { isValid: false, error: 'Description is required' };
  }

  return { isValid: true };
}

/**
 * Validate event selection for budget item creation
 */
export function validateEventSelection(eventId?: string | null): { isValid: boolean; error?: string } {
  if (!eventId) {
    return { isValid: false, error: BUDGET_MESSAGES.SELECT_EVENT_ERROR };
  }
  return { isValid: true };
}


/**
 * Expense validation utilities
 */

/**
 * Validate expense form data
 */
export function validateExpenseForm(data: {
  eventId?: string;
  category?: string;
  title?: string;
  amount?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.eventId) {
    errors.push('Event is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.amount) {
    errors.push('Amount is required');
  } else {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}



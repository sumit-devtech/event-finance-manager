/**
 * Utility functions for common operations across the application
 */

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a date string or Date object
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Get status color classes for budget items
 */
export function getBudgetStatusColor(status: string): string {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
    case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Get status color classes for expenses
 */
export function getExpenseStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Get status color classes for events
 */
export function getEventStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-gray-100 text-gray-700';
    case 'active': return 'bg-green-100 text-green-700';
    case 'planning': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get variance color based on value
 */
export function getVarianceColor(variance: number): string {
  return variance >= 0 ? 'text-green-600' : 'text-red-600';
}


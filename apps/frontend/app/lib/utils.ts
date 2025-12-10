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
 * Get status color classes for budget items - Enterprise Design System
 */
export function getBudgetStatusColor(status: string): string {
  switch (status) {
    case 'Approved': return 'bg-[#1BBE63]/10 text-[#1BBE63]';
    case 'Pending': return 'bg-[#FF751F]/10 text-[#FF751F]';
    case 'Rejected': return 'bg-[#D92C2C]/10 text-[#D92C2C]';
    default: return 'bg-[#F3F3F6] text-[#5E5E5E]';
  }
}

/**
 * Get status color classes for expenses - Enterprise Design System
 */
export function getExpenseStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved': return 'bg-[#1BBE63]/10 text-[#1BBE63]';
    case 'pending': return 'bg-[#FF751F]/10 text-[#FF751F]';
    case 'rejected': return 'bg-[#D92C2C]/10 text-[#D92C2C]';
    default: return 'bg-[#F3F3F6] text-[#5E5E5E]';
  }
}

/**
 * Get status color classes for events - Enterprise Design System
 */
export function getEventStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-[#F3F3F6] text-[#5E5E5E]';
    case 'active': return 'bg-[#1BBE63]/10 text-[#1BBE63]';
    case 'planning': return 'bg-[#4B8CF7]/10 text-[#4B8CF7]';
    case 'cancelled': return 'bg-[#D92C2C]/10 text-[#D92C2C]';
    default: return 'bg-[#F3F3F6] text-[#5E5E5E]';
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


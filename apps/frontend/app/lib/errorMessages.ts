/**
 * Error Message Utilities
 * Provides user-friendly error messages based on error types
 */

export interface ErrorContext {
  statusCode?: number;
  errorType?: string;
  field?: string;
  operation?: string;
}

/**
 * Maps error messages to user-friendly messages with recovery suggestions
 */
export function getErrorMessage(error: unknown, context?: ErrorContext): string {
  // Handle string errors
  if (typeof error === 'string') {
    return mapErrorMessage(error, context);
  }

  // Handle Error objects
  if (error instanceof Error) {
    return mapErrorMessage(error.message, context);
  }

  // Handle objects with error/message properties
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    const message = errorObj.message || errorObj.error || errorObj.errorMessage;
    if (message) {
      return mapErrorMessage(message, context);
    }
  }

  // Default fallback
  return getDefaultErrorMessage(context);
}

/**
 * Maps specific error patterns to user-friendly messages
 */
function mapErrorMessage(message: string, context?: ErrorContext): string {
  const lowerMessage = message.toLowerCase();
  const statusCode = context?.statusCode;

  // Network/Connection errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication') || statusCode === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  // Permission errors
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission') || statusCode === 403) {
    return 'You do not have permission to perform this action. Please contact your administrator.';
  }

  // Not found errors
  if (lowerMessage.includes('not found') || statusCode === 404) {
    const resource = context?.operation || 'resource';
    return `The ${resource} you're looking for could not be found. It may have been deleted or moved.`;
  }

  // Validation errors
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || statusCode === 400) {
    if (context?.field) {
      return `Invalid ${context.field}. Please check your input and try again.`;
    }
    return 'Invalid input. Please check all fields and try again.';
  }

  // Server errors
  if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
    return 'The server encountered an error. Please try again in a few moments. If the problem persists, contact support.';
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || statusCode === 504) {
    return 'The request took too long to complete. Please try again.';
  }

  // File upload errors
  if (lowerMessage.includes('file') || lowerMessage.includes('upload')) {
    if (lowerMessage.includes('size') || lowerMessage.includes('too large')) {
      return 'File size exceeds the limit. Please upload a smaller file (maximum 10MB).';
    }
    if (lowerMessage.includes('type') || lowerMessage.includes('format')) {
      return 'File type not supported. Please upload a valid file format (images, PDFs, or Office documents).';
    }
    return 'File upload failed. Please check the file and try again.';
  }

  // Database errors
  if (lowerMessage.includes('database') || lowerMessage.includes('prisma')) {
    return 'A database error occurred. Please try again. If the problem persists, contact support.';
  }

  // Duplicate/Conflict errors
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists') || statusCode === 409) {
    return 'This item already exists. Please use a different name or identifier.';
  }

  // Rate limiting
  if (lowerMessage.includes('rate limit') || statusCode === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Specific field errors
  if (context?.field) {
    if (lowerMessage.includes('required')) {
      return `${context.field} is required. Please fill in this field.`;
    }
    if (lowerMessage.includes('must be')) {
      return `Invalid ${context.field}. ${message}`;
    }
  }

  // Return original message if it's already user-friendly, otherwise provide generic message
  if (message.length < 100 && !message.includes('Error') && !message.includes('Exception')) {
    return message;
  }

  return getDefaultErrorMessage(context);
}

/**
 * Gets a default error message based on context
 */
function getDefaultErrorMessage(context?: ErrorContext): string {
  const operation = context?.operation || 'operation';
  
  if (context?.statusCode) {
    switch (context.statusCode) {
      case 400:
        return `Invalid request. Please check your input and try again.`;
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return `The ${operation} you're looking for could not be found.`;
      case 409:
        return `This ${operation} already exists. Please use a different identifier.`;
      case 422:
        return `Invalid data provided. Please check all fields and try again.`;
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
        return 'The server encountered an error. Please try again later.';
      case 504:
        return 'The request timed out. Please try again.';
      default:
        return `An error occurred while ${operation}. Please try again.`;
    }
  }

  return `An error occurred. Please try again. If the problem persists, contact support.`;
}

/**
 * Extracts error message from API response
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const errorObj = error as any;
    return errorObj.message || errorObj.error || errorObj.errorMessage || 'An unknown error occurred';
  }

  return 'An unknown error occurred';
}



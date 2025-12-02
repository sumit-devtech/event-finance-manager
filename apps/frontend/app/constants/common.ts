/**
 * Common constants used across the application
 */

export const DEFAULT_STRINGS = {
  NA: 'N/A',
  UNKNOWN: 'Unknown',
  UNKNOWN_EVENT: 'Unknown Event',
  UNKNOWN_SIZE: 'Unknown size',
  UNTITLED: 'Untitled',
  NO_DESCRIPTION: 'No description provided',
  FILE: 'file',
} as const;

export const API_ENDPOINTS = {
  EXPENSES: '/expenses',
  FILES: (fileId: string) => `/files/${fileId}`,
} as const;

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] as const;

export const SUPPORTED_MIME_TYPES = {
  IMAGE: 'image/',
  OCTET_STREAM: 'application/octet-stream',
} as const;

export const DATE_FORMATS = {
  LOCALE: 'en-US',
  DATE_OPTIONS: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  },
  DATETIME_OPTIONS: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const FILTER_DEFAULTS = {
  ALL: 'all',
} as const;



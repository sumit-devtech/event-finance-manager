/**
 * Event validation utilities
 */

import type { User } from "~/lib/auth";
import { FREE_EVENT_LIMIT_MESSAGE } from "~/constants/events";

/**
 * Check if user can create more events (free tier limit)
 */
export function canCreateEvent(user: User | null, isDemo: boolean): boolean {
  if (isDemo) return true;
  if (!user) return false;
  
  const isFreeUser = user.subscription === 'free';
  const freeEventsRemaining = user.freeEventsRemaining || 0;
  
  return !isFreeUser || freeEventsRemaining > 0;
}

/**
 * Validate event limit for free users
 */
export function validateEventLimit(user: User | null, isDemo: boolean): { canCreate: boolean; message?: string } {
  if (isDemo) {
    return { canCreate: true };
  }
  
  if (!user) {
    return { canCreate: false, message: 'User not found' };
  }
  
  const isFreeUser = user.subscription === 'free';
  const freeEventsRemaining = user.freeEventsRemaining || 0;
  
  if (isFreeUser && freeEventsRemaining <= 0) {
    return { canCreate: false, message: FREE_EVENT_LIMIT_MESSAGE };
  }
  
  return { canCreate: true };
}

/**
 * Validate event form data
 */
export function validateEventForm(data: {
  name?: string;
  type?: string;
  status?: string;
  startDate?: string;
  budget?: number | string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Event name is required');
  }
  
  if (!data.type) {
    errors.push('Event type is required');
  }
  
  if (!data.status) {
    errors.push('Status is required');
  }
  
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  
  if (!data.budget || (typeof data.budget === 'string' && parseFloat(data.budget) <= 0)) {
    errors.push('Budget must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}


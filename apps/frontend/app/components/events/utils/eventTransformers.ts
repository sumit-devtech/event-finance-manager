/**
 * Event data transformation utilities
 */

import type { EventWithDetails } from "~/types";
import { getBudgetHealth } from "./eventHelpers";

export interface TransformedEvent {
  id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  location: string;
  venue?: string;
  attendees: number;
  budget: number;
  spent: number;
  budgetPercentage: number;
  budgetHealth: string;
  roi: number | null;
  region: string | null;
  owner: string;
  formattedDate: string;
  _original: EventWithDetails;
}

/**
 * Transform API event to component format
 */
export function transformEvent(event: EventWithDetails): TransformedEvent {
  const budget = event.budget || 0;
  const spent = event.spent || 0;
  const budgetPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const budgetHealth = getBudgetHealth(event);
  const date = event.date || event.startDate;
  const formattedDate = date ? new Date(date).toLocaleDateString() : 'TBD';
  const region = event.region || (event.location ? event.location.split(',')[1]?.trim() : null);

  return {
    id: event.id,
    name: event.name,
    type: event.type || event.eventType || 'Event',
    status: event.status || 'planning',
    date: date ? new Date(date).toISOString().split('T')[0] : '',
    location: event.location || 'TBD',
    venue: event.venue || (event as any).venueName,
    attendees: event.attendees || 0,
    budget,
    spent,
    budgetPercentage,
    budgetHealth,
    roi: event.roiPercent || event.roi || null,
    region,
    owner: event.owner || event.organizer || event.createdBy || 'Unassigned',
    formattedDate,
    _original: event,
  };
}

/**
 * Transform multiple events
 */
export function transformEvents(events: EventWithDetails[]): TransformedEvent[] {
  return events.map(transformEvent);
}


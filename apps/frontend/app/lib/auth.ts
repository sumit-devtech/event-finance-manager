/**
 * Auth Types
 * 
 * Type definitions for authentication.
 * 
 * Note: This file only exports types and interfaces to ensure it's safe
 * for client-side type imports. All server-side auth functions are in auth.server.ts
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  organizationId?: string;
  subscription?: 'free' | 'pro' | 'enterprise';
  freeEventsRemaining?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}


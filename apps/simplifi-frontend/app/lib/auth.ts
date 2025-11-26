/**
 * Auth Utilities
 * 
 * Utilities for handling authentication in Remix loaders and actions
 */

import { redirect } from "@remix-run/node";
import { api } from "./api";
import { getAuthTokenFromSession } from "./session";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  organizationId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Get current user from API using token from request
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  const token = await getAuthTokenFromSession(request);
  if (!token) return null;

  try {
    const user = await api.get<User>("/auth/me", {
      token,
    });
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(request: Request): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

/**
 * Require specific role - redirects to unauthorized if role doesn't match
 */
export async function requireRole(
  request: Request,
  allowedRoles: string[],
): Promise<User> {
  const user = await requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw redirect("/unauthorized");
  }
  return user;
}

/**
 * Login user and set auth tokens
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", { email, password });
}

/**
 * Register new user
 */
export async function register(
  organizationName: string,
  industry: string | null,
  adminEmail: string,
  adminFullName: string,
  adminPassword: string,
): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/signup", {
    organizationName,
    industry,
    adminEmail,
    adminFullName,
    adminPassword,
  });
}

/**
 * Logout user
 */
export async function logout(request: Request): Promise<void> {
  const token = await getAuthTokenFromSession(request);
  if (token) {
    try {
      await api.post("/auth/logout", {}, { token });
    } catch (error) {
      // Continue with logout even if API call fails
    }
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/refresh", { refreshToken });
}


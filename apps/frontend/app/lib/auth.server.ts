/**
 * Auth Server Utilities
 * 
 * Server-side authentication utilities for Remix loaders and actions.
 * These functions run on the server and can access cookies/sessions.
 */

import { redirect } from "@remix-run/node";
import { api, getAuthTokenFromRequest } from "./api";
import {
  getSessionFromRequest,
  getAuthTokenFromSession,
  setAuthTokensInSession,
  clearAuthTokensFromSession,
  commitSession,
  destroySession,
} from "./session";
import type { User, AuthResponse } from "./auth";

/**
 * Get current user from session or API
 * This is the server-side version that works in loaders/actions
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  const session = await getSessionFromRequest(request);
  
  // First try to get user from session (set during login)
  const userFromSession = session.get("user");
  if (userFromSession) {
    return userFromSession as User;
  }

  // If no user in session, try to validate token with API
  const token = await getAuthTokenFromSession(request);
  if (!token) return null;

  try {
    // Try to get user from API (if /auth/me endpoint exists)
    // For now, we'll rely on session storage
    // If needed, uncomment below and add /auth/me endpoint to backend
    // const user = await api.get<User>("/auth/me", { token });
    // return user;
    return null;
  } catch (error) {
    // If token is invalid, clear session
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in loaders to protect routes
 */
export async function requireAuth(request: Request): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) {
    const searchParams = new URL(request.url).searchParams;
    const redirectTo = searchParams.get("redirectTo") || "/";
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
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
 * Login user and set session
 * Returns headers to set the session cookie
 */
export async function loginUser(
  email: string,
  password: string,
  redirectTo: string = "/",
) {
  try {
    // Call login API
    const authResponse = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    // Set tokens in session
    const session = await setAuthTokensInSession(
      authResponse.accessToken,
      authResponse.refreshToken,
      authResponse.user,
    );

    // Commit session and get cookie header
    const cookieHeader = await commitSession(session);

    return {
      user: authResponse.user,
      headers: {
        "Set-Cookie": cookieHeader,
      },
      redirectTo,
    };
  } catch (error: any) {
    // Return error for display
    return {
      error: error.message || "Invalid email or password",
      headers: {},
    };
  }
}

/**
 * Logout user and clear session
 * Returns headers to clear the session cookie
 */
export async function logoutUser(request: Request) {
  const token = await getAuthTokenFromSession(request);

  // Call logout API if token exists
  if (token) {
    try {
      await api.post("/auth/logout", {}, { token });
    } catch (error) {
      // Continue with logout even if API call fails
    }
  }

  // Clear session
  const session = await getSessionFromRequest(request);
  const cookieHeader = await destroySession(session);

  return {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  };
}


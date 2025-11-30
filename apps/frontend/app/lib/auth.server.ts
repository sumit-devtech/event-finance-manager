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
    // Log error for debugging
    console.error("Login error:", error);
    
    // Extract error message from ApiClientError or other error types
    let errorMessage = "Invalid email or password";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Return error for display
    return {
      error: errorMessage,
      headers: {},
    };
  }
}

/**
 * Logout user and call logout API
 * Note: Session clearing should be done in the route action, not here
 */
export async function logoutUser(request: Request) {
  const token = await getAuthTokenFromSession(request);

  // Call logout API if token exists
  if (token) {
    try {
      await api.post("/auth/logout", {}, { token });
    } catch (error) {
      // Log error but continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    }
  }
}


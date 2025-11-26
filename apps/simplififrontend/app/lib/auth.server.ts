/**
 * Server-side Auth Utilities
 * 
 * Re-export auth utilities for server-side use
 */

export * from "./auth";
export { getAuthTokenFromSession, setAuthTokenInSession, removeAuthTokenFromSession } from "./session";

/**
 * Check if user is authenticated and redirect if needed
 */
export async function loaderCheckUserAuthenticated({ request }: { request: Request }) {
  const { getCurrentUser } = await import("./auth.server");
  const user = await getCurrentUser(request);
  
  if (user) {
    return { user, isAuthenticated: true };
  }
  
  return { user: null, isAuthenticated: false };
}

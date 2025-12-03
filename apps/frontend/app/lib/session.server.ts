/**
 * Session Utilities (Server-only)
 * 
 * Utilities for managing session data (cookies) in Remix
 * 
 * Note: This file uses .server.ts extension to ensure it's never bundled for the client.
 * The createCookieSessionStorage function is server-only and will cause errors if bundled.
 */

import { createCookieSessionStorage } from "@remix-run/node";

import { env } from "./env";

const sessionSecret = env.SESSION_SECRET;

if (!sessionSecret || sessionSecret === "default-session-secret-change-in-production") {
  console.warn(
    "⚠️  WARNING: Using default session secret. Set SESSION_SECRET environment variable in production!",
  );
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

/**
 * Get session from request
 */
export async function getSessionFromRequest(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

/**
 * Get auth token from session
 */
export async function getAuthTokenFromSession(request: Request): Promise<string | null> {
  const session = await getSessionFromRequest(request);
  return session.get("accessToken") || null;
}

/**
 * Set auth tokens in session
 */
export async function setAuthTokensInSession(
  accessToken: string,
  refreshToken: string,
  user: any,
  cookieHeader?: string | null,
) {
  // Use existing session from request if provided, otherwise create new one
  const session = await getSession(cookieHeader || undefined);
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);
  session.set("user", user);
  return session;
}

/**
 * Clear auth tokens from session
 */
export async function clearAuthTokensFromSession() {
  const session = await getSession();
  session.unset("accessToken");
  session.unset("refreshToken");
  session.unset("user");
  return session;
}


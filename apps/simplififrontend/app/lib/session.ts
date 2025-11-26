/**
 * Session Management
 * 
 * Utilities for managing user sessions and authentication tokens
 */

import { createCookieSessionStorage } from "@remix-run/node";
import { env } from "./env";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__simplifi_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [env.SESSION_SECRET],
    secure: env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session: any) {
  return sessionStorage.destroySession(session);
}

export async function getAuthTokenFromSession(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get("authToken") || null;
}

export async function setAuthTokenInSession(request: Request, token: string): Promise<string> {
  const session = await getSession(request);
  session.set("authToken", token);
  return commitSession(session);
}

export async function removeAuthTokenFromSession(request: Request): Promise<string> {
  const session = await getSession(request);
  session.unset("authToken");
  return commitSession(session);
}


/**
 * Environment Variables
 * 
 * Centralized access to environment variables with defaults.
 * 
 * How it works:
 * 1. Values are stored in `.env` file (create from `.env.example`)
 * 2. Remix/Vite loads `.env` files:
 *    - Server-side: `process.env` (Node.js)
 *    - Client-side: `import.meta.env` (Vite)
 * 3. This file provides type-safe access with defaults
 * 
 * Benefits:
 * - Type safety and autocomplete in IDE
 * - Default values for development
 * - Single source of truth for what env vars are needed
 * - Validation/documentation of required variables
 * 
 * Note: Only variables prefixed with `VITE_` are exposed to the client.
 * For client-side access, use `VITE_API_BASE_URL` instead of `API_BASE_URL`.
 */

// Helper to get env var from either process.env (server) or import.meta.env (client)
function getEnvVar(key: string, viteKey: string, defaultValue: string): string {
  // Server-side (Node.js) - check process.env first
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  // Client-side (Vite) - use import.meta.env with VITE_ prefix
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const viteValue = import.meta.env[viteKey];
    if (viteValue) {
      return viteValue;
    }
  }
  return defaultValue;
}

export const env = {
  // Backend API runs on port 3333, frontend should run on different port (5173)
  // Backend uses /api prefix, so endpoints are at /api/auth/login, etc.
  // Use VITE_API_BASE_URL in .env for client-side access
  API_BASE_URL: getEnvVar("API_BASE_URL", "VITE_API_BASE_URL", "http://localhost:3333/api"),
  // SESSION_SECRET is server-only, should not be exposed to client
  // This will only work server-side
  SESSION_SECRET: typeof process !== "undefined" && process.env 
    ? (process.env.SESSION_SECRET || "default-session-secret-change-in-production")
    : "default-session-secret-change-in-production",
  NODE_ENV: getEnvVar("NODE_ENV", "MODE", "development"),
} as const;


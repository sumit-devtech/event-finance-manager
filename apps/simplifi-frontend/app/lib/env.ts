/**
 * Environment Variables
 * 
 * Centralized access to environment variables with defaults.
 */

function getEnvVar(key: string, defaultValue: string): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const viteValue = import.meta.env[key];
    if (viteValue) {
      return viteValue;
    }
  }
  return defaultValue;
}

export const env = {
  API_BASE_URL: getEnvVar("API_BASE_URL", "http://localhost:3334/api/v1"),
  SESSION_SECRET: typeof process !== "undefined" && process.env 
    ? (process.env.SESSION_SECRET || "default-session-secret-change-in-production")
    : "default-session-secret-change-in-production",
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
} as const;


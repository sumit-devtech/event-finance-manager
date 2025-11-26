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

// Get backend configuration from environment variables
// BACKEND_PORT should NOT use PORT (which is for frontend server)
// Default to 3333 to match backend-simplifi default port
const BACKEND_PORT = getEnvVar("BACKEND_PORT", "3333");
const BACKEND_HOST = getEnvVar("BACKEND_HOST", "localhost");

// Build API_BASE_URL from environment variables
// If API_BASE_URL is explicitly set, use it; otherwise construct from components
const explicitApiUrl = getEnvVar("API_BASE_URL", "");
const apiBaseUrl = explicitApiUrl || `http://${BACKEND_HOST}:${BACKEND_PORT}/api/v1`;

export const env = {
  API_BASE_URL: apiBaseUrl,
  BACKEND_PORT,
  BACKEND_HOST,
  SESSION_SECRET: typeof process !== "undefined" && process.env 
    ? (process.env.SESSION_SECRET || "default-session-secret-change-in-production")
    : "default-session-secret-change-in-production",
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
} as const;

// Log API URL in development for debugging
if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  console.log("[ENV] API_BASE_URL:", env.API_BASE_URL);
  console.log("[ENV] Backend:", `${env.BACKEND_HOST}:${env.BACKEND_PORT}`);
}


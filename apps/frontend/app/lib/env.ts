/**
 * Environment Variables
 * 
 * Centralized access to environment variables with defaults.
 * 
 * How it works:
 * 1. Values are stored in `.env` file (create from `.env.example`)
 * 2. Remix automatically loads `.env` files into `process.env`
 * 3. This file provides type-safe access with defaults
 * 
 * Benefits:
 * - Type safety and autocomplete in IDE
 * - Default values for development
 * - Single source of truth for what env vars are needed
 * - Validation/documentation of required variables
 */

export const env = {
  // Backend API runs on port 3333, frontend should run on different port (5173)
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3333/api",
  SESSION_SECRET: process.env.SESSION_SECRET || "default-session-secret-change-in-production",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;


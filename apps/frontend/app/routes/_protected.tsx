/**
 * Protected Route Wrapper
 * 
 * This file demonstrates how to protect routes using the requireAuth utility.
 * Any route that imports and uses requireAuth in its loader will be protected.
 * 
 * Example usage in a route file:
 * 
 * import { requireAuth } from "~/lib/auth.server";
 * 
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   const user = await requireAuth(request);
 *   // User is guaranteed to be authenticated here
 *   return json({ user });
 * }
 */

import { type LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/lib/auth.server";

/**
 * Example protected loader
 * This demonstrates the pattern for protecting routes
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // This will redirect to /login if not authenticated
  const user = await requireAuth(request);
  
  return {
    user,
    message: "This is a protected route",
  };
}


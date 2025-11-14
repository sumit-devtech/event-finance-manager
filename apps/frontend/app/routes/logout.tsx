import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { logoutUser } from "~/lib/auth.server";
import { getSessionFromRequest, destroySession } from "~/lib/session";

/**
 * Action - handle logout
 */
export async function action({ request }: ActionFunctionArgs) {
  const session = await getSessionFromRequest(request);
  
  // Call logout API if token exists
  const token = session.get("accessToken");
  if (token) {
    try {
      await logoutUser(request);
    } catch (error) {
      // Log error but continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    }
  }

  // Clear all session data
  session.unset("accessToken");
  session.unset("refreshToken");
  session.unset("user");

  // Destroy session and get cookie header to clear it
  const cookieHeader = await destroySession(session);
  
  console.log("Logout: Cookie header to set:", cookieHeader);
  
  // Use redirect with headers - Remix will handle the Set-Cookie header
  return redirect("/login", {
    headers: {
      "Set-Cookie": cookieHeader,
    },
  });
}

/**
 * Loader - redirect to login (for GET requests)
 */
export async function loader() {
  return redirect("/login");
}


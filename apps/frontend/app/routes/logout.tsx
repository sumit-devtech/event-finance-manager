import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { logoutUser } from "~/lib/auth.server";
import { getSessionFromRequest, destroySession } from "~/lib/session";

/**
 * Action - handle logout
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const result = await logoutUser(request);
    return redirect("/login", {
      headers: result.headers,
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if logout fails, try to clear session and redirect
    const session = await getSessionFromRequest(request);
    const cookieHeader = await destroySession(session);
    return redirect("/login", {
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  }
}

/**
 * Loader - redirect to login if not authenticated
 */
export async function loader() {
  return redirect("/login");
}

export default function Logout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <Form method="post">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}


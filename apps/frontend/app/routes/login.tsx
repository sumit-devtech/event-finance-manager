import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { loginUser } from "~/lib/auth.server";
import { getCurrentUser } from "~/lib/auth.server";

/**
 * Loader - redirect to home if already logged in
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getCurrentUser(request);
    if (user) {
      return redirect("/");
    }
  } catch (error) {
    // If there's an error getting user (e.g., invalid session), continue to login page
    console.error("Error checking current user:", error);
  }
  
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";
  
  return json({ redirectTo });
}

/**
 * Action - handle login form submission
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/";

  // Validation
  if (!email || !password) {
    return json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return json(
      { error: "Invalid form data" },
      { status: 400 },
    );
  }

  if (typeof redirectTo !== "string") {
    return json(
      { error: "Invalid redirect" },
      { status: 400 },
    );
  }

  // Attempt login
  const result = await loginUser(email, password, redirectTo || "/");

  if (result.error) {
    return json(
      { error: result.error },
      { status: 401 },
    );
  }

  // Success - redirect with session cookie
  return redirect(result.redirectTo || "/", {
    headers: result.headers as HeadersInit,
  });
}

export default function Login() {
  const { redirectTo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Event Finance Manager
          </p>
        </div>
        
        <Form method="post" className="mt-8 space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          
          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {actionData.error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}


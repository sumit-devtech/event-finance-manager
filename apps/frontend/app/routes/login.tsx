import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { loginUser } from "~/lib/auth.server";
import { getCurrentUser } from "~/lib/auth.server";
import { AuthPage } from "~/components/AuthPage";

/**
 * Loader - redirect to dashboard if already logged in
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getCurrentUser(request);
    if (user) {
      return redirect("/dashboard");
    }
  } catch (error) {
    // If there's an error getting user (e.g., invalid session), continue to login page
    console.error("Error checking current user:", error);
  }
  
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
  
  return json({ redirectTo });
}

/**
 * Action - handle login form submission
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const redirectTo = formData.get("redirectTo") || "/dashboard";

  // Handle demo login - redirect to demo dashboard (no auth required)
  if (intent === "demo") {
    return redirect("/demo/dashboard");
  }

  const email = formData.get("email");
  const password = formData.get("password");

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

  // Handle registration
  if (intent === "register") {
    const name = formData.get("name");
    const confirmPassword = formData.get("confirmPassword");
    const accountType = formData.get("accountType");

    if (!name || typeof name !== "string") {
      return json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    // TODO: Implement registration logic
    // For now, redirect to login after "registration"
    return json(
      { error: "Registration is not yet implemented. Please use login." },
      { status: 400 },
    );
  }

  // Attempt login
  const result = await loginUser(email, password, redirectTo || "/dashboard");

  if (result.error) {
    return json(
      { error: result.error },
      { status: 401 },
    );
  }

  // Success - redirect with session cookie
  return redirect(result.redirectTo || "/dashboard", {
    headers: result.headers as HeadersInit,
  });
}

export default function Login() {
  const { redirectTo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return <AuthPage />;
}


import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { loginUser } from "~/lib/auth.server";
import { getSessionFromRequest } from "~/lib/session";
import { AuthPage } from "~/components/AuthPage";

/**
 * Loader - redirect to dashboard if already logged in
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // OPTIMIZE: Check session directly instead of making API call
  const session = await getSessionFromRequest(request);
  const userFromSession = session.get("user");
  console.log("userFromSession", userFromSession);

  // If user exists in session, redirect immediately (no API call needed)
  if (userFromSession) {
    return redirect("/dashboard");
  }
  const url = new URL(request.url);
  console.log("url", url);

  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
  console.log("redirectTo", redirectTo);

  
  return json({ redirectTo });
}

/**
 * Action - handle login form submission
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const redirectTo = formData.get("redirectTo") || "/dashboard";

  // Handle demo login - redirect to dashboard with demo parameter (no auth required)
  if (intent === "demo") {
    return redirect("/dashboard?demo=true");
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

    if (password.length < 6) {
      return json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Attempt registration
    try {
      // Call registration API directly (server-side)
      const { api } = await import("~/lib/api");
      const registrationResponse = await api.post<{ message: string; email: string }>("/auth/register", {
        email,
        password,
        name,
      });

      // Registration successful - redirect to email verification page
      return redirect(`/auth/verify-email?email=${encodeURIComponent(registrationResponse.email)}&pending=true`);
    } catch (error: any) {
      console.error("Registration error:", error);
      // Handle specific error messages from the API
      const errorMessage = error.message || "Registration failed. Please try again.";
      return json(
        { error: errorMessage },
        { status: 400 },
      );
    }
  }

  // Attempt login
  const result = await loginUser(email, password, redirectTo || "/dashboard", request);

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

  return <AuthPage actionData={actionData} />;
}


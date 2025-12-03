import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useSearchParams, Form, Link } from "@remix-run/react";
import { api } from "~/lib/api";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  const pending = url.searchParams.get("pending");

  return json({ token, email, pending: pending === "true" });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "verify") {
    const token = formData.get("token") as string;
    if (!token) {
      return json({ error: "Verification token is required" }, { status: 400 });
    }

    try {
      const { api } = await import("~/lib/api");
      const authResponse = await api.get<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>(`/auth/verify-email?token=${token}`);

      // Set tokens in session directly (no need to login again)
      const { setAuthTokensInSession, commitSession } = await import("~/lib/session");
      const session = await setAuthTokensInSession(
        authResponse.accessToken,
        authResponse.refreshToken,
        authResponse.user,
      );

      const cookieHeader = await commitSession(session);

      // Success - redirect with session cookie
      return redirect("/dashboard?verified=true", {
        headers: {
          "Set-Cookie": cookieHeader,
        },
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      return json(
        { error: error.message || "Invalid or expired verification token" },
        { status: 400 },
      );
    }
  }

  if (intent === "resend") {
    const email = formData.get("email") as string;
    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

    try {
      const { api } = await import("~/lib/api");
      await api.post("/auth/resend-verification", { email });
      return json({ success: true, message: "Verification email sent. Please check your inbox." });
    } catch (error: any) {
      console.error("Resend error:", error);
      return json(
        { error: error.message || "Failed to resend verification email" },
        { status: 400 },
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function VerifyEmailPage() {
  const { token, email, pending } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified") === "true";

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">Your email has been successfully verified. You can now access your account.</p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (token) {
    // Auto-verify if token is present
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <Form method="post">
            <input type="hidden" name="intent" value="verify" />
            <input type="hidden" name="token" value={token} />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email...</h2>
              <p className="text-gray-600 mb-6">Please wait while we verify your email address.</p>
              {actionData?.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <p className="font-medium">Verification Failed</p>
                  <p className="text-sm mt-1">{actionData.error}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Verify Email
              </button>
            </div>
          </Form>
        </div>
      </div>
    );
  }

  // Pending verification page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{email || "your email"}</strong>. Please click the link in the email to verify your account.
          </p>

          {actionData?.success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <p className="text-sm">{actionData.message}</p>
            </div>
          )}

          {actionData?.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <p className="text-sm">{actionData.error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Form method="post" className="space-y-3">
              <input type="hidden" name="intent" value="resend" />
              <input type="hidden" name="email" value={email || ""} />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Resend Verification Email
              </button>
            </Form>
            <Link
              to="/login"
              className="block w-full text-center px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { useState } from "react";
import { register } from "~/lib/auth";
import { setAuthTokenInSession } from "~/lib/auth.server";
import { getCurrentUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  if (user) {
    return redirect("/dashboard");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const organizationName = formData.get("organizationName") as string;
  const industry = formData.get("industry") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminFullName = formData.get("adminFullName") as string;
  const adminPassword = formData.get("adminPassword") as string;
  const planName = formData.get("planName") as string || "premium";

  if (!organizationName || !adminEmail || !adminPassword) {
    return json(
      { error: "Organization name, email, and password are required" },
      { status: 400 }
    );
  }

  try {
    const authResponse = await register(
      organizationName,
      industry || null,
      adminEmail,
      adminFullName || adminEmail.split("@")[0],
      adminPassword
    );
    
    const session = await setAuthTokenInSession(request, authResponse.accessToken);
    
    // Create subscription based on plan
    // This would typically be handled by the backend after signup
    
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": session,
      },
    });
  } catch (error: any) {
    return json(
      { error: error.message || "Failed to create account" },
      { status: 400 }
    );
  }
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "enterprise">("premium");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* Plan Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose your plan
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedPlan("premium")}
              className={`p-4 border-2 rounded-lg text-left ${
                selectedPlan === "premium"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-lg mb-1">Premium</div>
              <div className="text-sm text-gray-600 mb-2">1 free event</div>
              <div className="text-xs text-gray-500">Perfect for getting started</div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan("enterprise")}
              className={`p-4 border-2 rounded-lg text-left ${
                selectedPlan === "enterprise"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-lg mb-1">Enterprise</div>
              <div className="text-sm text-gray-600 mb-2">Unlimited events</div>
              <div className="text-xs text-gray-500">For growing businesses</div>
            </button>
          </div>
        </div>

        <Form method="post" className="bg-white shadow rounded-lg p-6">
          <input type="hidden" name="planName" value={selectedPlan} />
          
          {actionData?.error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{actionData.error}</div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <input
                type="text"
                name="organizationName"
                id="organizationName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                id="industry"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Technology, Healthcare"
              />
            </div>

            <div>
              <label htmlFor="adminFullName" className="block text-sm font-medium text-gray-700">
                Your Name *
              </label>
              <input
                type="text"
                name="adminFullName"
                id="adminFullName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                name="adminEmail"
                id="adminEmail"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                name="adminPassword"
                id="adminPassword"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}


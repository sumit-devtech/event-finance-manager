import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, Form } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const subscription = await api.get(`/organizations/${user.organizationId}/subscription`, {
      token: token || undefined,
    });
    const stats = await api.get(`/organizations/${user.organizationId}/stats`, {
      token: token || undefined,
    });
    return json({ subscription: subscription || null, stats: stats || null });
  } catch (error: any) {
    return json({ subscription: null, stats: null });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const planName = formData.get("planName") as string;
  const user = await requireAuth(request);

  try {
    await api.post(
      `/organizations/${user.organizationId}/subscription`,
      {
        planName,
        billingCycle: "monthly",
      },
      {
        token: token || undefined,
      }
    );
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message || "Failed to update subscription" }, { status: 400 });
  }
}

export default function Subscription() {
  const { subscription, stats } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const currentPlan = subscription?.planName || "premium";
  const eventCount = stats?.events?.total || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your subscription plan
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold capitalize">{currentPlan}</div>
            <div className="text-sm text-gray-500 mt-1">
              {currentPlan === "premium" 
                ? "1 free event (used: " + eventCount + ")"
                : "Unlimited events"}
            </div>
          </div>
          {subscription && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Status</div>
              <div className={`text-sm font-medium ${
                subscription.status === "active" ? "text-green-600" : "text-gray-600"
              }`}>
                {subscription.status}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Premium Plan */}
        <div className={`bg-white shadow rounded-lg p-6 border-2 ${
          currentPlan === "premium" ? "border-indigo-500" : "border-gray-200"
        }`}>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Premium</h3>
            <div className="text-3xl font-bold mb-4">$0</div>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>1 free event</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Basic features</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Budget planning</span>
              </li>
            </ul>
            {currentPlan === "premium" ? (
              <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md text-sm font-medium">
                Current Plan
              </div>
            ) : (
              <fetcher.Form method="post">
                <input type="hidden" name="planName" value="premium" />
                <button
                  type="submit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Switch to Premium
                </button>
              </fetcher.Form>
            )}
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className={`bg-white shadow rounded-lg p-6 border-2 ${
          currentPlan === "enterprise" ? "border-indigo-500" : "border-gray-200"
        }`}>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <div className="text-3xl font-bold mb-4">Custom</div>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Unlimited events</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>All premium features</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Advanced analytics</span>
              </li>
            </ul>
            {currentPlan === "enterprise" ? (
              <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md text-sm font-medium">
                Current Plan
              </div>
            ) : (
              <fetcher.Form method="post">
                <input type="hidden" name="planName" value="enterprise" />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Upgrade to Enterprise
                </button>
              </fetcher.Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


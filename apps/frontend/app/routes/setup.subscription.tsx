import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { SubscriptionPage } from "~/components/SubscriptionPage";
import { api, getAuthTokenFromRequest } from "~/lib/api";
import type { User } from "~/lib/auth";

interface LoaderData {
  user: User;
  subscription: any;
  limits: {
    maxEvents: number | null;
    features: string[];
  };
  currentEventCount: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = getAuthTokenFromRequest(request);

  try {
    // Fetch subscription details
    const subscriptionData = await api.get<{
      subscription: any;
      limits: { maxEvents: number | null; features: string[] };
      currentEventCount: number;
    }>("/subscriptions", { token: token || undefined });

    return json<LoaderData>({
      user,
      subscription: subscriptionData.subscription,
      limits: subscriptionData.limits,
      currentEventCount: subscriptionData.currentEventCount,
    });
  } catch (error: any) {
    // If no subscription, return defaults
    return json<LoaderData>({
      user,
      subscription: null,
      limits: { maxEvents: 1, features: [] },
      currentEventCount: 0,
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const token = getAuthTokenFromRequest(request);
  const formData = await request.formData();

  const plan = formData.get("plan") as string;
  const billingCycle = formData.get("billingCycle") as string;

  if (!plan || !billingCycle) {
    return json({ error: "Plan and billing cycle are required" }, { status: 400 });
  }

  try {
    // Create subscription (direct DB update for testing - no payment)
    await api.post(
      "/subscriptions",
      {
        planName: plan,
        billingCycle: billingCycle === "monthly" ? "Monthly" : "Yearly",
      },
      { token: token || undefined },
    );

    return redirect("/dashboard?subscription=success");
  } catch (error: any) {
    return json(
      { error: error.message || "Failed to create subscription" },
      { status: 400 },
    );
  }
}

export default function SubscriptionSetupRoute() {
  const { user, subscription, limits, currentEventCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <SubscriptionPage
      user={user}
      subscription={subscription}
      limits={limits}
      currentEventCount={currentEventCount}
      error={actionData?.error}
      isSubmitting={isSubmitting}
    />
  );
}


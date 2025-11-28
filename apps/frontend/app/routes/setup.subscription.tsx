import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { SubscriptionPage } from "~/components/SubscriptionPage";
import type { User } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  
  // TODO: Fetch organization if exists
  const organization = null;
  
  return json({ user, organization });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();

  const plan = formData.get("plan");
  const billingCycle = formData.get("billingCycle");

  // TODO: Update subscription via API
  // For now, redirect to dashboard
  return redirect("/dashboard");
}

export default function SubscriptionSetupRoute() {
  const { user, organization } = useLoaderData<typeof loader>() as { user: User; organization: any };
  return <SubscriptionPage user={user} organization={organization} />;
}


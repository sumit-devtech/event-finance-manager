import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { OrganizationSetup } from "~/components/OrganizationSetup";
import type { User } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();

  const organizationData = {
    name: formData.get("name"),
    industry: formData.get("industry"),
    size: formData.get("size"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
    website: formData.get("website"),
    description: formData.get("description"),
  };

  // TODO: Create organization via API
  // For now, redirect to subscription page
  return redirect("/setup/subscription");
}

export default function OrganizationSetupRoute() {
  const { user } = useLoaderData<typeof loader>() as { user: User };
  return <OrganizationSetup user={user} />;
}


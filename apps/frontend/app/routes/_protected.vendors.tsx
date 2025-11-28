import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { VendorManager } from "~/components/VendorManager";

interface LoaderData {
  user: User;
  vendors: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const vendors = await api.get<any[]>("/vendors", {
      token: token || undefined,
    });
    return json<LoaderData>({ user, vendors: vendors || [] });
  } catch (error: any) {
    console.error("Error fetching vendors:", error);
    return json<LoaderData>({ user, vendors: [] });
  }
}

export default function VendorsRoute() {
  const { user, vendors } = useLoaderData<typeof loader>();

  return <VendorManager user={user} vendors={vendors} />;
}


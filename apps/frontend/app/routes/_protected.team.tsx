import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireRole } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import type { User } from "~/lib/auth";
import { TeamManagement } from "~/components/TeamManagement";

interface LoaderData {
  user: User;
  organization?: any;
  members: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireRole(request, ["Admin"]);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch users (team members) - only admins can access this
    let members: any[] = [];
    try {
      members = await api.get<any[]>("/users", {
        token: token || undefined,
      });
    } catch {
      // Non-admin users may not have access
      members = [];
    }

    // Fetch organization if available
    let organization = null;
    if ((user as any).organizationId) {
      try {
        organization = await api.get<any>(`/organizations/${(user as any).organizationId}`, {
          token: token || undefined,
        });
      } catch {
        // Organization may not be accessible
      }
    }

    return json<LoaderData>({ user, organization, members: members || [] });
  } catch (error: any) {
    console.error("Error fetching team data:", error);
    return json<LoaderData>({ user, members: [] });
  }
}

export default function TeamRoute() {
  const { user, organization, members } = useLoaderData<typeof loader>();

  return <TeamManagement user={user} organization={organization} members={members} />;
}


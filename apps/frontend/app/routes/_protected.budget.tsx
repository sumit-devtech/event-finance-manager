import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { BudgetManager } from "~/components/BudgetManager";

interface LoaderData {
  user: User;
  events: any[];
  budgetItems: any[];
  budgetVersions: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const events = await api.get<any[]>("/events", {
      token: token || undefined,
    });

    // Fetch budget items for all events
    const budgetItems: any[] = [];
    for (const event of events || []) {
      try {
        const items = await api.get<any[]>(`/events/${event.id}/budget-items`, {
          token: token || undefined,
        });
        if (items) budgetItems.push(...items);
      } catch {
        // Budget items may not exist for all events
      }
    }

    // Fetch budget versions for all events
    const budgetVersions: any[] = [];
    for (const event of events || []) {
      try {
        const versions = await api.get<any[]>(`/events/${event.id}/budget-versions`, {
          token: token || undefined,
        });
        if (versions) budgetVersions.push(...versions);
      } catch {
        // Budget versions may not exist for all events
      }
    }

    return json<LoaderData>({ 
      user, 
      events: events || [], 
      budgetItems: budgetItems || [],
      budgetVersions: budgetVersions || []
    });
  } catch (error: any) {
    console.error("Error fetching budget data:", error);
    return json<LoaderData>({ 
      user, 
      events: [], 
      budgetItems: [],
      budgetVersions: []
    });
  }
}

export default function BudgetRoute() {
  const { user, events, budgetItems, budgetVersions } = useLoaderData<typeof loader>();

  return <BudgetManager user={user} events={events} budgetItems={budgetItems} budgetVersions={budgetVersions} />;
}

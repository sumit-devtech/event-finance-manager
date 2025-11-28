import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { Dashboard } from "~/components/Dashboard";

interface LoaderData {
  events: any[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    planningEvents: number;
    cancelledEvents: number;
    totalBudgetItems: number;
    upcomingEvents: any[];
    recentEvents: any[];
  };
}

/**
 * Demo Dashboard Loader - no authentication required (uses demo layout)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Return demo data
  return json<LoaderData>({
    events: [],
    stats: {
      totalEvents: 12,
      activeEvents: 8,
      completedEvents: 3,
      planningEvents: 1,
      cancelledEvents: 0,
      totalBudgetItems: 45,
      upcomingEvents: [],
      recentEvents: [],
    },
  });
}

export default function DemoDashboardRoute() {
  const { events, stats } = useLoaderData<typeof loader>();
  // Get user from parent demo layout route
  const matches = useMatches();
  const demoLayoutMatch = matches.find(m => m.id === 'routes/demo');
  const user = (demoLayoutMatch?.data as any)?.user;

  if (!user) {
    return <div>Loading...</div>;
  }

  return <Dashboard user={user} events={events} stats={stats} />;
}


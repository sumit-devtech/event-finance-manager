import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { Dashboard } from "~/components/Dashboard";

interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: {
    files: number;
    budgetItems: number;
    activityLogs: number;
  };
}

interface LoaderData {
  user: User;
  events: Event[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    planningEvents: number;
    cancelledEvents: number;
    totalBudgetItems: number;
    upcomingEvents: Event[];
    recentEvents: Event[];
  };
}

/**
 * Loader - fetch dashboard data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data instead of fetching from API
  if (isDemo) {
    return json<LoaderData>({
      user,
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

  try {
    // Fetch all events for statistics
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
    });

    const now = new Date();
    const upcomingEvents = events
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5);

    const recentEvents = events
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);

    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter((e) => e.status === "Active").length,
      completedEvents: events.filter((e) => e.status === "Completed").length,
      planningEvents: events.filter((e) => e.status === "Planning").length,
      cancelledEvents: events.filter((e) => e.status === "Cancelled").length,
      totalBudgetItems: events.reduce((sum, e) => sum + e._count.budgetItems, 0),
      upcomingEvents,
      recentEvents,
    };

    return json<LoaderData>({ user, events: events || [], stats });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return json<LoaderData>({
      user,
      events: [],
      stats: {
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        planningEvents: 0,
        cancelledEvents: 0,
        totalBudgetItems: 0,
        upcomingEvents: [],
        recentEvents: [],
      },
    });
  }
}

export default function DashboardRoute() {
  const { user, events, stats } = useLoaderData<typeof loader>();

  return <Dashboard user={user} events={events} stats={stats} />;
}

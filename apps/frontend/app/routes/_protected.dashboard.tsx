import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import type { User } from "~/lib/auth";
import { Dashboard } from "~/components/Dashboard";
import { demoDashboardEvents, demoDashboardBudgetData, demoDashboardExpenseCategories, demoDashboardAlerts } from "~/lib/demoData";

interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  budget?: number;
  spent?: number;
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
  budgetData: Array<{ month: string; budget: number; spent: number }>;
  expenseCategories: Array<{ name: string; value: number; color: string }>;
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    count?: number;
    urgent: boolean;
  }>;
}

/**
 * Loader - fetch dashboard data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user (components handle null user)
  if (isDemo) {
    const now = new Date();
    const upcomingEvents = demoDashboardEvents
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5);

    const recentEvents = demoDashboardEvents
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);

    return json<LoaderData>({
      user: null as any, // null user in demo mode
      events: demoDashboardEvents,
      stats: {
        totalEvents: 12,
        activeEvents: 6,
        completedEvents: 3,
        planningEvents: 3,
        cancelledEvents: 0,
        totalBudgetItems: 120,
        upcomingEvents,
        recentEvents,
      },
      budgetData: demoDashboardBudgetData,
      expenseCategories: demoDashboardExpenseCategories,
      alerts: demoDashboardAlerts,
    });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Use new dashboard stats endpoint - single API call instead of N+1 queries
    const dashboardData = await api.get<{
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
      budgetData: Array<{ month: string; budget: number; spent: number }>;
      expenseCategories: Array<{ name: string; value: number; color: string }>;
      alerts: Array<{ id: string; type: string; message: string; count?: number; urgent: boolean }>;
    }>("/dashboard/stats", {
      token: token || undefined,
    });

    return json<LoaderData>({ 
      user, 
      events: dashboardData.events || [],
      stats: dashboardData.stats,
      budgetData: dashboardData.budgetData || [],
      expenseCategories: dashboardData.expenseCategories || [],
      alerts: dashboardData.alerts || [],
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching dashboard data:", errorMessage);
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
      budgetData: [],
      expenseCategories: [],
      alerts: [],
    });
  }
}

export default function DashboardRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  // Transform events to DashboardEvent format with progress calculation
  const dashboardEvents = (loaderData.events as unknown as Event[]).map((event) => ({
    id: event.id,
    name: event.name,
    status: event.status,
    budget: event.budget || 0,
    spent: event.spent || 0,
    progress: event.budget && event.budget > 0 
      ? Math.min(100, Math.round((event.spent || 0) / event.budget * 100))
      : 0,
  }));

  // Transform stats to include DashboardEvent[] for upcomingEvents and recentEvents
  const dashboardStats = {
    ...loaderData.stats,
    upcomingEvents: (loaderData.stats.upcomingEvents as unknown as Event[]).map((event) => ({
      id: event.id,
      name: event.name,
      status: event.status,
      budget: event.budget || 0,
      spent: event.spent || 0,
      progress: event.budget && event.budget > 0 
        ? Math.min(100, Math.round((event.spent || 0) / event.budget * 100))
        : 0,
    })),
    recentEvents: (loaderData.stats.recentEvents as unknown as Event[]).map((event) => ({
      id: event.id,
      name: event.name,
      status: event.status,
      budget: event.budget || 0,
      spent: event.spent || 0,
      progress: event.budget && event.budget > 0 
        ? Math.min(100, Math.round((event.spent || 0) / event.budget * 100))
        : 0,
    })),
  };

  return <Dashboard 
    user={loaderData.user} 
    events={dashboardEvents} 
    stats={dashboardStats} 
    budgetData={loaderData.budgetData}
    expenseCategories={loaderData.expenseCategories}
    alerts={loaderData.alerts}
    isDemo={isDemo} 
  />;
}

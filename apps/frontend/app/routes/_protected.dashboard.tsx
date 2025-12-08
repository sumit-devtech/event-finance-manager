/**
 * Dashboard Route
 * Optimized loader with parallel fetching for fast data loading
 * All transformations happen server-side for security
 * All data is resolved before rendering to avoid Suspense boundary issues
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { getAuthTokenFromSession } from "~/lib/session.server";
import type { User } from "~/lib/auth";
import { Dashboard } from "~/components/dashboard";
import {
  fetchEventsData,
  calculateStats,
  fetchBudgetData,
  fetchAlerts,
} from "~/lib/dashboard.server";
import {
  transformEventsToDashboardFormat,
  transformStatsData,
} from "~/components/dashboard/index";
import {
  demoDashboardEvents,
  demoDashboardBudgetData,
  demoDashboardExpenseCategories,
  demoDashboardAlerts,
} from "~/lib/demoData";
import type { ApiEvent } from "~/components/dashboard/types";
import { INITIAL_DATA_LIMITS, CATEGORY_COLORS } from "~/components/dashboard/constants";

interface LoaderData {
  user: User | null;
  events: ReturnType<typeof transformEventsToDashboardFormat>;
  stats: ReturnType<typeof transformStatsData>;
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
 * Loader - fetch dashboard data with parallel fetching for optimal performance
 * All data is fetched in parallel and resolved before rendering
 * This avoids Suspense boundary issues while maintaining fast data fetching
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get("demo") === "true";

  // In demo mode, return demo data with null user
  if (isDemo) {
    const now = new Date();
    const upcomingEvents = demoDashboardEvents
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, INITIAL_DATA_LIMITS.EVENTS);

    const recentEvents = demoDashboardEvents
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, INITIAL_DATA_LIMITS.RECENT_EVENTS);

    const demoStats = {
      totalEvents: 12,
      activeEvents: 6,
      completedEvents: 3,
      planningEvents: 3,
      cancelledEvents: 0,
      totalBudgetItems: 120,
      upcomingEvents,
      recentEvents,
    };

    // Transform demo events
    const transformedDemoEvents = transformEventsToDashboardFormat(
      demoDashboardEvents as unknown as ApiEvent[]
    );
    const transformedDemoStats = transformStatsData(
      demoStats,
      demoDashboardEvents as unknown as ApiEvent[]
    );

    return json<LoaderData>({
      user: null as any,
      events: transformedDemoEvents,
      stats: transformedDemoStats,
      budgetData: demoDashboardBudgetData,
      expenseCategories: demoDashboardExpenseCategories,
      alerts: demoDashboardAlerts,
    });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // OPTIMIZATION: Try to fetch pre-computed dashboard metrics first (fast path)
    const { api } = await import("~/lib/api");
    let dashboardMetrics: any = null;

    try {
      dashboardMetrics = await api.get("/metrics/dashboard", {
        token: token || undefined,
      });
    } catch (error) {
      console.warn("Failed to fetch dashboard metrics, falling back to calculation:", error);
    }

    // FAST PATH: Use cached metrics if available
    if (dashboardMetrics && dashboardMetrics.statsJson && dashboardMetrics.chartsJson) {
      const statsJson = dashboardMetrics.statsJson as any;
      const chartsJson = dashboardMetrics.chartsJson as any;
      const recentEvents = (dashboardMetrics.recentEvents || []) as any[];

      // OPTIMIZATION: Fetch events in parallel with alerts (events needed for list display)
      const [events] = await Promise.all([
        fetchEventsData(token || undefined),
      ]);

      const transformedEvents = transformEventsToDashboardFormat(events);

      // Filter recentEvents to only include events the user has permission to see
      // Dashboard metrics include all org events, but we need to respect user permissions
      const accessibleEventIds = new Set(events.map(e => e.id));
      const filteredRecentEvents = recentEvents.filter((event: any) =>
        accessibleEventIds.has(event.id)
      );

      // Transform stats from cached metrics (no calculation needed!)
      const transformedStats = transformStatsData(
        {
          totalEvents: statsJson.totalEvents || 0,
          activeEvents: statsJson.activeEvents || 0,
          completedEvents: statsJson.completedEvents || 0,
          planningEvents: statsJson.planningEvents || 0,
          cancelledEvents: statsJson.cancelledEvents || 0,
          totalBudgetItems: 0, // Not in metrics, will be calculated if needed
          upcomingEvents: events.filter((e) => e.startDate && new Date(e.startDate) > new Date()).slice(0, INITIAL_DATA_LIMITS.EVENTS),
          recentEvents: filteredRecentEvents.slice(0, INITIAL_DATA_LIMITS.RECENT_EVENTS),
        },
        events,
      );

      // Use cached budget data and expense categories (no calculation needed!)
      const budgetData = chartsJson.budgetData || [];
      const expenseCategories = (chartsJson.expenseCategories || []).map((cat: any) => ({
        name: cat.name,
        value: cat.value,
        color: CATEGORY_COLORS[cat.name as keyof typeof CATEGORY_COLORS] || "#888888",
      }));

      // OPTIMIZATION: Use cached pendingApprovals from metrics instead of expensive fetch
      const alerts: Array<{
        id: string;
        type: string;
        message: string;
        count?: number;
        urgent: boolean;
        details?: string;
      }> = [];

      // Add pending approvals alert from cached metrics
      if (dashboardMetrics.pendingApprovals > 0) {
        alerts.push({
          id: "pending-expenses",
          type: "approval",
          message: `${dashboardMetrics.pendingApprovals} expense approval${dashboardMetrics.pendingApprovals > 1 ? "s" : ""} pending`,
          count: dashboardMetrics.pendingApprovals,
          urgent: dashboardMetrics.pendingApprovals >= 3,
        });
      }

      // Add over-budget events alert from cached metrics
      if (dashboardMetrics.overBudgetEvents > 0) {
        alerts.push({
          id: "over-budget-events",
          type: "overspending",
          message: `${dashboardMetrics.overBudgetEvents} event${dashboardMetrics.overBudgetEvents > 1 ? "s" : ""} over budget`,
          count: dashboardMetrics.overBudgetEvents,
          urgent: dashboardMetrics.overBudgetEvents >= 3,
        });
      }

      // Fetch notifications for alerts (lightweight query)
      try {
        const notifications = await api.get<Array<{ type: string; title: string; message: string | null }>>("/notifications?read=false", {
          token: token || undefined,
        });

        if (Array.isArray(notifications) && notifications.length > 0) {
          const errorNotifications = notifications.filter((n) => n.type === "Error");
          const warningNotifications = notifications.filter((n) => n.type === "Warning");

          if (errorNotifications.length > 0) {
            const firstNotification = errorNotifications[0];
            alerts.push({
              id: "notifications-error",
              type: "notification",
              message: `${errorNotifications.length} urgent notification${errorNotifications.length > 1 ? "s" : ""}`,
              count: errorNotifications.length,
              urgent: true,
              details: firstNotification.title || firstNotification.message || undefined,
            });
          }

          if (warningNotifications.length > 0 && errorNotifications.length === 0) {
            const firstNotification = warningNotifications[0];
            alerts.push({
              id: "notifications-warning",
              type: "notification",
              message: `${warningNotifications.length} notification${warningNotifications.length > 1 ? "s" : ""} require attention`,
              count: warningNotifications.length,
              urgent: false,
              details: firstNotification.title || firstNotification.message || undefined,
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch notifications:", err);
      }

      return json<LoaderData>({
        user,
        events: transformedEvents,
        stats: transformedStats,
        budgetData,
        expenseCategories,
        alerts: alerts.slice(0, INITIAL_DATA_LIMITS.ALERTS),
      });
    }

    // FALLBACK PATH: Calculate on-the-fly if metrics not available
    // This happens on first access or if metrics recompute failed
    // CRITICAL PATH: Fetch events immediately (required for stats)
    const events = await fetchEventsData(token || undefined);

    // CRITICAL PATH: Calculate stats immediately (required for display)
    const stats = calculateStats(events);

    // Transform events and stats (server-side)
    const transformedEvents = transformEventsToDashboardFormat(events);
    const transformedStats = transformStatsData(stats, events);

    // PARALLEL FETCH: Budget data and alerts (non-critical, fetched in parallel)
    // Fetch budget data once and extract both budgetData and expenseCategories
    const budgetDataPromise = fetchBudgetData(events, token || undefined);
    const alertsPromise = fetchAlerts(events, token || undefined);

    // Wait for all promises to resolve in parallel
    const [budgetDataResult, alerts] = await Promise.all([
      budgetDataPromise,
      alertsPromise,
    ]);

    return json<LoaderData>({
      user,
      events: transformedEvents,
      stats: transformedStats,
      budgetData: budgetDataResult.budgetData,
      expenseCategories: budgetDataResult.expenseCategories,
      alerts,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching dashboard data:", errorMessage);

    // Return empty data on error
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

/**
 * Dashboard Route Component
 * All data is pre-loaded and resolved in the loader
 */
export default function DashboardRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  return (
    <Dashboard
      user={loaderData.user}
      events={loaderData.events}
      stats={loaderData.stats}
      budgetData={loaderData.budgetData}
      expenseCategories={loaderData.expenseCategories}
      alerts={loaderData.alerts}
      isDemo={isDemo}
    />
  );
}

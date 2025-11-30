import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { Analytics } from "~/components/Analytics";

interface LoaderData {
  user: User | null;
  events: any[];
  roiMetrics: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    const demoEvents = [
      {
        id: '1',
        name: 'Tech Conference 2024',
        status: 'active',
        createdAt: '2024-01-15',
        _count: { budgetItems: 12 },
      },
      {
        id: '2',
        name: 'Product Launch Event',
        status: 'planning',
        createdAt: '2024-02-01',
        _count: { budgetItems: 8 },
      },
      {
        id: '3',
        name: 'Annual Gala',
        status: 'active',
        createdAt: '2024-01-10',
        _count: { budgetItems: 15 },
      },
      {
        id: '4',
        name: 'Workshop Series',
        status: 'completed',
        createdAt: '2023-12-01',
        _count: { budgetItems: 6 },
      },
    ];

    const demoROIMetrics = [
      { event: 'Tech Conf', roi: 245, revenue: 520000, cost: 125000 },
      { event: 'Product Launch', roi: 180, revenue: 238000, cost: 85000 },
      { event: 'Annual Gala', roi: 210, revenue: 290000, cost: 95000 },
      { event: 'Workshop', roi: 195, revenue: 88000, cost: 45000 },
      { event: 'Trade Show', roi: 225, revenue: 337500, cost: 150000 },
    ];

    return json<LoaderData>({ user: null as any, events: demoEvents, roiMetrics: demoROIMetrics });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const events = await api.get<any[]>("/events", {
      token: token || undefined,
    });
    
    // Fetch ROI metrics for events that have them
    const roiMetrics: any[] = [];
    for (const event of events || []) {
      try {
        const roi = await api.get<any>(`/events/${event.id}/roi-metrics`, {
          token: token || undefined,
        });
        if (roi) roiMetrics.push(roi);
      } catch {
        // ROI metrics may not exist for all events
      }
    }

    return json<LoaderData>({ user, events: events || [], roiMetrics });
  } catch (error: any) {
    console.error("Error fetching analytics data:", error);
    return json<LoaderData>({ user, events: [], roiMetrics: [] });
  }
}

export default function AnalyticsRoute() {
  const { user, events, roiMetrics } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return <Analytics user={user} events={events} roiMetrics={roiMetrics} isDemo={isDemo} />;
}


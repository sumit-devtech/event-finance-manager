import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import type { User } from "~/lib/auth";
import { Analytics } from "~/components/Analytics";
import { demoAnalyticsEvents, demoROIMetrics } from "~/lib/demoData";
import type { EventWithDetails } from "~/types";

interface ROIMetric {
  event: string;
  roi: number;
  revenue: number;
  cost: number;
}

interface LoaderData {
  user: User | null;
  events: EventWithDetails[];
  roiMetrics: ROIMetric[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    return json<LoaderData>({ user: null as any, events: demoAnalyticsEvents as unknown as EventWithDetails[], roiMetrics: demoROIMetrics });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const events = await api.get<EventWithDetails[]>("/events", {
      token: token || undefined,
    });
    
    // Fetch ROI metrics for events that have them
    const roiMetrics: ROIMetric[] = [];
    for (const event of events || []) {
      try {
        const roi = await api.get<ROIMetric>(`/events/${event.id}/roi-metrics`, {
          token: token || undefined,
        });
        if (roi) roiMetrics.push(roi);
      } catch (error: unknown) {
        // ROI metrics may not exist for all events
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.warn(`Could not fetch ROI metrics for event ${event.id}:`, errorMessage);
      }
    }

    return json<LoaderData>({ user, events: events || [], roiMetrics });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching analytics data:", errorMessage);
    return json<LoaderData>({ user, events: [], roiMetrics: [] });
  }
}

export default function AnalyticsRoute() {
  const { user, events, roiMetrics } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return <Analytics user={user} events={events as unknown as EventWithDetails[]} roiMetrics={roiMetrics} isDemo={isDemo} />;
}


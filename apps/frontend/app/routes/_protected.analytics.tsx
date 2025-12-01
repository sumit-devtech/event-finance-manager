import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { Analytics } from "~/components/Analytics";
import { demoAnalyticsEvents, demoROIMetrics } from "~/lib/demoData";

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
    return json<LoaderData>({ user: null as any, events: demoAnalyticsEvents, roiMetrics: demoROIMetrics });
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


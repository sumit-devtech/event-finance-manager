import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch all insights across all events
    const events = await api.get("/events", {
      token: token || undefined,
    });
    
    // Fetch insights for each event
    const insightsPromises = (events || []).map(async (event: any) => {
      try {
        const insights = await api.get(`/events/${event.id}/insights`, {
          token: token || undefined,
        });
        return { eventId: event.id, eventName: event.name, insights: insights || [] };
      } catch {
        return { eventId: event.id, eventName: event.name, insights: [] };
      }
    });
    
    const insightsByEvent = await Promise.all(insightsPromises);
    
    return json({ insightsByEvent });
  } catch (error: any) {
    return json({ insightsByEvent: [] });
  }
}

export default function Insights() {
  const { insightsByEvent } = useLoaderData<typeof loader>();

  const allInsights = insightsByEvent.flatMap((item: any) =>
    item.insights.map((insight: any) => ({
      ...insight,
      eventId: item.eventId,
      eventName: item.eventName,
    }))
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
        <p className="mt-2 text-sm text-gray-600">
          AI-powered insights across all your events
        </p>
      </div>

      {allInsights.length > 0 ? (
        <div className="space-y-6">
          {insightsByEvent.map((item: any) => (
            item.insights.length > 0 && (
              <div key={item.eventId} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{item.eventName}</h2>
                  <Link
                    to={`/events/${item.eventId}/insights`}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {item.insights.slice(0, 3).map((insight: any) => (
                    <div key={insight.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No insights available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate insights from your events to see AI-powered recommendations.
          </p>
        </div>
      )}
    </div>
  );
}


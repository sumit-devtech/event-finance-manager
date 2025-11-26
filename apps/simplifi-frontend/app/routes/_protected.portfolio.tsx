import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const events = await api.get("/events", {
      token: token || undefined,
    });
    
    // Calculate portfolio metrics
    const totalEvents = events.length || 0;
    const activeEvents = events.filter((e: any) => e.status === "active").length;
    const completedEvents = events.filter((e: any) => e.status === "completed").length;
    
    return json({
      events: events || [],
      metrics: {
        totalEvents,
        activeEvents,
        completedEvents,
      },
    });
  } catch (error: any) {
    return json({ events: [], metrics: { totalEvents: 0, activeEvents: 0, completedEvents: 0 } });
  }
}

export default function Portfolio() {
  const { events, metrics } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of all your events and their performance
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500">Total Events</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{metrics.totalEvents}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500">Active Events</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{metrics.activeEvents}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm font-medium text-gray-500">Completed Events</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{metrics.completedEvents}</div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">All Events</h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event: any) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{event.name}</h3>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    event.status === "active" ? "bg-green-100 text-green-800" :
                    event.status === "completed" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {event.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {event.startDate ? new Date(event.startDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found.</p>
            <Link
              to="/events/new"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-900"
            >
              Create your first event →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


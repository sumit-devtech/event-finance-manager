import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";
import { useState } from "react";

interface Event {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface LoaderData {
  events: Event[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
    });
    return json<LoaderData>({ events: events || [] });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return json<LoaderData>({ events: [] });
  }
}

export default function Events() {
  const { events } = useLoaderData<typeof loader>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const fetcher = useFetcher();

  const filteredEvents = events.filter((event) => {
    if (statusFilter === "all") return true;
    return event.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your events and track their progress
          </p>
        </div>
        <Link
          to="/events/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            statusFilter === "all"
              ? "bg-indigo-100 text-indigo-800"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("planning")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            statusFilter === "planning"
              ? "bg-indigo-100 text-indigo-800"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Planning
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            statusFilter === "active"
              ? "bg-indigo-100 text-indigo-800"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            statusFilter === "completed"
              ? "bg-indigo-100 text-indigo-800"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <li key={event.id}>
                <Link
                  to={`/events/${event.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {event.name}
                          </h3>
                          <span
                            className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}
                          >
                            {event.status}
                          </span>
                        </div>
                        {event.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg
                            className="mr-1.5 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {formatDate(event.startDate)} - {formatDate(event.endDate)}
                          </span>
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new event.
          </p>
          <div className="mt-6">
            <Link
              to="/events/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Event
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


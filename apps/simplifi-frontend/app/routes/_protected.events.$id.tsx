import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams, useFetcher, Form } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

interface Event {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const event = await api.get<Event>(`/events/${params.id}`, {
      token: token || undefined,
    });
    return json({ event });
  } catch (error: any) {
    throw new Response("Event not found", { status: 404 });
  }
}

export default function EventDetail() {
  const { event } = useLoaderData<typeof loader>();
  const params = useParams();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to="/events"
          className="text-sm text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
        >
          ← Back to Events
        </Link>
        <div className="flex justify-between items-center mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <p className="mt-2 text-sm text-gray-600">{event.description || "No description"}</p>
          </div>
          <div className="flex gap-2">
            <Form method="post" action="/actions/events/clone">
              <input type="hidden" name="eventId" value={params.id} />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Clone Event
              </button>
            </Form>
            <Link
              to={`/events/${params.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Edit Event
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            to={`/events/${params.id}`}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Overview
          </Link>
          <Link
            to={`/events/${params.id}/budget`}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Budget Planning
          </Link>
          <Link
            to={`/events/${params.id}/expenses`}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Expenses
          </Link>
          <Link
            to={`/events/${params.id}/roi`}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            ROI Analytics
          </Link>
          <Link
            to={`/events/${params.id}/insights`}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Insights
          </Link>
          <Link
            to={`/events/${params.id}/crm-sync`}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            CRM Sync
          </Link>
          <Link
            to={`/events/${params.id}/stakeholders`}
            className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Stakeholders
          </Link>
        </nav>
      </div>

      {/* Event Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.status === "active" ? "bg-green-100 text-green-800" :
                event.status === "completed" ? "bg-blue-100 text-blue-800" :
                event.status === "planning" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {event.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {event.startDate ? new Date(event.startDate).toLocaleDateString() : "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">End Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {event.endDate ? new Date(event.endDate).toLocaleDateString() : "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(event.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}


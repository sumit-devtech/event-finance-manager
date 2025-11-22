import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { requireRole } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";

interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

/**
 * Loader - fetch event data
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireRole(request, ["Admin", "EventManager"]);
  const token = await getAuthTokenFromSession(request);
  const eventId = params.id!;

  try {
    const event = await api.get<Event>(`/events/${eventId}`, { token: token || undefined });
    return json({ event });
  } catch (error: any) {
    throw new Response("Event not found", { status: 404 });
  }
}

/**
 * Action - update event
 */
export async function action({ request, params }: ActionFunctionArgs) {
  await requireRole(request, ["Admin", "EventManager"]);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const eventId = params.id!;

  // Only send fields that have values (not empty strings)
  const eventData: any = {};
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const client = formData.get("client")?.toString().trim();
  const startDate = formData.get("startDate")?.toString().trim();
  const endDate = formData.get("endDate")?.toString().trim();
  const status = formData.get("status")?.toString().trim();

  if (name) eventData.name = name;
  if (description) eventData.description = description;
  if (client) eventData.client = client;
  if (startDate) eventData.startDate = startDate;
  if (endDate) eventData.endDate = endDate;
  if (status) eventData.status = status;

  try {
    await api.put(`/events/${eventId}`, eventData, { token: token || undefined });
    return redirect(`/events/${eventId}`);
  } catch (error: any) {
    return json({ error: error.message || "Failed to update event" }, { status: 400 });
  }
}

export default function EditEventPage() {
  const { event } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Format dates for input fields
  const startDate = event.startDate ? new Date(event.startDate).toISOString().split("T")[0] : "";
  const endDate = event.endDate ? new Date(event.endDate).toISOString().split("T")[0] : "";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {actionData?.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={event.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={event.description || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <input
              type="text"
              id="client"
              name="client"
              defaultValue={event.client || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                defaultValue={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                defaultValue={endDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={event.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <a
              href={`/events/${event.id}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isSubmitting ? "Updating..." : "Update Event"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}


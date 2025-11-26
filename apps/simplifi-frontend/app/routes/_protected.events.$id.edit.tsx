import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
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

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const status = formData.get("status") as string;

  if (!name) {
    return json({ error: "Event name is required" }, { status: 400 });
  }

  try {
    await api.put(`/events/${params.id}`, {
      name,
      description: description || null,
      startDate: startDate || null,
      endDate: endDate || null,
      status,
    }, {
      token: token || undefined,
    });

    return redirect(`/events/${params.id}`);
  } catch (error: any) {
    return json({ error: error.message || "Failed to update event" }, { status: 400 });
  }
}

export default function EditEvent() {
  const { event } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update event details
        </p>
      </div>

      <Form method="post" className="bg-white shadow rounded-lg p-6">
        {actionData?.error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{actionData.error}</div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={event.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              defaultValue={event.description || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                defaultValue={event.startDate ? event.startDate.split("T")[0] : ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                defaultValue={event.endDate ? event.endDate.split("T")[0] : ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              id="status"
              defaultValue={event.status}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <a
              href={`/events/${event.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}


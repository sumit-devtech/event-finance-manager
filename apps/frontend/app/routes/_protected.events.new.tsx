import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link, useLoaderData, useRouteError } from "@remix-run/react";
import { requireRole } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { Dropdown } from "~/components/shared";
import { useState } from "react";

/**
 * Loader - ensure user has permission to create events and fetch EventManager users
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireRole(request, ["Admin", "EventManager"]);
  const token = await getAuthTokenFromSession(request);
  
  // Fetch users to populate manager dropdown (only if Admin, otherwise skip)
  let managers: any[] = [];
  try {
    if (user.role === "Admin") {
      const allUsers = await api.get<any[]>("/users", { token: token || undefined });
      // Filter to only EventManager role
      managers = allUsers.filter((u: any) => u.role === "EventManager");
    }
  } catch (error) {
    // If user is not Admin, they can't fetch users - that's okay, we'll skip the dropdown
    console.log("Could not fetch users for manager assignment:", error);
  }
  
  return json({ user, managers, success: true });
}

/**
 * Action - create new event
 */
export async function action({ request }: ActionFunctionArgs) {
  await requireRole(request, ["Admin", "EventManager"]);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();

  const name = formData.get("name") as string;
  if (!name) {
    return json({ error: "Event name is required" }, { status: 400 });
  }

  const eventData: any = {
    name,
  };

  const description = formData.get("description") as string;
  if (description && description.trim()) {
    eventData.description = description.trim();
  }

  const client = formData.get("client") as string;
  if (client && client.trim()) {
    eventData.client = client.trim();
  }

  const startDate = formData.get("startDate") as string;
  if (startDate) {
    eventData.startDate = startDate;
  }

  const endDate = formData.get("endDate") as string;
  if (endDate) {
    eventData.endDate = endDate;
  }

  const budget = formData.get("budget") as string;
  if (budget && budget.trim()) {
    const budgetNum = parseFloat(budget);
    if (!isNaN(budgetNum) && budgetNum >= 0) {
      eventData.budget = budgetNum;
    }
  }

  const managerId = formData.get("managerId") as string;
  if (managerId && managerId.trim()) {
    eventData.managerId = managerId.trim();
  }

  const status = formData.get("status") as string;
  if (status) {
    eventData.status = status;
  }

  try {
    const newEvent = await api.post("/events", eventData, { token: token || undefined }) as { id: string };
    return redirect(`/events/${newEvent.id}`);
  } catch (error: any) {
    console.error("Error creating event:", error);
    return json({ error: error.message || "Failed to create event" }, { status: 400 });
  }
}

export default function NewEventPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const managers = loaderData.managers || [];
  const [status, setStatus] = useState("Planning");
  const [managerId, setManagerId] = useState("");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <input type="hidden" name="status" value={status} />
              <Dropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'Planning', label: 'Planning' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' },
                ]}
                placeholder="Select status"
              />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {managers.length > 0 && (
            <div>
              <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 mb-1">
                Assign Manager (Optional)
              </label>
              <input type="hidden" name="managerId" value={managerId} />
              <Dropdown
                value={managerId}
                onChange={setManagerId}
                options={[
                  { value: '', label: '-- No manager assigned --' },
                  ...managers.map((manager) => ({
                    value: manager.id,
                    label: `${manager.fullName || manager.name || manager.email} (${manager.email})`,
                  })),
                ]}
                placeholder="-- No manager assigned --"
              />
              <p className="mt-1 text-xs text-gray-500">
                Select an Event Manager to assign to this event
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Link
              to="/events"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Error</h1>
        <p className="mt-2 text-gray-600 text-center">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
        <div className="mt-6 text-center">
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}


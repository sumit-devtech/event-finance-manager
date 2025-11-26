import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  // Fetch events and vendors for dropdowns
  let events: any[] = [];
  let vendors: any[] = [];
  
  try {
    events = await api.get("/events", {
      token: token || undefined,
    });
    vendors = await api.get("/vendors", {
      token: token || undefined,
    });
  } catch {
    // Ignore errors
  }

  return json({ events: events || [], vendors: vendors || [] });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();

  const eventId = formData.get("eventId") as string;
  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const vendorId = formData.get("vendorId") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;

  if (!eventId || !title || !amount) {
    return json({ error: "Event, title, and amount are required" }, { status: 400 });
  }

  try {
    const expense = await api.post<{ id: string }>(
      "/expenses",
      {
        eventId,
        title,
        amount,
        vendorId: vendorId || null,
        category: category || null,
        description: description || null,
        date: date || null,
      },
      {
        token: token || undefined,
      }
    );

    return redirect(`/expenses/${expense.id}`);
  } catch (error: any) {
    return json({ error: error.message || "Failed to create expense" }, { status: 400 });
  }
}

export default function NewExpense() {
  const { events, vendors } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/expenses"
          className="text-sm text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
        >
          ← Back to Expenses
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track expenses for your events
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
            <label htmlFor="eventId" className="block text-sm font-medium text-gray-700">
              Event *
            </label>
            <select
              name="eventId"
              id="eventId"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Expense Title *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Venue rental deposit"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                id="amount"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700">
                Vendor
              </label>
              <select
                name="vendorId"
                id="vendorId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                id="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select category</option>
                <option value="venue">Venue</option>
                <option value="catering">Catering</option>
                <option value="travel">Travel</option>
                <option value="av">A/V Equipment</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description / Notes
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Additional details about this expense"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              to="/expenses"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Expense"}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}


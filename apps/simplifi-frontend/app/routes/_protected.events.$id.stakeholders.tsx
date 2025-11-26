import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, Form, Link, useParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const event = await api.get(`/events/${params.id}`, {
      token: token || undefined,
    });
    return json({ event, stakeholders: event.stakeholders || [] });
  } catch (error: any) {
    return json({ event: null, stakeholders: [] });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "add") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    try {
      await api.post(
        `/events/${params.id}/stakeholders`,
        { name, email, role },
        { token: token || undefined }
      );
      return json({ success: true });
    } catch (error: any) {
      return json({ error: error.message }, { status: 400 });
    }
  }

  if (action === "remove") {
    const stakeholderId = formData.get("stakeholderId") as string;
    try {
      await api.delete(`/events/${params.id}/stakeholders/${stakeholderId}`, {
        token: token || undefined,
      });
      return json({ success: true });
    } catch (error: any) {
      return json({ error: error.message }, { status: 400 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function EventStakeholders() {
  const { event, stakeholders } = useLoaderData<typeof loader>();
  const params = useParams();
  const fetcher = useFetcher();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/events/${params.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
        >
          ← Back to Event
        </Link>
        <div className="flex justify-between items-center mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stakeholders</h1>
            <p className="mt-2 text-sm text-gray-600">{event?.name}</p>
          </div>
        </div>
      </div>

      {/* Add Stakeholder Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Stakeholder</h2>
        <fetcher.Form method="post" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="hidden" name="action" value="add" />
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add
          </button>
        </fetcher.Form>
      </div>

      {/* Stakeholders List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {stakeholders.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {stakeholders.map((stakeholder: any) => (
              <li key={stakeholder.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{stakeholder.name}</h3>
                    <p className="text-sm text-gray-500">{stakeholder.email}</p>
                    <p className="text-sm text-gray-500">Role: {stakeholder.role}</p>
                  </div>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="remove" />
                    <input type="hidden" name="stakeholderId" value={stakeholder.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Remove
                    </button>
                  </fetcher.Form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No stakeholders added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}


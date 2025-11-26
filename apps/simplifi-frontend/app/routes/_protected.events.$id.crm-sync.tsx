import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams, useFetcher } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const syncStatus = await api.get(`/events/${params.id}/crm-sync`, {
      token: token || undefined,
    });
    return json({ syncStatus: syncStatus || null });
  } catch (error: any) {
    return json({ syncStatus: null });
  }
}

export default function EventCRMSync() {
  const { syncStatus } = useLoaderData<typeof loader>();
  const params = useParams();
  const fetcher = useFetcher();

  const handleSync = () => {
    fetcher.submit(
      {},
      { method: "post", action: `/events/${params.id}/crm-sync` }
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900">CRM Sync</h1>
          <button
            onClick={handleSync}
            disabled={fetcher.state === "submitting"}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {fetcher.state === "submitting" ? "Syncing..." : "Sync with CRM"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {syncStatus ? (
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Sync Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  syncStatus.status === "synced" ? "bg-green-100 text-green-800" :
                  syncStatus.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {syncStatus.status}
                </span>
              </dd>
            </div>
            {syncStatus.lastSyncedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Synced</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(syncStatus.lastSyncedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No CRM sync configured. Click "Sync with CRM" to start syncing.</p>
          </div>
        )}
      </div>
    </div>
  );
}


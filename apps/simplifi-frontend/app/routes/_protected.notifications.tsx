import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const notifications = await api.get("/notifications", {
      token: token || undefined,
    });
    return json({ notifications: notifications || [] });
  } catch (error: any) {
    return json({ notifications: [] });
  }
}

export default function Notifications() {
  const { notifications } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // Refresh notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load("/notifications");
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetcher]);

  const displayNotifications = fetcher.data?.notifications || notifications;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-2 text-sm text-gray-600">
          Stay updated with your event activities
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {displayNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {displayNotifications.map((notification: any) => (
              <li key={notification.id} className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${
                      notification.read ? "bg-gray-300" : "bg-indigo-600"
                    }`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}


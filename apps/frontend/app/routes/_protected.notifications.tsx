import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams, useRevalidator } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import type { User } from "~/lib/auth";
import type { NotificationEntity } from "~/types/entities";
import { FilterBar, EmptyState } from "~/components/shared";
import { AlertCircle, CheckCircle, Info, XCircle, Bell } from "~/components/Icons";
import { formatDate } from "~/lib/utils";
import toast from "react-hot-toast";
import type { FilterConfig } from "~/types";

interface LoaderData {
  user: User | null;
  notifications: NotificationEntity[];
  unreadCount: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get("demo") === "true";
  const readFilter = url.searchParams.get("read");
  const typeFilter = url.searchParams.get("type");

  // In demo mode, return demo data
  if (isDemo) {
    const demoNotifications: NotificationEntity[] = [
      {
        id: "1",
        userId: null,
        eventId: null,
        type: "Warning",
        title: "Budget Alert",
        message: "Event 'Summer Conference' is 85% over budget",
        read: false,
        createdAt: new Date(),
      },
      {
        id: "2",
        userId: null,
        eventId: null,
        type: "Error",
        title: "Approval Required",
        message: "3 expenses pending approval",
        read: false,
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "3",
        userId: null,
        eventId: "demo-event-1",
        type: "Info",
        title: "Event Updated",
        message: "Event 'Summer Conference' has been updated",
        read: true,
        createdAt: new Date(Date.now() - 172800000),
      },
    ];

    return json<LoaderData>({
      user: null as any,
      notifications: demoNotifications,
      unreadCount: 2,
    });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Build query params
    const queryParams = new URLSearchParams();
    if (readFilter !== null) {
      queryParams.set("read", readFilter);
    }
    if (typeFilter) {
      queryParams.set("type", typeFilter);
    }

    const queryString = queryParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ""}`;

    const [notifications, unreadCountResult] = await Promise.all([
      api.get<NotificationEntity[]>(endpoint, { token: token || undefined }),
      api.get<{ count: number }>("/notifications/unread", { token: token || undefined }).catch(() => ({ count: 0 })),
    ]);

    return json<LoaderData>({
      user,
      notifications: notifications || [],
      unreadCount: unreadCountResult?.count || 0,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching notifications:", errorMessage);
    return json<LoaderData>({
      user,
      notifications: [],
      unreadCount: 0,
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get("demo") === "true";

  if (isDemo) {
    return json({ success: true, message: "Demo mode: Changes are not saved" });
  }

  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const notificationId = formData.get("notificationId") as string;

  try {
    if (intent === "markAsRead" && notificationId) {
      await api.put(`/notifications/${notificationId}/read`, {}, { token: token || undefined });
      return json({ success: true, message: "Notification marked as read" });
    }

    if (intent === "markAllAsRead") {
      await api.put("/notifications/read-all", {}, { token: token || undefined });
      return json({ success: true, message: "All notifications marked as read" });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Action error:", errorMessage);
    return json({ error: errorMessage }, { status: 500 });
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "Error":
      return <XCircle size={20} className="text-red-600" />;
    case "Warning":
      return <AlertCircle size={20} className="text-amber-600" />;
    case "Success":
      return <CheckCircle size={20} className="text-green-600" />;
    default:
      return <Info size={20} className="text-blue-600" />;
  }
}

function getNotificationBgColor(type: string) {
  switch (type) {
    case "Error":
      return "bg-red-50 border-red-200";
    case "Warning":
      return "bg-amber-50 border-amber-200";
    case "Success":
      return "bg-green-50 border-green-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
}

export default function NotificationsPage() {
  const { user, notifications, unreadCount } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const isDemo = searchParams.get("demo") === "true";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState(searchParams.get("read") || "all");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "all");

  // Handle fetcher success (only once per action)
  const previousFetcherDataRef = useRef<unknown>(null);
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && fetcher.data !== previousFetcherDataRef.current) {
      const data = fetcher.data as { success?: boolean; message?: string; error?: string };
      previousFetcherDataRef.current = fetcher.data;

      if (data.success) {
        toast.success(data.message || "Action completed successfully");
        revalidator.revalidate();
      } else if (data.error) {
        toast.error(data.error);
      }
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  // Update URL params when filters change (but only if they differ from current params)
  useEffect(() => {
    const currentRead = searchParams.get("read") || "all";
    const currentType = searchParams.get("type") || "all";

    // Only update if filters actually changed
    if (filterRead !== currentRead || filterType !== currentType) {
      const params = new URLSearchParams();
      if (filterRead !== "all") {
        params.set("read", filterRead);
      }
      if (filterType !== "all") {
        params.set("type", filterType);
      }
      if (isDemo) {
        params.set("demo", "true");
      }
      setSearchParams(params, { replace: true });
    }
  }, [filterRead, filterType, isDemo, setSearchParams, searchParams]);

  const handleMarkAsRead = (notificationId: string) => {
    const formData = new FormData();
    formData.append("intent", "markAsRead");
    formData.append("notificationId", notificationId);
    fetcher.submit(formData, { method: "post" });
  };

  const handleMarkAllAsRead = () => {
    const formData = new FormData();
    formData.append("intent", "markAllAsRead");
    fetcher.submit(formData, { method: "post" });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRead =
      filterRead === "all" ||
      (filterRead === "true" && notification.read) ||
      (filterRead === "false" && !notification.read);

    const matchesType = filterType === "all" || notification.type === filterType;

    return matchesSearch && matchesRead && matchesType;
  });

  const unreadNotifications = filteredNotifications.filter((n) => !n.read);
  const readNotifications = filteredNotifications.filter((n) => n.read);

  const filters: FilterConfig[] = [
    {
      key: "read",
      label: "Status",
      type: "select",
      value: filterRead,
      onChange: setFilterRead,
      options: [
        { value: "all", label: "All" },
        { value: "false", label: "Unread" },
        { value: "true", label: "Read" },
      ],
    },
    {
      key: "type",
      label: "Type",
      type: "select",
      value: filterType,
      onChange: setFilterType,
      options: [
        { value: "all", label: "All Types" },
        { value: "Error", label: "Error" },
        { value: "Warning", label: "Warning" },
        { value: "Info", label: "Info" },
        { value: "Success", label: "Success" },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={fetcher.state === "submitting"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search notifications..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
      />

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} className="text-gray-400" />}
          title="No notifications found"
          description={
            notifications.length === 0
              ? "You don't have any notifications yet"
              : "Try adjusting your filters to see more notifications"
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Unread ({unreadNotifications.length})</h3>
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${getNotificationBgColor(notification.type)} ${!notification.read ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                            {notification.message && (
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={fetcher.state === "submitting"}
                              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Read ({readNotifications.length})</h3>
              <div className="space-y-3">
                {readNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${getNotificationBgColor(notification.type)} opacity-75`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        {notification.message && (
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

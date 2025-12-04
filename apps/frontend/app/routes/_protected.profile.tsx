import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, useSubmit, useRevalidator } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import { useState, useEffect } from "react";
import type { User } from "~/lib/auth";

interface UserWithCounts {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  assignedEventIds?: string[];
  _count: {
    events: number;
    activityLogs: number;
    notifications: number;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  details?: any;
  createdAt: string;
  event: {
    id: string;
    name: string;
    status: string;
  } | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Loader - fetch current user details, events, and activity logs
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch all data in parallel for better performance
    const [userDetailsResult, eventsResult, activityLogsResult] = await Promise.allSettled([
      api.get<UserWithCounts>(`/users/${user.id}`, { token: token || undefined }),
      api.get<any[]>("/events", { token: token || undefined }),
      api.get<ActivityLog[]>(`/users/${user.id}/activity-logs`, { token: token || undefined }),
    ]);

    const userDetails = userDetailsResult.status === "fulfilled" ? userDetailsResult.value : null;
    const events = eventsResult.status === "fulfilled" ? (eventsResult.value || []) : [];
    const activityLogs = activityLogsResult.status === "fulfilled" ? (activityLogsResult.value || []) : [];

    return json({
      user: userDetails,
      events,
      activityLogs,
      currentUser: user,
    });
  } catch (error: any) {
    console.error("Error fetching profile data:", error);
    return json({
      user: null,
      events: [],
      activityLogs: [],
      currentUser: user,
      error: error?.message || "Failed to load profile data",
    });
  }
}

/**
 * Action - handle profile updates
 */
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const tokenOption = token ? { token } : {};

  try {
    if (intent === "updateProfile") {
      const updateData: any = {};
      if (formData.get("name")) updateData.name = formData.get("name");
      if (formData.get("email")) updateData.email = formData.get("email");
      if (formData.get("password")) updateData.password = formData.get("password");

      const updatedUser = await api.put<UserWithCounts>(`/users/${user.id}`, updateData, tokenOption);
      return json({ success: true, user: updatedUser, message: "Profile updated successfully" });
    }

    if (intent === "fetchLogs") {
      const logs = await api.get<ActivityLog[]>(`/users/${user.id}/activity-logs`, tokenOption);
      return json({ success: true, logs });
    }

    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return json({ success: false, error: error.message || "An error occurred" }, { status: 400 });
  }
}

// Helper function for role colors
function getRoleColor(role: string) {
  switch (role) {
    case "Admin":
      return "bg-red-100 text-red-800";
    case "EventManager":
      return "bg-blue-100 text-blue-800";
    case "Finance":
      return "bg-green-100 text-green-800";
    case "Viewer":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Format action name into human-readable text
function formatActionName(action: string): string {
  return action
    .replace(/\./g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\b(event|user|budget|item|file)\b/gi, (match) => {
      const words: Record<string, string> = {
        'event': 'Event',
        'user': 'User',
        'budget': 'Budget',
        'item': 'Item',
        'file': 'File',
      };
      return words[match.toLowerCase()] || match;
    });
}

// Format activity log details
function formatActivityLogDetails(action: string, details: any, log: ActivityLog): string {
  if (!details) {
    return "No details available";
  }

  // Handle stringified JSON
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch {
      return details;
    }
  }

  if (typeof details !== 'object') {
    return String(details);
  }

  const lines: string[] = [];

  // Helper to format field names
  const formatFieldName = (field: string): string => {
    return field.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
  };

  // Event actions
  if (action === 'event.created') {
    if (details.eventName) lines.push(`Event: "${details.eventName}"`);
  } else if (action === 'event.updated') {
    if (details.changes && Array.isArray(details.changes)) {
      const changeFields = details.changes.map((c: string) => formatFieldName(c)).join(', ');
      lines.push(`Updated fields: ${changeFields}`);
    }
    if (details.eventName || log.event?.name) {
      lines.push(`Event: "${details.eventName || log.event?.name}"`);
    }
  } else if (action === 'event.deleted') {
    if (details.eventName) lines.push(`Event: "${details.eventName}"`);
  } else if (action === 'event.status.updated') {
    if (details.oldStatus && details.newStatus) {
      lines.push(`Status changed from "${details.oldStatus}" to "${details.newStatus}"`);
    }
    if (details.eventName || log.event?.name) {
      lines.push(`Event: "${details.eventName || log.event?.name}"`);
    }
  }

  return lines.join(' • ') || "No details available";
}

export default function ProfilePage() {
  const loaderData = useLoaderData<typeof loader>();
  const { user, events, activityLogs, currentUser } = loaderData;
  const error = 'error' in loaderData ? loaderData.error : undefined;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const revalidator = useRevalidator();

  const [activeTab, setActiveTab] = useState<'overview' | 'login' | 'events' | 'access' | 'settings'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  const isLoading = navigation.state === "submitting";

  // Reload data after successful actions
  useEffect(() => {
    if (actionData?.success && "message" in actionData && actionData.message) {
      setShowEditModal(false);
      revalidator.revalidate();
    }
  }, [actionData, revalidator]);

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profile</h2>
          <p className="text-red-600">{error || "Failed to load profile data"}</p>
        </div>
      </div>
    );
  }

  // Get user's assigned events
  const assignedEvents = events.filter(e => user.assignedEventIds?.includes(e.id));

  // Filter login history from activity logs
  const loginHistoryData = activityLogs
    .filter(log => log.action.toLowerCase().includes('login') || log.action.toLowerCase().includes('auth'))
    .map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      action: log.action,
      ipAddress: (log.details as any)?.ipAddress || 'N/A',
      userAgent: (log.details as any)?.userAgent || 'N/A',
    }));

  // Access logs are all activity logs
  const accessLogsData = activityLogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your profile settings and view your activity</p>
          </div>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success && "message" in actionData && actionData.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {actionData.message}
        </div>
      )}
      {actionData && !actionData.success && "error" in actionData && actionData.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {actionData.error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        {/* User Info Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-2xl">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name || user.email}
              </h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'login', label: 'Login History', icon: '🔐' },
              { id: 'events', label: 'Event Assignments', icon: '📅' },
              { id: 'access', label: 'Access Logs', icon: '📝' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Events</div>
                  <div className="text-2xl font-bold text-gray-900">{user._count.events}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Activity Logs</div>
                  <div className="text-2xl font-bold text-gray-900">{user._count.activityLogs}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Notifications</div>
                  <div className="text-2xl font-bold text-gray-900">{user._count.notifications}</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'login' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Login History</h3>
              {loginHistoryData.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No login history available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loginHistoryData.map((login) => (
                    <div key={login.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatActionName(login.action)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(login.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>IP Address: {login.ipAddress}</div>
                        <div>User Agent: {login.userAgent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Assignments</h3>
              {assignedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No events assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedEvents.map((event) => (
                    <div key={event.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{event.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {event.location || event.client || 'No location'}
                            {event.startDate && ` • ${new Date(event.startDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'Active' ? 'bg-green-100 text-green-800' :
                          event.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Logs</h3>
              {accessLogsData.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No access logs available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accessLogsData.slice(0, 50).map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatActionName(log.action)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {log.event && (
                        <div className="text-xs text-indigo-600 mb-2">
                          Event: {log.event.name}
                        </div>
                      )}
                      {log.details && (
                        <div className="text-xs text-gray-600 mt-2">
                          {formatActivityLogDetails(log.action, log.details, log)}
                        </div>
                      )}
                    </div>
                  ))}
                  {accessLogsData.length > 50 && (
                    <p className="text-sm text-gray-500 text-center">
                      Showing first 50 of {accessLogsData.length} access logs
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  Use the "Edit Profile" button above to update your profile information, including name, email, and password.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto relative z-[201] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Form
                method="post"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  formData.append("intent", "updateProfile");
                  submit(formData, { method: "post" });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name || ""}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={user.email}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-xs text-gray-500">(leave blank to keep current)</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, useSubmit } from "@remix-run/react";
import { requireRole } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { useState, useEffect } from "react";
import type { User } from "~/lib/auth";

interface UserWithCounts {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
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
 * Loader - fetch users and events
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireRole(request, ["Admin"]);
  const token = await getAuthTokenFromSession(request);

  const [users, events] = await Promise.all([
    api.get<UserWithCounts[]>("/users", { token: token || undefined }),
    api.get<any[]>("/events", { token: token || undefined }),
  ]);

  return json({ users, events, currentUser: user });
}

/**
 * Action - handle user CRUD operations
 */
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireRole(request, ["Admin"]);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const tokenOption = token ? { token } : {};

  try {
    if (intent === "create") {
      const newUser = await api.post<UserWithCounts>("/users", {
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name") || undefined,
        role: formData.get("role") || undefined,
      }, tokenOption);
      return json({ success: true, user: newUser, message: "User created successfully" });
    }

    if (intent === "update") {
      const userId = formData.get("userId") as string;
      const updateData: any = {};
      if (formData.get("email")) updateData.email = formData.get("email");
      if (formData.get("password")) updateData.password = formData.get("password");
      if (formData.get("name")) updateData.name = formData.get("name");
      if (formData.get("role")) updateData.role = formData.get("role");

      const updatedUser = await api.put<UserWithCounts>(`/users/${userId}`, updateData, tokenOption);
      return json({ success: true, user: updatedUser, message: "User updated successfully" });
    }

    if (intent === "delete") {
      const userId = formData.get("userId") as string;
      await api.delete(`/users/${userId}`, tokenOption);
      return json({ success: true, message: "User deleted successfully" });
    }

    if (intent === "assignRole") {
      const userId = formData.get("userId") as string;
      const role = formData.get("role") as string;
      const updatedUser = await api.put<UserWithCounts>(`/users/${userId}/role`, { role }, tokenOption);
      return json({ success: true, user: updatedUser, message: "Role assigned successfully" });
    }

    if (intent === "assignEvent") {
      const userId = formData.get("userId") as string;
      const eventId = formData.get("eventId") as string;
      const role = formData.get("eventRole") as string;
      await api.post(`/users/${userId}/events`, { eventId, role }, tokenOption);
      return json({ success: true, message: "Event assigned successfully" });
    }

    if (intent === "fetchLogs") {
      const userId = formData.get("userId") as string;
      const logs = await api.get<ActivityLog[]>(`/users/${userId}/activity-logs`, tokenOption);
      return json({ success: true, logs });
    }

    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return json({ success: false, error: error.message || "An error occurred" }, { status: 400 });
  }
}

export default function UsersPage() {
  const { users, events, currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserWithCounts | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isLoading = navigation.state === "submitting";

  // Handle activity logs from action response
  useEffect(() => {
    if (actionData?.success && "logs" in actionData && actionData.logs && showActivityLogs) {
      setActivityLogs(actionData.logs as ActivityLog[]);
    }
  }, [actionData, showActivityLogs]);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handleDelete = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("userId", userId);
      submit(formData, { method: "post" });
    }
  };

  const handleViewActivityLogs = async (userId: string) => {
    if (showActivityLogs === userId) {
      setShowActivityLogs(null);
      return;
    }
    setShowActivityLogs(userId);
    try {
      // Fetch activity logs via a form submission to use server-side token
      const formData = new FormData();
      formData.append("intent", "fetchLogs");
      formData.append("userId", userId);
      submit(formData, { method: "post" });
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    }
  };

  const getRoleColor = (role: string) => {
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
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create User
        </button>
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

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="EventManager">Event Manager</option>
              <option value="Finance">Finance</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity Logs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user._count.events}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user._count.activityLogs}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Role
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEventModal(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Events
                    </button>
                    <button
                      onClick={() => handleViewActivityLogs(user.id)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Logs
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > itemsPerPage && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{" "}
            <span className="font-medium">{filteredUsers.length}</span> users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <UserFormModal
          onClose={() => setShowCreateModal(false)}
          intent="create"
          isLoading={isLoading}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          intent="update"
          isLoading={isLoading}
        />
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <RoleAssignmentModal
          user={selectedUser}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Event Assignment Modal */}
      {showEventModal && selectedUser && (
        <EventAssignmentModal
          user={selectedUser}
          events={events}
          onClose={() => {
            setShowEventModal(false);
            setSelectedUser(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Activity Logs Modal */}
      {showActivityLogs && (
        <ActivityLogsModal
          userId={showActivityLogs}
          logs={activityLogs}
          onClose={() => {
            setShowActivityLogs(null);
            setActivityLogs([]);
          }}
        />
      )}
    </div>
  );
}

// User Form Modal Component
function UserFormModal({
  user,
  onClose,
  intent,
  isLoading,
}: {
  user?: UserWithCounts;
  onClose: () => void;
  intent: "create" | "update";
  isLoading: boolean;
}) {
  const submit = useSubmit();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          {intent === "create" ? "Create User" : "Edit User"}
        </h2>
        <Form
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("intent", intent);
            if (user) {
              formData.append("userId", user.id);
            }
            submit(formData, { method: "post" });
            onClose();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                defaultValue={user?.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {intent === "create" ? "*" : "(leave blank to keep current)"}
              </label>
              <input
                type="password"
                name="password"
                required={intent === "create"}
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={user?.name || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                defaultValue={user?.role || "Viewer"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Admin">Admin</option>
                <option value="EventManager">Event Manager</option>
                <option value="Finance">Finance</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : intent === "create" ? "Create" : "Update"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

// Role Assignment Modal
function RoleAssignmentModal({
  user,
  onClose,
  isLoading,
}: {
  user: UserWithCounts;
  onClose: () => void;
  isLoading: boolean;
}) {
  const submit = useSubmit();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Assign Role</h2>
        <p className="text-sm text-gray-600 mb-4">
          Current role: <strong>{user.role}</strong>
        </p>
        <Form
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("intent", "assignRole");
            formData.append("userId", user.id);
            submit(formData, { method: "post" });
            onClose();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Role
            </label>
            <select
              name="role"
              defaultValue={user.role}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Admin">Admin</option>
              <option value="EventManager">Event Manager</option>
              <option value="Finance">Finance</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Assigning..." : "Assign Role"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

// Event Assignment Modal
function EventAssignmentModal({
  user,
  events,
  onClose,
  isLoading,
}: {
  user: UserWithCounts;
  events: any[];
  onClose: () => void;
  isLoading: boolean;
}) {
  const submit = useSubmit();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Assign Event to {user.name || user.email}</h2>
        <Form
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("intent", "assignEvent");
            formData.append("userId", user.id);
            submit(formData, { method: "post" });
            onClose();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
              <select
                name="eventId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select an event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role (optional)
              </label>
              <input
                type="text"
                name="eventRole"
                placeholder="e.g., Manager, Coordinator"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Assigning..." : "Assign Event"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

// Activity Logs Modal
function ActivityLogsModal({
  userId,
  logs,
  onClose,
}: {
  userId: string;
  logs: ActivityLog[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Activity Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity logs found.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{log.action}</span>
                    {log.event && (
                      <span className="ml-2 text-sm text-gray-500">
                        - Event: {log.event.name}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                {log.details && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


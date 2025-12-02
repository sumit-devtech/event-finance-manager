import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, useSubmit, useRevalidator } from "@remix-run/react";
import { requireRole } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { useState, useEffect } from "react";
import React from "react";
import type { User } from "~/lib/auth";
import { Dropdown, ConfirmDialog } from "~/components/shared";
import toast from "react-hot-toast";

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
 * Loader - fetch users and events
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireRole(request, ["Admin"]);
  const token = await getAuthTokenFromSession(request);

  const [users, events] = await Promise.all([
    api.get<UserWithCounts[]>("/users", { token: token || undefined }),
    api.get<any[]>("/events", { token: token || undefined }),
  ]);

  // Fetch user details with assigned event IDs for each user
  const usersWithAssignments = await Promise.all(
    users.map(async (u) => {
      try {
        const userDetails = await api.get<any>(`/users/${u.id}`, { token: token || undefined });
        const assignedEventIds = userDetails.assignedEventIds || [];
        console.log(`[Loader] User ${u.id} (${u.email}) has assigned events:`, assignedEventIds);
        return { ...u, assignedEventIds };
      } catch (error) {
        console.error(`[Loader] Failed to fetch assignments for user ${u.id}:`, error);
        return { ...u, assignedEventIds: [] };
      }
    })
  );

  console.log(`[Loader] Loaded ${usersWithAssignments.length} users with assignments`);
  return json({ users: usersWithAssignments, events, currentUser: user });
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
      // Always include name field if it exists in formData (even if empty string)
      if (formData.has("name")) {
        updateData.name = formData.get("name") as string;
      }
      if (formData.get("role")) updateData.role = formData.get("role");

      console.log("Updating user:", userId, "with data:", updateData); // Debug log
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

    if (intent === "inviteUser") {
      const email = formData.get("email") as string;
      const name = formData.get("name") as string;
      const role = formData.get("role") as string;

      if (!email || !role) {
        return json({ success: false, error: 'Email and role are required' }, { status: 400 });
      }

      // Create user with invitation (password will be set on first login)
      const newUser = await api.post<UserWithCounts>("/users", {
        email,
        name: name || undefined,
        role,
        password: Math.random().toString(36).slice(-12), // Generate temporary password
      }, tokenOption);

      return json({ success: true, user: newUser, message: `Invitation sent to ${email}` });
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

export default function UsersPage() {
  const { users, events, currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
    const revalidator = useRevalidator();

  // Debug: Log users to see what fields they have
  useEffect(() => {
    if (users && users.length > 0) {
      console.log("Users data:", users);
      console.log("First user:", users[0]);
      console.log("First user name:", users[0]?.name);
      console.log("First user fullName:", (users[0] as any)?.fullName);
    }
  }, [users]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all"); // all, active, inactive
  const [selectedUser, setSelectedUser] = useState<UserWithCounts | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<ActivityLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'login' | 'events' | 'access'>('overview');
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const itemsPerPage = 10;

  const isLoading = navigation.state === "submitting";

  // Handle activity logs from action response
  useEffect(() => {
    if (actionData?.success && "logs" in actionData && actionData.logs && showActivityLogs) {
      setActivityLogs(actionData.logs as ActivityLog[]);
    }
  }, [actionData, showActivityLogs]);

    // Reload data after successful actions (except delete which redirects)
    useEffect(() => {
        if (actionData?.success && "message" in actionData && actionData.message) {
            // Close all modals
            setShowCreateModal(false);
            setShowEditModal(false);
            setShowRoleModal(false);
            setShowEventModal(false);
            setSelectedUser(null);

            // Reload the page data after a short delay to show the success message
            const timer = setTimeout(() => {
                revalidator.revalidate();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [actionData, revalidator]);

  // Get unique departments from events (using location/client as department proxy)
  const departments = Array.from(new Set(events.map(e => e.location || e.client).filter(Boolean)));

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    // Department filter: check if user has events in that department
    let matchesDepartment = true;
    if (departmentFilter !== "all") {
      const userEvents = events.filter(e => user.assignedEventIds?.includes(e.id));
      matchesDepartment = userEvents.some(e => (e.location || e.client) === departmentFilter);
    }

    // Activity filter: active = has recent activity (last 30 days), inactive = no recent activity
    let matchesActivity = true;
    if (activityFilter !== "all") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const hasRecentActivity = user._count.activityLogs > 0; // Simplified: if has any activity logs
      if (activityFilter === "active") {
        matchesActivity = hasRecentActivity || user._count.events > 0;
      } else if (activityFilter === "inactive") {
        matchesActivity = !hasRecentActivity && user._count.events === 0;
      }
    }

    return matchesSearch && matchesRole && matchesDepartment && matchesActivity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, activityFilter]);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  });

  const handleDelete = (userId: string) => {
    setDeleteConfirm({ isOpen: true, userId });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.userId) return;
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("userId", deleteConfirm.userId);
    submit(formData, { method: "post" });
    toast.success('User deleted successfully');
    setDeleteConfirm({ isOpen: false, userId: null });
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

  const handleFetchUserProfileData = async (userId: string) => {
    try {
      // Fetch activity logs for access logs
      const formData = new FormData();
      formData.append("intent", "fetchLogs");
      formData.append("userId", userId);
      submit(formData, { method: "post" });

      // Login history can be derived from activity logs filtered by login actions
      // For now, we'll use activity logs as a proxy
    } catch (error) {
      console.error("Failed to fetch user profile data:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsInviteMode(false);
              setShowCreateModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsInviteMode(true);
              setShowCreateModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Invite User
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

      {/* Filters */}
      <div className="mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Filter by Role
              <div className="group relative">
                <svg className="h-4 w-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="space-y-2">
                    <div><strong>Admin:</strong> Full system access, manage users and events</div>
                    <div><strong>EventManager:</strong> Create and manage events, assign users</div>
                    <div><strong>Finance:</strong> Manage budgets, expenses, and financial data</div>
                    <div><strong>Viewer:</strong> Read-only access to events and reports</div>
                  </div>
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
            <Dropdown
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'Admin', label: 'Admin' },
                { value: 'EventManager', label: 'Event Manager' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Viewer', label: 'Viewer' },
              ]}
              placeholder="Select role"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Department
            </label>
            <Dropdown
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map((dept) => ({
                  value: dept,
                  label: dept,
                })),
              ]}
              placeholder="Select department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recent Activity
            </label>
            <Dropdown
              value={activityFilter}
              onChange={setActivityFilter}
              options={[
                { value: 'all', label: 'All Users' },
                { value: 'active', label: 'Active (Last 30 days)' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="Select activity"
            />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 mb-4 text-lg">No users found matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="space-y-4 p-4">
                {paginatedUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-bold text-gray-900 truncate">
                              {user.name && user.name.trim() ? user.name : "No name"}
                            </div>
                            <div className="text-sm text-gray-600 truncate mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    
                    {/* Card Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500 mt-1">Created</span>
                        <span className="text-xs font-semibold text-gray-900 mt-0.5 text-center">
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500 mt-1">Events</span>
                        <span className="text-xs font-semibold text-gray-900 mt-0.5">{user._count.events}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-gray-500 mt-1">Logs</span>
                        <span className="text-xs font-semibold text-gray-900 mt-0.5">{user._count.activityLogs}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Role
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowEventModal(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Events
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedUser(user);
                          setShowProfileModal(true);
                          setActiveProfileTab('overview');
                          // Fetch login history and access logs
                          handleFetchUserProfileData(user.id);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(user.id);
                        }}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
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
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name && user.name.trim() ? user.name : "No name"}
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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer transition-colors"
                          >
                            Role
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setShowEventModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 cursor-pointer transition-colors"
                          >
                            Events
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setShowProfileModal(true);
                              setActiveProfileTab('overview');
                              handleFetchUserProfileData(user.id);
                            }}
                            className="text-purple-600 hover:text-purple-900 cursor-pointer transition-colors"
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user.id);
                            }}
                            className="text-red-600 hover:text-red-900 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > itemsPerPage && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{" "}
            <span className="font-medium">{filteredUsers.length}</span> users
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Previous
            </button>
            <div className="flex space-x-1 overflow-x-auto max-w-full">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage(page);
                  }}
                  className={`px-3 py-2 border-2 rounded-lg text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create User / Invite User Modal */}
      {showCreateModal && (
        <UserFormModal
          onClose={() => {
            setShowCreateModal(false);
            setIsInviteMode(false);
          }}
          intent="create"
          isLoading={isLoading}
          isInvite={isInviteMode}
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
          assignedEventIds={selectedUser.assignedEventIds || []}
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

      {/* User Profile Details Modal */}
      {showProfileModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          events={events}
          activityLogs={activityLogs}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUser(null);
            setActiveProfileTab('overview');
            setActivityLogs([]);
            setLoginHistory([]);
            setAccessLogs([]);
          }}
          activeTab={activeProfileTab}
          onTabChange={setActiveProfileTab}
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
  isInvite = false,
}: {
  user?: UserWithCounts;
  onClose: () => void;
  intent: "create" | "update";
  isLoading: boolean;
    isInvite?: boolean;
}) {
  const submit = useSubmit();
  const [role, setRole] = useState(user?.role || "Viewer");

  // Debug: Log user object to see what fields it has
  if (user && intent === "update") {
    console.log("Edit user object:", user);
    console.log("User name field:", user.name);
    console.log("User fullName field:", (user as any).fullName);
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto relative z-[101] max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isInvite ? "Invite User" : intent === "create" ? "Create User" : "Edit User"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {isInvite ? "Send an invitation to join the system" : intent === "create" ? "Add a new user to the system" : `Update ${user?.name || user?.email || "user"} details`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const formData = new FormData(e.currentTarget);
              formData.append("intent", isInvite ? "inviteUser" : intent);
              if (user) {
                formData.append("userId", user.id);
              }
              submit(formData, { method: "post" });
              onClose();
            }}
          >
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={user?.email}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Password */}
              {!isInvite && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {intent === "create" ? <span className="text-red-500">*</span> : <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={intent === "create"}
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              )}
              {isInvite && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> A temporary password will be generated and the user will be prompted to set a new password on first login.
                  </p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.name || ""}
                  placeholder="Enter full name..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Role
                  <div className="group relative">
                    <svg className="h-4 w-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="space-y-2">
                        <div><strong>Admin:</strong> Full system access, manage users and events</div>
                        <div><strong>EventManager:</strong> Create and manage events, assign users</div>
                        <div><strong>Finance:</strong> Manage budgets, expenses, and financial data</div>
                        <div><strong>Viewer:</strong> Read-only access to events and reports</div>
                      </div>
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </label>
                <input type="hidden" name="role" value={role} />
                <Dropdown
                  value={role}
                  onChange={setRole}
                  options={[
                    { value: 'Admin', label: 'Admin' },
                    { value: 'EventManager', label: 'Event Manager' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Viewer', label: 'Viewer' },
                  ]}
                  placeholder="Select role"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={intent === "create" ? "M12 4v16m8-8H4" : "M5 13l4 4L19 7"} />
                    </svg>
                      {isInvite ? "Send Invitation" : intent === "create" ? "Create User" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>
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
  const [role, setRole] = useState(user.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto relative z-[201]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Role</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Update role for {user.name || user.email}
              </p>
            </div>
          </div>

          {/* Current Role Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Current Role:</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
          </div>

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
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role <span className="text-red-500">*</span>
                </label>
                <input type="hidden" name="role" value={role} />
                <Dropdown
                  value={role}
                  onChange={setRole}
                  options={[
                    { value: 'Admin', label: 'Admin' },
                    { value: 'EventManager', label: 'Event Manager' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Viewer', label: 'Viewer' },
                  ]}
                  placeholder="Select role"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Assigning...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Assign Role
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

// Event Assignment Modal
function EventAssignmentModal({
  user,
  events,
  assignedEventIds,
  onClose,
  isLoading,
}: {
  user: UserWithCounts;
  events: any[];
    assignedEventIds: string[];
  onClose: () => void;
  isLoading: boolean;
}) {
  const submit = useSubmit();
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Filter out events that are already assigned to this user
  // Debug logging
  console.log(`[EventAssignmentModal] User: ${user.id} (${user.name || user.email})`);
  console.log(`[EventAssignmentModal] Assigned Event IDs:`, assignedEventIds);
  console.log(`[EventAssignmentModal] Assigned Event IDs type:`, typeof assignedEventIds, Array.isArray(assignedEventIds));
  console.log(`[EventAssignmentModal] Total events: ${events.length}`);

  // Ensure assignedEventIds is an array
  const assignedIds = Array.isArray(assignedEventIds) ? assignedEventIds : [];

  const availableEvents = events.filter((event) => {
    const isAssigned = assignedIds.includes(event.id);
    if (isAssigned) {
      console.log(`[EventAssignmentModal] Filtering out assigned event: ${event.id} (${event.name})`);
    }
    return !isAssigned;
  });

  console.log(`[EventAssignmentModal] Available events after filtering: ${availableEvents.length}`);
  console.log(`[EventAssignmentModal] Available event IDs:`, availableEvents.map(e => e.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto relative z-[201] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Assign Event</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Assign event to {user.name || user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
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
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event <span className="text-red-500">*</span>
                </label>
                {availableEvents.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {events.length === 0
                        ? "No events available to assign"
                        : "All events are already assigned to this user"}
                    </p>
                  </div>
                ) : (
                  <>
                    <input type="hidden" name="eventId" value={selectedEventId || ""} />
                    <Dropdown
                      value={selectedEventId || ""}
                      onChange={setSelectedEventId}
                      options={[
                        { value: '', label: '-- Select an event --' },
                        ...availableEvents.map((event) => ({
                          value: event.id,
                          label: `${event.name} (${event.status})`,
                        })),
                      ]}
                      placeholder="-- Select an event --"
                    />
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  name="eventRole"
                  placeholder="e.g., Manager, Coordinator, Lead..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500">Specify the role this user will have for this event</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || events.length === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Assigning...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Assign Event
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
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

// Format activity log details into human-readable text (returns JSX elements)
function formatActivityLogDetails(action: string, details: any, log: ActivityLog): React.ReactNode {
  if (!details) {
    return <span className="text-gray-500 italic">No details available</span>;
  }

  // Handle stringified JSON
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch {
      return <span>{details}</span>;
    }
  }

  if (typeof details !== 'object') {
    return <span>{String(details)}</span>;
  }

  const lines: React.ReactNode[] = [];

  // Helper to format field names
  const formatFieldName = (field: string): string => {
    return field.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
  };

  // Event actions
  if (action === 'event.created') {
    if (details.eventName) lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName}"</span></div>);
  } else if (action === 'event.updated') {
    if (details.changes && Array.isArray(details.changes)) {
      const changeFields = details.changes.map((c: string) => formatFieldName(c)).join(', ');
      lines.push(<div key="changes">Updated fields: <span className="font-semibold">{changeFields}</span></div>);
    }
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'event.deleted') {
    if (details.eventName) lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName}"</span></div>);
  } else if (action === 'event.status.updated') {
    if (details.oldStatus && details.newStatus) {
      lines.push(<div key="status">Status changed from <span className="font-semibold">"{details.oldStatus}"</span> to <span className="font-semibold">"{details.newStatus}"</span></div>);
    }
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'event.user.assigned') {
    if (details.userName) lines.push(<div key="user">User: <span className="font-semibold">{details.userName}</span></div>);
    if (details.role) lines.push(<div key="role">Role: <span className="font-semibold">{details.role}</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'event.user.unassigned') {
    if (details.userName) lines.push(<div key="user">User: <span className="font-semibold">{details.userName}</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'event.file.uploaded') {
    if (details.filename) lines.push(<div key="file">File: <span className="font-semibold">"{details.filename}"</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'event.file.deleted') {
    if (details.filename) lines.push(<div key="file">File: <span className="font-semibold">"{details.filename}"</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  }
  // Budget item actions
  else if (action === 'budget-item.created') {
    if (details.description) lines.push(<div key="description">Description: <span className="font-semibold">"{details.description}"</span></div>);
    if (details.category) lines.push(<div key="category">Category: <span className="font-semibold">{details.category}</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'budget-item.updated') {
    if (details.changes && Array.isArray(details.changes)) {
      const changeFields = details.changes.map((c: string) => formatFieldName(c)).join(', ');
      lines.push(<div key="changes">Updated fields: <span className="font-semibold">{changeFields}</span></div>);
    }
    if (details.description) lines.push(<div key="description">Description: <span className="font-semibold">"{details.description}"</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'budget-item.deleted') {
    if (details.description) lines.push(<div key="description">Description: <span className="font-semibold">"{details.description}"</span></div>);
    if (details.category) lines.push(<div key="category">Category: <span className="font-semibold">{details.category}</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'budget-item.file.uploaded') {
    if (details.filename) lines.push(<div key="file">File: <span className="font-semibold">"{details.filename}"</span></div>);
    if (details.description) lines.push(<div key="description">Budget Item: <span className="font-semibold">"{details.description}"</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'budget-item.file.deleted') {
    if (details.filename) lines.push(<div key="file">File: <span className="font-semibold">"{details.filename}"</span></div>);
    if (details.description) lines.push(<div key="description">Budget Item: <span className="font-semibold">"{details.description}"</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  } else if (action === 'budget.over-budget.alert') {
    if (details.variance !== undefined) {
      const variance = parseFloat(details.variance);
      const sign = variance >= 0 ? '+' : '';
      lines.push(<div key="variance">Budget variance: <span className="font-semibold">{sign}{variance.toFixed(2)}</span></div>);
    }
    if (details.variancePercentage !== undefined) {
      const percentage = parseFloat(details.variancePercentage);
      const sign = percentage >= 0 ? '+' : '';
      lines.push(<div key="percentage">Variance percentage: <span className="font-semibold">{sign}{percentage.toFixed(2)}%</span></div>);
    }
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  }
  // User actions
  else if (action === 'user.created') {
    if (details.userName) lines.push(<div key="user">User: <span className="font-semibold">{details.userName}</span></div>);
    if (details.email) lines.push(<div key="email">Email: <span className="font-semibold">{details.email}</span></div>);
  } else if (action === 'user.updated') {
    if (details.changes && Array.isArray(details.changes)) {
      const changeFields = details.changes.map((c: string) => formatFieldName(c)).join(', ');
      lines.push(<div key="changes">Updated fields: <span className="font-semibold">{changeFields}</span></div>);
    }
    if (details.userName) lines.push(<div key="user">User: <span className="font-semibold">{details.userName}</span></div>);
  } else if (action === 'user.deleted') {
    if (details.email) lines.push(<div key="email">Email: <span className="font-semibold">{details.email}</span></div>);
  } else if (action === 'user.role.assigned') {
    if (details.userName) lines.push(<div key="user">User: <span className="font-semibold">{details.userName}</span></div>);
    if (details.oldRole && details.newRole) {
      lines.push(<div key="role">Role changed from <span className="font-semibold">"{details.oldRole}"</span> to <span className="font-semibold">"{details.newRole}"</span></div>);
    } else if (details.newRole) {
      lines.push(<div key="role">Role assigned: <span className="font-semibold">{details.newRole}</span></div>);
    }
  } else if (action === 'user.event.assigned') {
    if (details.userName) lines.push(<div key="user">User: <span className="font-semibold">{details.userName}</span></div>);
    if (details.role) lines.push(<div key="role">Role: <span className="font-semibold">{details.role}</span></div>);
    if (details.eventName || log.event?.name) {
      lines.push(<div key="event">Event: <span className="font-semibold">"{details.eventName || log.event?.name}"</span></div>);
    }
  }
  // Fallback: format as key-value pairs
  else {
    Object.keys(details).forEach((key, index) => {
      const value = details[key];
      if (value !== null && value !== undefined && !key.includes('Id') && key !== 'userId' && key !== 'eventId' && key !== 'budgetItemId' && key !== 'fileId') {
        const formattedKey = formatFieldName(key);
        if (Array.isArray(value)) {
          lines.push(<div key={index}>{formattedKey}: <span className="font-semibold">{value.join(', ')}</span></div>);
        } else if (typeof value === 'object') {
          lines.push(<div key={index}>{formattedKey}: <span className="font-semibold">{JSON.stringify(value)}</span></div>);
        } else {
          lines.push(<div key={index}>{formattedKey}: <span className="font-semibold">{value}</span></div>);
        }
      }
    });
  }

  return lines.length > 0 ? <div className="space-y-1">{lines}</div> : <span className="text-gray-500 italic">No details available</span>;
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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-auto relative z-[201] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Activity Logs</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                View user activity history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No activity logs found.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-5 hover:border-indigo-300 transition-all duration-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatActionName(log.action)}</span>
                        {log.event && (
                          <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {log.event.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Details:</p>
                      <div className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {formatActivityLogDetails(log.action, log.details, log)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// User Profile Details Modal with Tabs
function UserProfileModal({
  user,
  events,
  activityLogs,
  onClose,
  activeTab,
  onTabChange,
}: {
  user: UserWithCounts;
  events: any[];
  activityLogs: ActivityLog[];
  onClose: () => void;
  activeTab: 'overview' | 'login' | 'events' | 'access';
  onTabChange: (tab: 'overview' | 'login' | 'events' | 'access') => void;
}) {
  // Get user's assigned events
  const assignedEvents = events.filter(e => user.assignedEventIds?.includes(e.id));

  // Filter login history from activity logs (actions containing 'login' or 'auth')
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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-auto relative z-[201] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-lg">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {user.name || user.email}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {user.email} • <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'login', label: 'Login History', icon: '🔐' },
              { id: 'events', label: 'Event Assignments', icon: '📅' },
              { id: 'access', label: 'Access Logs', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === 'Active' ? 'bg-green-100 text-green-800' :
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
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null })}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}


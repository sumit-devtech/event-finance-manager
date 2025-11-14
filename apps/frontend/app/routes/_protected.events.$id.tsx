import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigation, useSubmit, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { useState, useEffect, useRef } from "react";

interface EventDetail {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignments: Array<{
    id: string;
    role: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
  }>;
  files: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  }>;
  budgetItems: Array<{
    id: string;
    category: string;
    description: string;
    estimatedCost: number | null;
    actualCost: number | null;
    vendor: string | null;
  }>;
  _count: {
    files: number;
    budgetItems: number;
    activityLogs: number;
  };
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Loader - fetch event detail and users
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const eventId = params.id!;

  try {
    const event = await api.get<EventDetail>(`/events/${eventId}`, { token: token || undefined });
    // Try to fetch users, but don't fail if user doesn't have permission (non-admin)
    let users: User[] = [];
    try {
      users = await api.get<User[]>("/users", { token: token || undefined });
    } catch {
      // Users endpoint requires Admin role, so non-admin users will get empty array
      users = [];
    }
    return json({ event, users, user });
  } catch (error: any) {
    throw new Response("Event not found", { status: 404 });
  }
}

/**
 * Action - handle status update, file upload, assignment
 */
export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const eventId = params.id!;

  // Debug logging (remove in production)
  console.log("Action called:", { intent, eventId, userRole: user.role, hasToken: !!token });

  const tokenOption = token ? { token } : {};

  try {
    if (intent === "updateStatus") {
      const status = formData.get("status") as string;
      await api.put(`/events/${eventId}/status`, { status }, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "assignUser") {
      const userId = formData.get("userId") as string;
      const role = formData.get("role") as string || undefined;
      await api.post(`/events/${eventId}/assign`, { userId, role }, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "unassignUser") {
      const userId = formData.get("userId") as string;
      await api.delete(`/events/${eventId}/assign/${userId}`, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "uploadFile") {
      const file = formData.get("file") as File;
      if (!file) {
        return json({ error: "No file selected" }, { status: 400 });
      }
      await api.upload(`/events/${eventId}/files`, file, {}, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "deleteFile") {
      const fileId = formData.get("fileId") as string;
      await api.delete(`/events/${eventId}/files/${fileId}`, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "createBudgetItem") {
      const category = formData.get("category") as string;
      const description = formData.get("description") as string;
      const estimatedCost = formData.get("estimatedCost") ? parseFloat(formData.get("estimatedCost") as string) : undefined;
      const actualCost = formData.get("actualCost") ? parseFloat(formData.get("actualCost") as string) : undefined;
      const vendor = formData.get("vendor") as string || undefined;

      await api.post(`/events/${eventId}/budget-items`, {
        category,
        description,
        estimatedCost,
        actualCost,
        vendor,
      }, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "updateBudgetItem") {
      const budgetItemId = formData.get("budgetItemId") as string;
      const category = formData.get("category") as string;
      const description = formData.get("description") as string;
      const estimatedCost = formData.get("estimatedCost") ? parseFloat(formData.get("estimatedCost") as string) : null;
      const actualCost = formData.get("actualCost") ? parseFloat(formData.get("actualCost") as string) : null;
      const vendor = formData.get("vendor") as string || undefined;

      await api.put(`/budget-items/${budgetItemId}`, {
        category,
        description,
        estimatedCost,
        actualCost,
        vendor,
      }, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "deleteBudgetItem") {
      const budgetItemId = formData.get("budgetItemId") as string;
      await api.delete(`/budget-items/${budgetItemId}`, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Action error:", error);
    // Extract error message from API error
    let errorMessage = "An error occurred";
    let statusCode = 400;

    // Handle ApiClientError from api.ts
    if (error.statusCode) {
      statusCode = error.statusCode;
      errorMessage = error.message || `Error ${statusCode}: Request failed`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Log full error for debugging
    console.error("Full error details:", {
      message: errorMessage,
      statusCode,
      error: error,
    });

    return json({ error: errorMessage }, { status: statusCode });
  }
}

export default function EventDetailPage() {
  const { event, users, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBudgetItemModal, setShowBudgetItemModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(event.status);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<EventDetail["budgetItems"][0] | null>(null);

  const canManageBudget = user?.role === "Admin" || user?.role === "EventManager" || user?.role === "Finance";
  const canAssignUsers = user?.role === "Admin" || user?.role === "EventManager";
  const canUploadFiles = user?.role === "Admin" || user?.role === "EventManager" || user?.role === "Finance";

  const isLoading = navigation.state === "submitting" || navigation.state === "loading";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = () => {
    const formData = new FormData();
    formData.append("intent", "updateStatus");
    formData.append("status", selectedStatus);
    submit(formData, { method: "post" });
    setShowStatusModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("intent", "uploadFile");
      formData.append("file", file);
      submit(formData, { method: "post", encType: "multipart/form-data" });
    }
  };

  const handleAssignUser = (userId: string, role: string) => {
    const formData = new FormData();
    formData.append("intent", "assignUser");
    formData.append("userId", userId);
    formData.append("role", role);
    submit(formData, { method: "post" });
    setShowAssignModal(false);
  };

  const handleUnassignUser = (userId: string) => {
    if (confirm("Are you sure you want to remove this user from the event?")) {
      const formData = new FormData();
      formData.append("intent", "unassignUser");
      formData.append("userId", userId);
      submit(formData, { method: "post" });
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      const formData = new FormData();
      formData.append("intent", "deleteFile");
      formData.append("fileId", fileId);
      submit(formData, { method: "post" });
    }
  };

  const handleDeleteBudgetItem = (budgetItemId: string) => {
    if (confirm("Are you sure you want to delete this budget item?")) {
      const formData = new FormData();
      formData.append("intent", "deleteBudgetItem");
      formData.append("budgetItemId", budgetItemId);
      submit(formData, { method: "post" });
    }
  };

  const handleEditBudgetItem = (item: EventDetail["budgetItems"][0]) => {
    setSelectedBudgetItem(item);
    setShowBudgetItemModal(true);
  };

  const handleAddBudgetItem = () => {
    setSelectedBudgetItem(null);
    setShowBudgetItemModal(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <div className="mt-2 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(event.status)}`}
              title="Click to update status"
            >
              {event.status}
            </button>
            {event.client && (
              <span className="text-sm text-gray-600">Client: {event.client}</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/events/${event.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {actionData.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Event Name</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{event.name}</dd>
              </div>
              {event.description && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{event.description}</dd>
                </div>
              )}
              {event.client && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Client</dt>
                  <dd className="mt-1 text-sm text-gray-900">{event.client}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(true)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(event.status)}`}
                    title="Click to update status"
                  >
                    {event.status}
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {event.startDate ? new Date(event.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }) : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {event.endDate ? new Date(event.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }) : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(event.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(event.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Assigned Users */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assigned Users</h2>
              {canAssignUsers && (
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
                >
                  + Assign User
                </button>
              )}
            </div>
            {event.assignments.length === 0 ? (
              <p className="text-sm text-gray-500">No users assigned</p>
            ) : (
              <div className="space-y-2">
                {event.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.user.name || assignment.user.email}
                      </div>
                      {assignment.role && (
                        <div className="text-xs text-gray-500">{assignment.role}</div>
                      )}
                    </div>
                    {canAssignUsers && (
                      <button
                        type="button"
                        onClick={() => handleUnassignUser(assignment.user.id)}
                        className="text-sm text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Files</h2>
              {canUploadFiles && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
                  >
                    + Upload File
                  </button>
                </div>
              )}
            </div>
            {event.files.length === 0 ? (
              <p className="text-sm text-gray-500">No files uploaded</p>
            ) : (
              <div className="space-y-2">
                {event.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {canUploadFiles && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-sm text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Assigned Users</dt>
                <dd className="text-2xl font-semibold text-gray-900">{event.assignments.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Budget Items</dt>
                <dd className="text-2xl font-semibold text-gray-900">{event._count.budgetItems}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Files</dt>
                <dd className="text-2xl font-semibold text-gray-900">{event._count.files}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Activity Logs</dt>
                <dd className="text-2xl font-semibold text-gray-900">{event._count.activityLogs}</dd>
              </div>
            </dl>
          </div>

          {/* Budget Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Budget Items</h2>
                <Link
                  to={`/events/${event.id}/budget`}
                  className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  View Full Budget →
                </Link>
              </div>
              {canManageBudget && (
                <button
                  type="button"
                  onClick={handleAddBudgetItem}
                  className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
                >
                  + Add Budget Item
                </button>
              )}
            </div>
            {event.budgetItems.length === 0 ? (
              <p className="text-sm text-gray-500">No budget items added</p>
            ) : (
              <div className="space-y-3">
                {event.budgetItems.map((item) => {
                  const cost = item.actualCost ?? item.estimatedCost ?? 0;
                  return (
                    <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.category}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        )}
                        {item.vendor && (
                          <div className="text-xs text-gray-400 mt-1">Vendor: {item.vendor}</div>
                        )}
                        {item.estimatedCost && item.actualCost && (
                          <div className="text-xs mt-1">
                            <span className="text-gray-500">Est: ${item.estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="text-gray-700 ml-2">Actual: ${item.actualCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ${Number(cost).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {canManageBudget && (
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => handleEditBudgetItem(item)}
                              className="text-xs text-blue-600 hover:text-blue-900 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBudgetItem(item.id)}
                              className="text-xs text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Total Budget</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${event.budgetItems.reduce((sum, item) => {
                        const cost = item.actualCost ?? item.estimatedCost ?? 0;
                        return sum + Number(cost);
                      }, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStatusModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAssignModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Assign User</h2>
            <AssignUserForm
              users={users}
              assignedUserIds={event.assignments.map((a) => a.user.id)}
              onAssign={handleAssignUser}
              onCancel={() => setShowAssignModal(false)}
            />
          </div>
        </div>
      )}

      {/* Budget Item Modal */}
      {showBudgetItemModal && (
        <BudgetItemModal
          eventId={event.id}
          item={selectedBudgetItem}
          onClose={() => {
            setShowBudgetItemModal(false);
            setSelectedBudgetItem(null);
          }}
          onSubmit={() => {
            // Page will reload after redirect
          }}
        />
      )}
    </div>
  );
}

function AssignUserForm({
  users,
  assignedUserIds,
  onAssign,
  onCancel,
}: {
  users: User[];
  assignedUserIds: string[];
  onAssign: (userId: string, role: string) => void;
  onCancel: () => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("");

  const availableUsers = users.filter((user) => !assignedUserIds.includes(user.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onAssign(selectedUserId, role);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Select a user --</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ? `${user.name} (${user.email})` : user.email}
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
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Manager, Coordinator"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
        >
          Assign
        </button>
      </div>
    </form>
  );
}

// Budget Item Modal
function BudgetItemModal({
  eventId,
  item,
  onClose,
  onSubmit,
}: {
  eventId: string;
  item: EventDetail["budgetItems"][0] | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const submit = useSubmit();
  const isEdit = !!item;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("intent", isEdit ? "updateBudgetItem" : "createBudgetItem");
    if (isEdit) {
      formData.append("budgetItemId", item.id);
    }
    submit(formData, { method: "post" });
    onSubmit();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Budget Item" : "Add Budget Item"}</h2>
        <Form method="post" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                required
                defaultValue={item?.category || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select category</option>
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Marketing">Marketing</option>
                <option value="Logistics">Logistics</option>
                <option value="Entertainment">Entertainment</option>
                <option value="StaffTravel">Staff Travel</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                defaultValue={item?.description || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <input
                type="text"
                name="vendor"
                defaultValue={item?.vendor || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  name="estimatedCost"
                  step="0.01"
                  min="0"
                  defaultValue={item?.estimatedCost || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Cost
                </label>
                <input
                  type="number"
                  name="actualCost"
                  step="0.01"
                  min="0"
                  defaultValue={item?.actualCost || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
              >
                {isEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}


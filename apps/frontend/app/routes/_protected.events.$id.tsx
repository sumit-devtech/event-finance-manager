import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigation, useSubmit, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { useState, useEffect, useRef } from "react";
import { ConfirmDialog, Dropdown } from "~/components/shared";
import toast from "react-hot-toast";
import { demoEventDetail } from "~/lib/demoData";

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
    vendorId?: string | null;
    vendorLink?: { id: string } | null;
    assignedUserId?: string | null;
    assignedUser?: { id: string } | null;
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
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';
  const eventId = params.id!;

  // In demo mode, return demo data from centralized file
  if (isDemo) {
    // Return demo event data based on eventId, but update the id to match the route param
    const demoEvent: EventDetail = {
      ...demoEventDetail,
      id: eventId,
    };

    return json({ event: demoEvent, users: [], vendors: [], user: null as any });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch all data in parallel for better performance
    const [eventResult, usersResult, strategicGoalsResult, vendorsResult] = await Promise.allSettled([
      api.get<EventDetail>(`/events/${eventId}`, { token: token || undefined }),
      user.role === "Admin"
        ? api.get<User[]>("/users", { token: token || undefined })
        : Promise.resolve([]),
      api.get<any[]>(`/events/${eventId}/strategic-goals`, { token: token || undefined }),
      api.get<any[]>("/vendors", { token: token || undefined }),
    ]);

    const event = eventResult.status === "fulfilled" ? eventResult.value : null;
    if (!event) {
      throw new Response("Event not found", { status: 404 });
    }

    const users = usersResult.status === "fulfilled" ? (usersResult.value || []) : [];
    const strategicGoals = strategicGoalsResult.status === "fulfilled" ? (strategicGoalsResult.value || []) : [];
    const vendors = vendorsResult.status === "fulfilled" ? (vendorsResult.value || []) : [];

    return json({ event: { ...event, strategicGoals }, users, vendors, user });
  } catch (error: any) {
    console.error("Error loading event:", error);
    console.error("Event ID:", eventId);
    console.error("Error details:", error.message, error.statusCode);
    throw new Response(`Event not found: ${error.message || "Unknown error"}`, { status: error.statusCode || 404 });
  }
}

/**
 * Action - handle status update, file upload, assignment
 */
export async function action({ request, params }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, just return success
  if (isDemo) {
    return json({ success: true, message: "Demo mode: Changes are not saved" });
  }

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
      const vendorId = formData.get("vendorId") as string || undefined;
      const assignedUserId = formData.get("assignedUserId") as string || undefined;

      const payload: any = {
        category,
        description,
        estimatedCost,
        actualCost,
      };

      if (vendorId && vendorId.trim()) {
        payload.vendorId = vendorId.trim();
      }

      if (assignedUserId && assignedUserId.trim()) {
        payload.assignedUserId = assignedUserId.trim();
      }

      await api.post(`/events/${eventId}/budget-items`, payload, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "updateBudgetItem") {
      const budgetItemId = formData.get("budgetItemId") as string;
      const category = formData.get("category") as string;
      const description = formData.get("description") as string;
      const estimatedCost = formData.get("estimatedCost") ? parseFloat(formData.get("estimatedCost") as string) : null;
      const actualCost = formData.get("actualCost") ? parseFloat(formData.get("actualCost") as string) : null;
      const vendorId = formData.get("vendorId") as string || undefined;
      const assignedUserId = formData.get("assignedUserId") as string || undefined;

      const payload: any = {
        category,
        description,
        estimatedCost,
        actualCost,
      };

      if (vendorId !== null && vendorId !== undefined) {
        payload.vendorId = vendorId.trim() || null;
      }

      if (assignedUserId !== null && assignedUserId !== undefined) {
        payload.assignedUserId = assignedUserId.trim() || null;
      }

      await api.put(`/budget-items/${budgetItemId}`, payload, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "deleteBudgetItem") {
      const budgetItemId = formData.get("budgetItemId") as string;
      await api.delete(`/budget-items/${budgetItemId}`, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "createExpense") {
      const category = formData.get("category") as string;
      const title = formData.get("title") as string;
      const amountStr = formData.get("amount") as string;

      // Validate required fields
      if (!category) {
        return json({ error: "Category is required" }, { status: 400 });
      }
      if (!title || !title.trim()) {
        return json({ error: "Title is required" }, { status: 400 });
      }
      if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) < 0) {
        return json({ error: "Valid amount is required" }, { status: 400 });
      }

      const expenseData: any = {
        eventId: formData.get("eventId") as string || eventId,
        category: category,
        title: title.trim(),
        amount: parseFloat(amountStr),
      };

      const description = formData.get("description") as string;
      if (description && description.trim()) {
        expenseData.description = description.trim();
      }

      const vendorId = formData.get("vendorId") as string;
      if (vendorId && vendorId.trim()) {
        expenseData.vendorId = vendorId.trim();
      }

      // Create the expense first
      const newExpense = await api.post("/expenses", expenseData, tokenOption) as { id: string };

      // Upload file if provided
      const file = formData.get("file") as File | null;
      if (file && newExpense.id) {
        try {
          await api.upload(`/expenses/${newExpense.id}/files`, file, {}, tokenOption);
        } catch (fileError: any) {
          console.error("Error uploading expense file:", fileError);
          // Don't fail the entire request if file upload fails
        }
      }

      return redirect(`/events/${eventId}`);
    }

    if (intent === "approveExpense" || intent === "rejectExpense") {
      const expenseId = formData.get("expenseId") as string;
      const comments = formData.get("comments") as string || undefined;

      await api.post(`/expenses/${expenseId}/approve`, {
        action: intent === "approveExpense" ? "approve" : "reject",
        comments,
      }, tokenOption);

      return redirect(`/events/${eventId}`);
    }

    if (intent === "createStrategicGoal") {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const targetValue = formData.get("targetValue") ? parseFloat(formData.get("targetValue") as string) : undefined;
      const currentValue = formData.get("currentValue") ? parseFloat(formData.get("currentValue") as string) : undefined;
      const unit = formData.get("unit") as string || undefined;
      const deadline = formData.get("deadline") as string || undefined;
      const status = formData.get("status") as string || "not-started";
      const priority = formData.get("priority") as string || "medium";

      const payload: any = {
        title,
        description: description || undefined,
        targetValue,
        currentValue,
        unit,
        deadline: deadline || undefined,
        status,
        priority,
      };

      await api.post(`/events/${eventId}/strategic-goals`, payload, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "updateStrategicGoal") {
      const goalId = formData.get("goalId") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const targetValue = formData.get("targetValue") ? parseFloat(formData.get("targetValue") as string) : undefined;
      const currentValue = formData.get("currentValue") ? parseFloat(formData.get("currentValue") as string) : undefined;
      const unit = formData.get("unit") as string || undefined;
      const deadline = formData.get("deadline") as string || undefined;
      const status = formData.get("status") as string || "not-started";
      const priority = formData.get("priority") as string || "medium";

      const payload: any = {
        title,
        description: description || undefined,
        targetValue,
        currentValue,
        unit,
        deadline: deadline || undefined,
        status,
        priority,
      };

      await api.put(`/events/${eventId}/strategic-goals/${goalId}`, payload, tokenOption);
      return redirect(`/events/${eventId}`);
    }

    if (intent === "deleteStrategicGoal") {
      const goalId = formData.get("goalId") as string;
      await api.delete(`/events/${eventId}/strategic-goals/${goalId}`, tokenOption);
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
  const { event, users, vendors = [], user } = useLoaderData<typeof loader>();
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

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'unassign' | 'file' | 'budgetItem' | null;
    id: string | null;
  }>({
    isOpen: false,
    type: null,
    id: null,
  });

  const handleUnassignUser = (userId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'unassign', id: userId });
  };

  const handleDeleteFile = (fileId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'file', id: fileId });
  };

  const handleDeleteBudgetItem = (budgetItemId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'budgetItem', id: budgetItemId });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;

    const formData = new FormData();
    if (deleteConfirm.type === 'unassign') {
      formData.append("intent", "unassignUser");
      formData.append("userId", deleteConfirm.id);
    } else if (deleteConfirm.type === 'file') {
      formData.append("intent", "deleteFile");
      formData.append("fileId", deleteConfirm.id);
    } else if (deleteConfirm.type === 'budgetItem') {
      formData.append("intent", "deleteBudgetItem");
      formData.append("budgetItemId", deleteConfirm.id);
    }
    submit(formData, { method: "post" });
    toast.success(
      deleteConfirm.type === 'unassign' ? 'User removed successfully' :
        deleteConfirm.type === 'file' ? 'File deleted successfully' :
          'Budget item deleted successfully'
    );
    setDeleteConfirm({ isOpen: false, type: null, id: null });
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

      {actionData && 'error' in actionData && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {(actionData as { error: string }).error}
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
                <Dropdown
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={[
                    { value: 'Planning', label: 'Planning' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Cancelled', label: 'Cancelled' },
                  ]}
                  placeholder="Select status"
                />
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
              users={Array.isArray(users) ? users.filter((u): u is User => u !== null) : []}
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
          users={Array.isArray(users) ? users.filter((u): u is User => u !== null) : []}
          vendors={vendors || []}
          onClose={() => {
            setShowBudgetItemModal(false);
            setSelectedBudgetItem(null);
          }}
          onSubmit={() => {
            // Page will reload after redirect
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
        onConfirm={confirmDelete}
        title={
          deleteConfirm.type === 'unassign' ? 'Remove User' :
            deleteConfirm.type === 'file' ? 'Delete File' :
              'Delete Budget Item'
        }
        message={
          deleteConfirm.type === 'unassign' ? 'Are you sure you want to remove this user from the event?' :
            deleteConfirm.type === 'file' ? 'Are you sure you want to delete this file? This action cannot be undone.' :
              'Are you sure you want to delete this budget item? This action cannot be undone.'
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        variant="danger"
      />
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
        <Dropdown
          value={selectedUserId}
          onChange={setSelectedUserId}
          options={[
            { value: '', label: '-- Select a user --' },
            ...availableUsers.map((user) => ({
              value: user.id,
              label: user.name ? `${user.name} (${user.email})` : user.email,
            })),
          ]}
          placeholder="-- Select a user --"
        />
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
  users = [],
  vendors = [],
}: {
  eventId: string;
  item: EventDetail["budgetItems"][0] | null;
  onClose: () => void;
  onSubmit: () => void;
  users?: User[];
  vendors?: any[];
}) {
  const submit = useSubmit();
  const isEdit = !!item;
  const [category, setCategory] = useState(item?.category || "");
  const [vendorId, setVendorId] = useState(item?.vendorId || (item?.vendorLink?.id) || "");
  const [assignedUserId, setAssignedUserId] = useState(item?.assignedUserId || (item?.assignedUser?.id) || "");

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
              <input type="hidden" name="category" value={category} />
              <Dropdown
                value={category}
                onChange={setCategory}
                options={[
                  { value: '', label: 'Select category' },
                  { value: 'Venue', label: 'Venue' },
                  { value: 'Catering', label: 'Catering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Logistics', label: 'Logistics' },
                  { value: 'Entertainment', label: 'Entertainment' },
                  { value: 'StaffTravel', label: 'Staff Travel' },
                  { value: 'Miscellaneous', label: 'Miscellaneous' },
                ]}
                placeholder="Select category"
              />
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
              <input type="hidden" name="vendorId" value={vendorId} />
              <Dropdown
                value={vendorId}
                onChange={setVendorId}
                options={[
                  { value: '', label: 'No vendor selected' },
                  ...vendors.map((vendor) => ({
                    value: vendor.id,
                    label: `${vendor.name}${vendor.serviceType ? ` (${vendor.serviceType})` : ''}`,
                  })),
                ]}
                placeholder="No vendor selected"
              />
              {vendors.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No vendors available. <Link to="/vendors" className="text-blue-600 hover:underline">Add vendors</Link></p>
              )}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned User
              </label>
              <input type="hidden" name="assignedUserId" value={assignedUserId} />
              <Dropdown
                value={assignedUserId}
                onChange={setAssignedUserId}
                options={[
                  { value: '', label: 'No user assigned' },
                  ...users.map((user) => ({
                    value: user.id,
                    label: user.name || user.email,
                  })),
                ]}
                placeholder="No user assigned"
              />
              {users.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No users available. Only Admin can see users list.</p>
              )}
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


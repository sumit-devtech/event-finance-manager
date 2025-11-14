import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, useSubmit, useRevalidator, Link, useNavigate, useSearchParams, useFetcher } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { useState, useEffect, useRef, useCallback } from "react";

export interface Event {
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
  _count: {
    files: number;
    budgetItems: number;
    activityLogs: number;
  };
}

/**
 * Loader - fetch events with filters
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const client = url.searchParams.get("client") || undefined;
  const department = url.searchParams.get("department") || undefined;
  const startDateFrom = url.searchParams.get("startDateFrom") || undefined;
  const startDateTo = url.searchParams.get("startDateTo") || undefined;

  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (client) params.client = client;
  if (department) params.department = department;
  if (startDateFrom) params.startDateFrom = startDateFrom;
  if (startDateTo) params.startDateTo = startDateTo;

  try {
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
      params,
    });
    return json({ events: events || [], user });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    // Return empty array on error instead of failing
    return json({ events: [], user });
  }
}

/**
 * Action - handle event deletion and creation
 */
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const tokenOption = token ? { token } : {};

  try {
    if (intent === "delete") {
      const eventId = formData.get("eventId") as string;
      await api.delete(`/events/${eventId}`, tokenOption);
      return redirect("/events");
    }

    if (intent === "create") {
      // Check if user has permission to create events
      if (user.role !== "Admin" && user.role !== "EventManager") {
        return json({ success: false, error: "You don't have permission to create events" }, { status: 403 });
      }
      const name = formData.get("name") as string;
      if (!name) {
        return json({ success: false, error: "Event name is required" }, { status: 400 });
      }

      const eventData: any = { name };

      const description = formData.get("description") as string;
      if (description && description.trim()) {
        eventData.description = description.trim();
      }

      const client = formData.get("client") as string;
      if (client && client.trim()) {
        eventData.client = client.trim();
      }

      const startDate = formData.get("startDate") as string;
      if (startDate) {
        eventData.startDate = startDate;
      }

      const endDate = formData.get("endDate") as string;
      if (endDate) {
        eventData.endDate = endDate;
      }

      const status = formData.get("status") as string;
      if (status) {
        eventData.status = status;
      }

      const newEvent = await api.post("/events", eventData, tokenOption);
      return json({ success: true, message: "Event created successfully", event: newEvent });
    }

    if (intent === "update") {
      // Check if user has permission to update events
      if (user.role !== "Admin" && user.role !== "EventManager") {
        return json({ success: false, error: "You don't have permission to update events" }, { status: 403 });
      }
      const eventId = formData.get("eventId") as string;
      const eventData: any = {};
      
      if (formData.get("name")) eventData.name = formData.get("name");
      if (formData.get("description")) eventData.description = formData.get("description");
      if (formData.get("client")) eventData.client = formData.get("client");
      if (formData.get("startDate")) eventData.startDate = formData.get("startDate");
      if (formData.get("endDate")) eventData.endDate = formData.get("endDate");
      if (formData.get("status")) eventData.status = formData.get("status");

      const updatedEvent = await api.put(`/events/${eventId}`, eventData, tokenOption);
      return json({ success: true, message: "Event updated successfully", event: updatedEvent });
    }

    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return json({ success: false, error: error.message || "An error occurred" }, { status: 400 });
  }
}

export default function EventsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const events = loaderData?.events || [];
  const user = loaderData?.user;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const canCreateEvents = user?.role === "Admin" || user?.role === "EventManager";

  // Initialize filters from URL params
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [clientFilter, setClientFilter] = useState(searchParams.get("client") || "");
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get("department") || "");
  const [startDateFrom, setStartDateFrom] = useState(searchParams.get("startDateFrom") || "");
  const [startDateTo, setStartDateTo] = useState(searchParams.get("startDateTo") || "");

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const isLoading = navigation.state === "submitting" || navigation.state === "loading";

  // Reload data after successful actions
  useEffect(() => {
    if (actionData?.success) {
      if ("message" in actionData && actionData.message) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedEvent(null);
        const timer = setTimeout(() => {
          revalidator.revalidate();
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        revalidator.revalidate();
      }
    }
  }, [actionData, revalidator]);

  // Apply filters
  const handleFilter = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (clientFilter) params.set("client", clientFilter);
    if (departmentFilter) params.set("department", departmentFilter);
    if (startDateFrom) params.set("startDateFrom", startDateFrom);
    if (startDateTo) params.set("startDateTo", startDateTo);
    
    const search = params.toString();
    navigate(`/events${search ? `?${search}` : ""}`);
  }, [statusFilter, clientFilter, departmentFilter, startDateFrom, startDateTo, navigate]);

  // Clear filters
  const handleClearFilters = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStatusFilter("");
    setClientFilter("");
    setDepartmentFilter("");
    setStartDateFrom("");
    setStartDateTo("");
    navigate("/events");
  };

  const handleDelete = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("eventId", eventId);
      submit(formData, { method: "post" });
    }
  };

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

  // Pagination
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = events.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
        {canCreateEvents && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </button>
        )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                placeholder="Search by client..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                placeholder="Search by department..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date From
            </label>
            <input
              type="date"
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date To
            </label>
            <input
              type="date"
              value={startDateTo}
              onChange={(e) => setStartDateTo(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFilter(e);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filters
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearFilters(e);
            }}
            className="w-full sm:w-auto px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : !events || events.length === 0 ? (
            <div className="text-center py-12 px-4">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mb-4 text-lg">No events found matching your criteria.</p>
            {canCreateEvents ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateModal(true);
                }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors font-medium"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                Create Your First Event
              </button>
            ) : (
              <p className="text-sm text-gray-400">You don't have permission to create events.</p>
            )}
          </div>
        ) : (
          <>
                {/* Mobile Card View */}
                <div className="block lg:hidden">
                  <div className="space-y-4 p-4">
                    {paginatedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0 pr-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedEventId(event.id);
                                setShowDetailModal(true);
                              }}
                              className="text-lg font-bold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors block w-full text-left line-clamp-2"
                            >
                              {event.name}
                            </button>
                            {event.client && (
                              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="truncate">{event.client}</span>
                              </p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>

                        {/* Card Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-500 mt-1">Date</span>
                            <span className="text-xs font-semibold text-gray-900 mt-0.5 text-center">
                              {event.startDate ? new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                            </span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="text-xs text-gray-500 mt-1">Users</span>
                            <span className="text-xs font-semibold text-gray-900 mt-0.5">{event.assignments.length}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-gray-500 mt-1">Files</span>
                            <span className="text-xs font-semibold text-gray-900 mt-0.5">{event._count.files}</span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedEventId(event.id);
                              setShowDetailModal(true);
                            }}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          {canCreateEvents && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                  setShowEditModal(true);
                                }}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
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
                                  handleDelete(event.id);
                                }}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </>
                          )}
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
                          Event Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Files
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedEventId(event.id);
                                setShowDetailModal(true);
                              }}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer transition-colors"
                            >
                              {event.name}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.client || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.startDate ? new Date(event.startDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.assignments.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event._count.files}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedEventId(event.id);
                                  setShowDetailModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 cursor-pointer transition-colors"
                              >
                                View
                              </button>
                              {canCreateEvents && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedEvent(event);
                                    setShowEditModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 cursor-pointer transition-colors"
                                >
                                  Edit
                                </button>
                              )}
                              {canCreateEvents && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(event.id);
                                  }}
                                  className="text-red-600 hover:text-red-900 cursor-pointer transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

            {/* Pagination */}
            {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 sm:px-6">
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, events.length)}</span> of{" "}
                  <span className="font-medium">{events.length}</span> events
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
          </>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          isLoading={isLoading}
        />
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Event Detail Modal */}
      {showDetailModal && selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          user={user}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEventId(null);
          }}
          onRefresh={() => revalidator.revalidate()}
        />
      )}
    </div>
  );
}

// Create Event Modal Component
function CreateEventModal({
  onClose,
  isLoading,
}: {
  onClose: () => void;
  isLoading: boolean;
}) {
  const submit = useSubmit();

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
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-auto relative z-[101] max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Event</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Fill in the details to create a new event</p>
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
              formData.append("intent", "create");
              submit(formData, { method: "post" });
            }}
          >
            <div className="space-y-5">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter event name..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Enter event description..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client / Department
                </label>
                <input
                  type="text"
                  name="client"
                  placeholder="Enter client or department name..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue="Planning"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
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
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
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

// Edit Event Modal Component
function EditEventModal({
  event,
  onClose,
  onSuccess,
  isLoading,
}: {
  event: Event;
  onClose: () => void;
  onSuccess?: () => void;
  isLoading: boolean;
}) {
  const submit = useSubmit();

  // Format dates for input fields
  const startDate = event.startDate ? new Date(event.startDate).toISOString().split("T")[0] : "";
  const endDate = event.endDate ? new Date(event.endDate).toISOString().split("T")[0] : "";

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
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-auto relative z-[101] max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Event</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{event.name}</p>
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
              formData.append("intent", "update");
              formData.append("eventId", event.id);
              submit(formData, { method: "post" });
              if (onSuccess) {
                setTimeout(() => {
                  onSuccess();
                }, 500);
              }
            }}
          >
            <div className="space-y-5">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={event.name}
                  placeholder="Enter event name..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={event.description || ""}
                  placeholder="Enter event description..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client / Department
                </label>
                <input
                  type="text"
                  name="client"
                  defaultValue={event.client || ""}
                  placeholder="Enter client or department name..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={startDate}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={endDate}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={event.status}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
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

// Event Detail Modal Component
function EventDetailModal({
  eventId,
  user,
  onClose,
  onRefresh,
}: {
  eventId: string;
    user: { role: string } | undefined;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const fetcher = useFetcher<typeof import("./_protected.events.$id").loader>();
  const submit = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBudgetItemModal, setShowBudgetItemModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<any>(null);

  const canManageBudget = user?.role === "Admin" || user?.role === "EventManager" || user?.role === "Finance";
  const canAssignUsers = user?.role === "Admin" || user?.role === "EventManager";
  const canUploadFiles = user?.role === "Admin" || user?.role === "EventManager" || user?.role === "Finance";

  // Load event data when modal opens
  useEffect(() => {
    if (eventId) {
      fetcher.load(`/events/${eventId}`);
    }
  }, [eventId]);

  const event = fetcher.data?.event;
  const users = fetcher.data?.users || [];
  const isLoading = fetcher.state === "loading" || fetcher.state === "submitting";

  useEffect(() => {
    if (event?.status) {
      setSelectedStatus(event.status);
    }
  }, [event?.status]);

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
    submit(formData, {
      method: "post",
      action: `/events/${eventId}`,
    });
    setShowStatusModal(false);
    setTimeout(() => {
      fetcher.load(`/events/${eventId}`);
      onRefresh();
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("intent", "uploadFile");
      formData.append("file", file);
      submit(formData, {
        method: "post",
        action: `/events/${eventId}`,
        encType: "multipart/form-data",
      });
      setTimeout(() => {
        fetcher.load(`/events/${eventId}`);
        onRefresh();
      }, 500);
    }
  };

  const handleAssignUser = (userId: string, role: string) => {
    const formData = new FormData();
    formData.append("intent", "assignUser");
    formData.append("userId", userId);
    formData.append("role", role);
    submit(formData, {
      method: "post",
      action: `/events/${eventId}`,
    });
    setShowAssignModal(false);
    setTimeout(() => {
      fetcher.load(`/events/${eventId}`);
      onRefresh();
    }, 500);
  };

  const handleUnassignUser = (userId: string) => {
    if (confirm("Are you sure you want to remove this user from the event?")) {
      const formData = new FormData();
      formData.append("intent", "unassignUser");
      formData.append("userId", userId);
      submit(formData, {
        method: "post",
        action: `/events/${eventId}`,
      });
      setTimeout(() => {
        fetcher.load(`/events/${eventId}`);
        onRefresh();
      }, 500);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      const formData = new FormData();
      formData.append("intent", "deleteFile");
      formData.append("fileId", fileId);
      submit(formData, {
        method: "post",
        action: `/events/${eventId}`,
      });
      setTimeout(() => {
        fetcher.load(`/events/${eventId}`);
        onRefresh();
      }, 500);
    }
  };

  const handleDeleteBudgetItem = (budgetItemId: string) => {
    if (confirm("Are you sure you want to delete this budget item?")) {
      const formData = new FormData();
      formData.append("intent", "deleteBudgetItem");
      formData.append("budgetItemId", budgetItemId);
      submit(formData, {
        method: "post",
        action: `/events/${eventId}`,
      });
      setTimeout(() => {
        fetcher.load(`/events/${eventId}`);
        onRefresh();
      }, 500);
    }
  };

  const handleEditBudgetItem = (item: any) => {
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

  if (!event) {
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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-auto relative z-[101] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-16">
            {isLoading ? (
              <>
                <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 text-lg">Loading event details...</p>
              </>
            ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-lg font-medium">Failed to load event details</p>
                </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] overflow-y-auto p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-auto relative z-[101] max-h-[90vh] overflow-y-auto my-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{event.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStatusModal(true);
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(event.status)}`}
                  title="Click to update status"
                >
                  {event.status}
                </button>
                {event.client && (
                  <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {event.client}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Link
              to={`/events/${event.id}`}
              className="hidden sm:inline-flex items-center px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Full
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Event Details */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Event Details
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Event Name</dt>
                    <dd className="mt-1 text-sm sm:text-base text-gray-900 font-semibold">{event.name}</dd>
                  </div>
                  {event.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Description</dt>
                      <dd className="mt-1 text-sm sm:text-base text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg">{event.description}</dd>
                    </div>
                  )}
                  {event.client && (
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Client</dt>
                      <dd className="mt-1 text-sm sm:text-base text-gray-900">{event.client}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Status</dt>
                    <dd className="mt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowStatusModal(true);
                        }}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(event.status)}`}
                        title="Click to update status"
                      >
                        {event.status}
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Start Date</dt>
                    <dd className="mt-1 text-sm sm:text-base text-gray-900">
                      {event.startDate ? new Date(event.startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">End Date</dt>
                    <dd className="mt-1 text-sm sm:text-base text-gray-900">
                      {event.endDate ? new Date(event.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Assigned Users */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Assigned Users
                  </h3>
                  {canAssignUsers && (
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(true)}
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign User
                    </button>
                  )}
                </div>
                {event.assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-sm text-gray-500">No users assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {event.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {assignment.user.name || assignment.user.email}
                          </div>
                          {assignment.role && (
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">{assignment.role}</div>
                          )}
                        </div>
                        {canAssignUsers && (
                          <button
                            type="button"
                            onClick={() => handleUnassignUser(assignment.user.id)}
                            className="ml-3 text-sm text-red-600 hover:text-red-900 font-medium transition-colors"
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
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Files
                  </h3>
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
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload File
                      </button>
                    </div>
                  )}
                </div>
                {event.files.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No files uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {event.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{file.filename}</div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        {canUploadFiles && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="ml-3 text-sm text-red-600 hover:text-red-900 font-medium transition-colors"
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
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Quick Stats
                </h3>
                <dl className="space-y-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                    <dt className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Assigned Users</dt>
                    <dd className="text-2xl sm:text-3xl font-bold text-indigo-900 mt-1">{event.assignments.length}</dd>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <dt className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Budget Items</dt>
                    <dd className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">{event._count.budgetItems}</dd>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <dt className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Files</dt>
                    <dd className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{event._count.files}</dd>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <dt className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Activity Logs</dt>
                    <dd className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1">{event._count.activityLogs}</dd>
                  </div>
                </dl>
              </div>

              {/* Budget Items */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Budget Items
                    </h3>
                    <Link
                      to={`/events/${event.id}/budget`}
                      className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                    >
                      View Full →
                    </Link>
                  </div>
                  {canManageBudget && (
                    <button
                      type="button"
                      onClick={handleAddBudgetItem}
                      className="inline-flex items-center text-xs sm:text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  )}
                </div>
                {event.budgetItems.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-500">No budget items added</p>
                    {canManageBudget && (
                      <Link
                        to={`/events/${event.id}/budget`}
                        className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Go to Budget Page →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                      {event.budgetItems.slice(0, 5).map((item) => {
                        const cost = item.actualCost ?? item.estimatedCost ?? 0;
                        return (
                          <div key={item.id} className="flex justify-between items-start p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{item.category}</div>
                              {item.description && (
                                <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{item.description}</div>
                              )}
                              {item.vendor && (
                                <div className="text-xs text-gray-500 mt-1">Vendor: {item.vendor}</div>
                              )}
                              {item.estimatedCost && item.actualCost && (
                                <div className="text-xs mt-1 flex flex-wrap gap-2">
                                  <span className="text-gray-600">Est: <span className="font-medium">${item.estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                                  <span className="text-gray-700">Actual: <span className="font-medium">${item.actualCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                              <div className="text-sm sm:text-base font-semibold text-gray-900">
                                ${Number(cost).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              {canManageBudget && (
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditBudgetItem(item)}
                                    className="text-xs text-blue-600 hover:text-blue-900 font-medium transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBudgetItem(item.id)}
                                    className="text-xs text-red-600 hover:text-red-900 font-medium transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {event.budgetItems.length > 5 && (
                        <Link
                          to={`/events/${event.id}/budget`}
                          className="block text-center text-sm text-indigo-600 hover:text-indigo-900 font-medium py-2 border-t border-gray-200"
                        >
                          View all {event.budgetItems.length} budget items →
                        </Link>
                      )}
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
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowStatusModal(false);
              }
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto relative z-[201]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowStatusModal(false)}
                      className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleStatusUpdate}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign User Modal */}
        {showAssignModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAssignModal(false);
              }
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto relative z-[201]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Assign User</h2>
                </div>
                <AssignUserForm
                  users={users}
                  assignedUserIds={event.assignments.map((a) => a.user.id)}
                  onAssign={handleAssignUser}
                  onCancel={() => setShowAssignModal(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Budget Item Modal */}
        {showBudgetItemModal && (
          <BudgetItemModal
            eventId={eventId}
            item={selectedBudgetItem}
            onClose={() => {
              setShowBudgetItemModal(false);
              setSelectedBudgetItem(null);
            }}
            onSuccess={() => {
              setTimeout(() => {
                fetcher.load(`/events/${eventId}`);
                onRefresh();
              }, 500);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Assign User Form Component
function AssignUserForm({
  users,
  assignedUserIds,
  onAssign,
  onCancel,
}: {
  users: Array<{ id: string; email: string; name: string | null; role: string }>;
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User <span className="text-red-500">*</span>
        </label>
        {availableUsers.length === 0 ? (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              All users are already assigned to this event
            </p>
          </div>
        ) : (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
            >
              <option value="">-- Select a user --</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name ? `${user.name} (${user.email})` : user.email} {user.role ? `- ${user.role}` : ""}
                </option>
              ))}
            </select>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role <span className="text-xs text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Manager, Coordinator, Lead..."
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500">Specify the role this user will have for this event</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedUserId || availableUsers.length === 0}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Assign User
        </button>
      </div>
    </form>
  );
}

// Budget Item Modal Component
function BudgetItemModal({
  eventId,
  item,
  onClose,
  onSuccess,
}: {
  eventId: string;
  item: any;
  onClose: () => void;
  onSuccess: () => void;
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
    submit(formData, {
      method: "post",
      action: `/events/${eventId}`,
    });
    onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto relative z-[201] max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{isEdit ? "Edit Budget Item" : "Add Budget Item"}</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{isEdit ? "Update budget item details" : "Create a new budget item for this event"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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
          <Form method="post" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  required
                  defaultValue={item?.category || ""}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={item?.description || ""}
                  placeholder="Enter item description..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  name="vendor"
                  defaultValue={item?.vendor || ""}
                  placeholder="Enter vendor name..."
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Cost Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Cost <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="estimatedCost"
                      step="0.01"
                      min="0"
                      defaultValue={item?.estimatedCost || ""}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Cost <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="actualCost"
                      step="0.01"
                      min="0"
                      defaultValue={item?.actualCost || ""}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
              >
                {isEdit ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Item
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Item
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

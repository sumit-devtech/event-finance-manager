import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, useSubmit, useRevalidator, Link, useNavigate, useSearchParams, useFetcher } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { useState, useEffect, useRef } from "react";

interface Event {
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
  const handleFilter = (e?: React.MouseEvent) => {
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
  };

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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        {canCreateEvents && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
          >
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
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            <input
              type="text"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              placeholder="Search by client..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              placeholder="Search by department..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date From
            </label>
            <input
              type="date"
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFilter(e);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearFilters(e);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No events found matching your criteria.</p>
            {canCreateEvents ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateModal(true);
                }}
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
              >
                Create Your First Event
              </button>
            ) : (
              <p className="text-sm text-gray-400">You don't have permission to create events.</p>
            )}
          </div>
        ) : (
          <>
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
                  <tr key={event.id} className="hover:bg-gray-50">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, events.length)}</span> of{" "}
                  <span className="font-medium">{events.length}</span> events
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPage(page);
                        }}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-colors ${
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
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative z-[101] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                name="client"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue="Planning"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </Form>
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative z-[101] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Edit Event</h2>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={event.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={event.description || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                name="client"
                defaultValue={event.client || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={endDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={event.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isLoading ? "Updating..." : "Update Event"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

// Event Detail Modal Component
function EventDetailModal({
  eventId,
  onClose,
  onRefresh,
}: {
  eventId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const fetcher = useFetcher<typeof import("./_protected.events.$id").loader>();
  const submit = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative z-[101] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-12">
            {isLoading ? (
              <p className="text-gray-600">Loading event details...</p>
            ) : (
              <p className="text-red-600">Failed to load event details</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] overflow-y-auto p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-6xl w-full relative z-[101] max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
            <div className="mt-2 flex items-center space-x-4">
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
              {event.client && (
                <span className="text-sm text-gray-600">Client: {event.client}</span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
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
              </dl>
            </div>

            {/* Assigned Users */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Users</h3>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-900 cursor-pointer"
                >
                  + Assign User
                </button>
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
                      <button
                        type="button"
                        onClick={() => handleUnassignUser(assignment.user.id)}
                        className="text-sm text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Files */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Files</h3>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-sm text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
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
            {event.budgetItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Items</h3>
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
                        </div>
                        <div className="text-sm font-semibold text-gray-900 ml-4">
                          ${Number(cost).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              </div>
            )}
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowStatusModal(false);
              }
            }}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[201]"
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAssignModal(false);
              }
            }}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[201]"
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
              {user.name || user.email} ({user.role})
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

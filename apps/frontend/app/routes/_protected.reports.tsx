import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, Link, useSubmit, useNavigation } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { env } from "~/lib/env";
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface Event {
  id: string;
  name: string;
  client: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

interface LoaderData {
  events: Event[];
  user: {
    role: string;
  };
}

interface ActionData {
  error?: string;
  success?: boolean;
}

/**
 * Loader - fetch events for reports dashboard
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const client = url.searchParams.get("client") || undefined;
  const startDateFrom = url.searchParams.get("startDateFrom") || undefined;
  const startDateTo = url.searchParams.get("startDateTo") || undefined;

  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (client) params.client = client;
  if (startDateFrom) params.startDateFrom = startDateFrom;
  if (startDateTo) params.startDateTo = startDateTo;

  try {
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
      params,
    });
    return json<LoaderData>({ events: events || [], user });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return json<LoaderData>({ events: [], user });
  }
}

/**
 * Action - handle report exports
 * Note: Export downloads are handled client-side due to file download requirements
 */
export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);
  
  // Export is handled client-side, this action just validates authentication
  return json<ActionData>({ success: true });
}

export default function ReportsPage() {
  const { events, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [reportType, setReportType] = useState<"summary" | "comparison">("summary");

  // Get auth token from localStorage for client-side export
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  // Prepare chart data from events
  const statusData = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    if (reportType === "summary" && !selectedEventId) {
      alert("Please select an event for the summary report");
      return;
    }
    if (reportType === "comparison" && selectedEventIds.length < 2) {
      alert("Please select at least 2 events for the comparison report");
      return;
    }

    try {
      // Build export URL with query parameters
      const params = new URLSearchParams({ type: reportType });
      if (reportType === "summary") {
        params.append("eventId", selectedEventId);
      } else {
        params.append("eventIds", selectedEventIds.join(","));
      }

      const apiBaseUrl = env.API_BASE_URL;
      const exportUrl = `${apiBaseUrl}/reports/export/${format}?${params.toString()}`;
      const token = getAuthToken();

      // Fetch the file with authentication
      const response = await fetch(exportUrl, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${reportType}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  const toggleEventSelection = (eventId: string) => {
    if (selectedEventIds.includes(eventId)) {
      setSelectedEventIds(selectedEventIds.filter((id) => id !== eventId));
    } else {
      setSelectedEventIds([...selectedEventIds, eventId]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">
          View comprehensive reports and analytics for your events
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <Form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <input
              type="text"
              name="client"
              placeholder="Filter by client..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date From</label>
            <input
              type="date"
              name="startDateFrom"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date To</label>
            <input
              type="date"
              name="startDateTo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
            <Link
              to="/reports"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </Link>
          </div>
        </Form>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Events by Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Events by Status</h2>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Events Timeline Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Events Timeline</h2>
          {events.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={events.slice(0, 10).map((e) => ({ name: e.name, count: 1 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Report Generation Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h2>

        {/* Report Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="reportType"
                value="summary"
                checked={reportType === "summary"}
                onChange={(e) => setReportType(e.target.value as "summary" | "comparison")}
                className="mr-2"
              />
              Event Summary Report
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="reportType"
                value="comparison"
                checked={reportType === "comparison"}
                onChange={(e) => setReportType(e.target.value as "summary" | "comparison")}
                className="mr-2"
              />
              Comparison Report
            </label>
          </div>
        </div>

        {/* Event Selection */}
        {reportType === "summary" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event for Summary Report
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select an event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.status})
                </option>
              ))}
            </select>
            {selectedEventId && (
              <Link
                to={`/reports/event-summary/${selectedEventId}`}
                className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-900"
              >
                View Detailed Summary →
              </Link>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Events for Comparison (Select at least 2)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {events.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No events available</p>
              ) : (
                events.map((event) => (
                  <label key={event.id} className="flex items-center p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedEventIds.includes(event.id)}
                      onChange={() => toggleEventSelection(event.id)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {event.name} ({event.status}) - {event.client || "No client"}
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedEventIds.length >= 2 && (
              <Link
                to={`/reports/comparison?eventIds=${selectedEventIds.join(",")}`}
                className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-900"
              >
                View Detailed Comparison →
              </Link>
            )}
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={
              isSubmitting ||
              (reportType === "summary" && !selectedEventId) ||
              (reportType === "comparison" && selectedEventIds.length < 2)
            }
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={
              isSubmitting ||
              (reportType === "summary" && !selectedEventId) ||
              (reportType === "comparison" && selectedEventIds.length < 2)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={
              isSubmitting ||
              (reportType === "summary" && !selectedEventId) ||
              (reportType === "comparison" && selectedEventIds.length < 2)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Events</div>
          <div className="text-2xl font-bold text-gray-900">{events.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Active Events</div>
          <div className="text-2xl font-bold text-green-600">
            {events.filter((e) => e.status === "Active").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Completed Events</div>
          <div className="text-2xl font-bold text-blue-600">
            {events.filter((e) => e.status === "Completed").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Planning Events</div>
          <div className="text-2xl font-bold text-yellow-600">
            {events.filter((e) => e.status === "Planning").length}
          </div>
        </div>
      </div>
    </div>
  );
}

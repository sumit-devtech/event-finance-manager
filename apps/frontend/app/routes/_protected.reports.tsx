import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, Link, useSubmit, useNavigation, Outlet, useLocation } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { env } from "~/lib/env";
import { useState, useEffect } from "react";
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
  const location = useLocation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [reportType, setReportType] = useState<"summary" | "comparison">("summary");
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a child route (like /reports/comparison)
  const isChildRoute = location.pathname !== "/reports";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // If we're on a child route, render the outlet
  if (isChildRoute) {
    return <Outlet />;
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-sm sm:text-base text-gray-600">
          View comprehensive reports and analytics for your events
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <Form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Apply Filters
            </button>
            <Link
              to="/reports"
              className="flex-1 sm:flex-none px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-center"
            >
              Clear Filters
            </Link>
          </div>
        </Form>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Events by Status Pie Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Events by Status</h2>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={isMobile ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Events Overview Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Events Overview</h2>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">No events data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Generation Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Generate Reports</h2>

        {/* Report Type Selection */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <label className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
              style={{ borderColor: reportType === "summary" ? "#4f46e5" : "#e5e7eb" }}
            >
              <input
                type="radio"
                name="reportType"
                value="summary"
                checked={reportType === "summary"}
                onChange={(e) => setReportType(e.target.value as "summary" | "comparison")}
                className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-gray-900">Event Summary Report</span>
            </label>
            <label className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
              style={{ borderColor: reportType === "comparison" ? "#4f46e5" : "#e5e7eb" }}
            >
              <input
                type="radio"
                name="reportType"
                value="comparison"
                checked={reportType === "comparison"}
                onChange={(e) => setReportType(e.target.value as "summary" | "comparison")}
                className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-gray-900">Comparison Report</span>
            </label>
          </div>
        </div>

        {/* Event Selection */}
        {reportType === "summary" ? (
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event for Summary Report
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900"
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
                className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
              >
                View Detailed Summary
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Events for Comparison <span className="text-gray-500">(Select at least 2)</span>
            </label>
            <div className="max-h-48 sm:max-h-64 overflow-y-auto border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
              {events.length === 0 ? (
                <p className="text-sm text-gray-500 p-3 text-center">No events available</p>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <label 
                      key={event.id} 
                      className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedEventIds.includes(event.id)
                          ? "bg-indigo-50 border-indigo-300"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEventIds.includes(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                        className="mt-0.5 mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 block truncate">
                          {event.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {event.status} {event.client && `• ${event.client}`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedEventIds.length >= 2 && (
              <Link
                to={`/reports/comparison?eventIds=${selectedEventIds.join(",")}`}
                className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
              >
                View Detailed Comparison
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            {selectedEventIds.length > 0 && selectedEventIds.length < 2 && (
              <p className="mt-2 text-sm text-amber-600">
                Please select at least 2 events for comparison
              </p>
            )}
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={
              isSubmitting ||
              (reportType === "summary" && !selectedEventId) ||
              (reportType === "comparison" && selectedEventIds.length < 2)
            }
            className="flex-1 sm:flex-none px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
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
            className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
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
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Total Events</div>
          <div className="text-2xl sm:text-3xl font-bold">{events.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Active Events</div>
          <div className="text-2xl sm:text-3xl font-bold">
            {events.filter((e) => e.status === "Active").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Completed Events</div>
          <div className="text-2xl sm:text-3xl font-bold">
            {events.filter((e) => e.status === "Completed").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Planning Events</div>
          <div className="text-2xl sm:text-3xl font-bold">
            {events.filter((e) => e.status === "Planning").length}
          </div>
        </div>
      </div>
    </div>
  );
}

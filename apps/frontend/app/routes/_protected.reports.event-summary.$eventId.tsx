import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSubmit, useNavigation } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { env } from "~/lib/env";
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
} from "recharts";

interface EventSummary {
  event: {
    id: string;
    name: string;
    description: string | null;
    client: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
  };
  budget: {
    totalsByCategory: Record<string, { estimated: number; actual: number; variance: number }>;
    summary: {
      totalEstimated: number;
      totalActual: number;
      variance: number;
      variancePercentage: number;
      isOverBudget: boolean;
    };
    costPerAttendee: number;
    attendeeCount: number;
  };
  assignments: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    role: string | null;
    assignedAt: string;
  }>;
  generatedAt: string;
}

interface LoaderData {
  summary: EventSummary;
}

interface ActionData {
  error?: string;
  success?: boolean;
}

/**
 * Loader - fetch event summary report
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  if (!token) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = params.eventId;
  if (!eventId) {
    throw json({ error: "Event ID is required" }, { status: 400 });
  }

  try {
    const summary = await api.get<EventSummary>(`/reports/event-summary/${eventId}`, { token });
    return json<LoaderData>({ summary });
  } catch (error: any) {
    console.error("Failed to fetch event summary:", error);
    if (error.statusCode === 404) {
      throw json({ error: "Event not found" }, { status: 404 });
    }
    throw json({ error: "Failed to load event summary" }, { status: 500 });
  }
}

/**
 * Action - handle report export
 */
export async function action({ request, params }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  if (!token) {
    return json<ActionData>({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = params.eventId;
  const formData = await request.formData();
  const format = formData.get("format") as string;

  try {
    // Redirect to export endpoint
    const exportUrl = `/reports/export/${format}?type=summary&eventId=${eventId}`;
    return json<ActionData>({ success: true, exportUrl } as any);
  } catch (error: any) {
    return json<ActionData>({ error: error.message || "Export failed" }, { status: 500 });
  }
}

export default function EventSummaryReportPage() {
  const { summary } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0", "#ffc0cb"];

  // Prepare chart data
  const categoryData = Object.entries(summary.budget.totalsByCategory).map(([name, data]) => ({
    name,
    estimated: data.estimated,
    actual: data.actual,
    variance: data.variance,
  }));

  const pieData = Object.entries(summary.budget.totalsByCategory).map(([name, data]) => ({
    name,
    value: data.actual || data.estimated,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      const apiBaseUrl = env.API_BASE_URL;
      const exportUrl = `${apiBaseUrl}/reports/export/${format}?type=summary&eventId=${summary.event.id}`;
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

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
      link.download = `event-summary-${summary.event.id}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/reports"
          className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
        >
          ← Back to Reports
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Event Summary Report</h1>
        <p className="text-sm text-gray-600 mt-1">{summary.event.name}</p>
      </div>

      {/* Event Details */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Event Name:</span>
            <span className="ml-2 font-medium">{summary.event.name}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Client:</span>
            <span className="ml-2 font-medium">{summary.event.client || "N/A"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Status:</span>
            <span className="ml-2 font-medium">{summary.event.status}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Start Date:</span>
            <span className="ml-2 font-medium">
              {summary.event.startDate
                ? new Date(summary.event.startDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">End Date:</span>
            <span className="ml-2 font-medium">
              {summary.event.endDate
                ? new Date(summary.event.endDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Generated At:</span>
            <span className="ml-2 font-medium">
              {new Date(summary.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>
        {summary.event.description && (
          <div className="mt-4">
            <span className="text-sm text-gray-600">Description:</span>
            <p className="mt-1 text-gray-900">{summary.event.description}</p>
          </div>
        )}
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Estimated</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.budget.summary.totalEstimated)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Actual</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.budget.summary.totalActual)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Variance</div>
          <div
            className={`text-2xl font-bold ${
              summary.budget.summary.variance > 0
                ? "text-red-600"
                : summary.budget.summary.variance < 0
                  ? "text-green-600"
                  : "text-gray-600"
            }`}
          >
            {formatCurrency(summary.budget.summary.variance)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.budget.summary.variancePercentage > 0 ? "+" : ""}
            {summary.budget.summary.variancePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Cost per Attendee</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.budget.costPerAttendee)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.budget.attendeeCount} attendee{summary.budget.attendeeCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Over Budget Alert */}
      {summary.budget.summary.isOverBudget && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Over Budget: Actual costs exceed estimated budget by{" "}
                {formatCurrency(Math.abs(summary.budget.summary.variance))} (
                {Math.abs(summary.budget.summary.variancePercentage).toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Budget Breakdown by Category (Pie Chart) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Breakdown by Category
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No budget data available
            </div>
          )}
        </div>

        {/* Estimated vs Actual by Category (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estimated vs Actual by Category
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="estimated" fill="#8884d8" name="Estimated" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No budget data available
            </div>
          )}
        </div>
      </div>

      {/* Budget Details Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Details by Category</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((item) => (
                <tr key={item.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.estimated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.actual)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      item.variance > 0
                        ? "text-red-600 font-semibold"
                        : item.variance < 0
                          ? "text-green-600 font-semibold"
                          : "text-gray-600"
                    }`}
                  >
                    {formatCurrency(item.variance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignments */}
      {summary.assignments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Assignments</h2>
          <div className="space-y-2">
            {summary.assignments.map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">
                    {assignment.user.name || assignment.user.email}
                  </div>
                  {assignment.role && (
                    <div className="text-sm text-gray-500">Role: {assignment.role}</div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}


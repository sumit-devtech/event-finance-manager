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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Export failed:", errorMessage);
      toast.error("Failed to export report. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          to="/reports"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-4 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Reports
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Event Summary Report</h1>
        <p className="text-sm sm:text-base text-gray-600">{summary.event.name}</p>
      </div>

      {/* Event Details */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Event Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Event Name</span>
            <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">{summary.event.name}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Client</span>
            <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">{summary.event.client || "N/A"}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Status</span>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${
                summary.event.status === "Completed"
                  ? "bg-blue-100 text-blue-800"
                  : summary.event.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : summary.event.status === "Planning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
              }`}>
                {summary.event.status}
              </span>
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Start Date</span>
            <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">
              {summary.event.startDate
                ? new Date(summary.event.startDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">End Date</span>
            <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">
              {summary.event.endDate
                ? new Date(summary.event.endDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Generated At</span>
            <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">
              {new Date(summary.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        {summary.event.description && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Description</span>
            <p className="mt-2 text-sm sm:text-base text-gray-900">{summary.event.description}</p>
          </div>
        )}
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Total Estimated</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(summary.budget.summary.totalEstimated)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Total Actual</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(summary.budget.summary.totalActual)}
          </div>
        </div>
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg text-white ${
          summary.budget.summary.variance > 0
            ? "bg-gradient-to-br from-red-500 to-red-600"
            : summary.budget.summary.variance < 0
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : "bg-gradient-to-br from-gray-500 to-gray-600"
        }`}>
          <div className="text-xs sm:text-sm opacity-90 mb-1">Variance</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(summary.budget.summary.variance)}
          </div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">
            {summary.budget.summary.variancePercentage > 0 ? "+" : ""}
            {summary.budget.summary.variancePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Cost per Attendee</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(summary.budget.costPerAttendee)}
          </div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Budget Breakdown by Category (Pie Chart) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Budget Breakdown by Category
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
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
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">No budget data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Estimated vs Actual by Category (Bar Chart) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Estimated vs Actual by Category
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="estimated" fill="#8884d8" name="Estimated" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">No budget data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget Details Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Budget Details by Category</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.estimated)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.actual)}
                    </td>
                    <td
                      className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        item.variance > 0
                          ? "text-red-600"
                          : item.variance < 0
                            ? "text-green-600"
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
      </div>

      {/* Assignments */}
      {summary.assignments.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Team Assignments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.assignments.map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {assignment.user.name || assignment.user.email}
                  </div>
                  {assignment.role && (
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Role: {assignment.role}</div>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 ml-3 whitespace-nowrap">
                  {new Date(assignment.assignedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Export Report</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}


import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams, useSubmit, useNavigation } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { env } from "~/lib/env";
import {
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

interface ComparisonEvent {
  event: {
    id: string;
    name: string;
    client: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
  };
  budget: {
    totalsByCategory: Record<string, { estimated: number; actual: number }>;
    totalEstimated: number;
    totalActual: number;
    variance: number;
    variancePercentage: number;
    costPerAttendee: number;
    attendeeCount: number;
  };
}

interface ComparisonReport {
  events: ComparisonEvent[];
  aggregate: {
    totalEstimated: number;
    totalActual: number;
    variance: number;
    variancePercentage: number;
  };
  generatedAt: string;
}

interface LoaderData {
  comparison: ComparisonReport | null;
  error?: string;
}

interface ActionData {
  error?: string;
  success?: boolean;
}

/**
 * Loader - fetch comparison report
 */
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  if (!token) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const eventIdsParam = url.searchParams.get("eventIds");

  if (!eventIdsParam) {
    return json<LoaderData>({ comparison: null });
  }

  const eventIds = eventIdsParam.split(",").map((id) => id.trim()).filter(Boolean);

  if (eventIds.length < 2) {
    return json<LoaderData>({ comparison: null, error: "At least 2 event IDs are required" });
  }

  try {
    const comparison = await api.post<ComparisonReport>(
      "/reports/comparison",
      { eventIds },
      { token },
    );
    return json<LoaderData>({ comparison });
  } catch (error: any) {
    console.error("Failed to fetch comparison report:", error);
    return json<LoaderData>(
      { comparison: null, error: error.message || "Failed to load comparison report" },
      { status: 500 },
    );
  }
}

/**
 * Action - handle report export
 */
export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  if (!token) {
    return json<ActionData>({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const eventIds = url.searchParams.get("eventIds");

  if (!eventIds) {
    return json<ActionData>({ error: "Event IDs are required" }, { status: 400 });
  }

  return json<ActionData>({ success: true });
}

export default function ComparisonReportPage() {
  const { comparison, error } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const eventIds = searchParams.get("eventIds");
    if (!eventIds) {
      alert("Event IDs are required");
      return;
    }

    try {
      const apiBaseUrl = env.API_BASE_URL;
      const exportUrl = `${apiBaseUrl}/reports/export/${format}?type=comparison&eventIds=${encodeURIComponent(eventIds)}`;
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
      link.download = `comparison-report-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/reports" className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block">
            ← Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Comparison Report</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!comparison || comparison.events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/reports" className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block">
            ← Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Comparison Report</h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">
            Please select at least 2 events from the reports page to generate a comparison.
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const comparisonData = comparison.events.map((event) => ({
    name: event.event.name.length > 15 ? event.event.name.substring(0, 15) + "..." : event.event.name,
    fullName: event.event.name,
    estimated: event.budget.totalEstimated,
    actual: event.budget.totalActual,
    variance: event.budget.variance,
    costPerAttendee: event.budget.costPerAttendee,
  }));

  const categoryComparisonData: Array<{
    category: string;
    [key: string]: string | number;
  }> = [];

  // Get all unique categories
  const allCategories = new Set<string>();
  comparison.events.forEach((event) => {
    Object.keys(event.budget.totalsByCategory).forEach((cat) => allCategories.add(cat));
  });

  // Build comparison data by category
  allCategories.forEach((category) => {
    const categoryRow: { category: string; [key: string]: string | number } = { category };
    comparison.events.forEach((event, index) => {
      const categoryData = event.budget.totalsByCategory[category] || {
        estimated: 0,
        actual: 0,
      };
      categoryRow[`Event ${index + 1} Estimated`] = categoryData.estimated;
      categoryRow[`Event ${index + 1} Actual`] = categoryData.actual;
    });
    categoryComparisonData.push(categoryRow);
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/reports" className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block">
          ← Back to Reports
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Event Comparison Report</h1>
        <p className="text-sm text-gray-600 mt-1">
          Comparing {comparison.events.length} event{comparison.events.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Generated: {new Date(comparison.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Aggregate Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Estimated</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(comparison.aggregate.totalEstimated)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Actual</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(comparison.aggregate.totalActual)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Aggregate Variance</div>
          <div
            className={`text-2xl font-bold ${
              comparison.aggregate.variance > 0
                ? "text-red-600"
                : comparison.aggregate.variance < 0
                  ? "text-green-600"
                  : "text-gray-600"
            }`}
          >
            {formatCurrency(comparison.aggregate.variance)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {comparison.aggregate.variancePercentage > 0 ? "+" : ""}
            {comparison.aggregate.variancePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Average Cost per Event</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(comparison.aggregate.totalActual / comparison.events.length)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Estimated vs Actual Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estimated vs Actual Comparison
          </h2>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => {
                    const data = comparisonData.find((d) => d.name === label);
                    return data?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="estimated" fill="#8884d8" name="Estimated" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Cost per Attendee Comparison */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost per Attendee</h2>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => {
                    const data = comparisonData.find((d) => d.name === label);
                    return data?.fullName || label;
                  }}
                />
                <Legend />
                <Bar dataKey="costPerAttendee" fill="#ffc658" name="Cost per Attendee" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Variance Trend Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Variance Trend</h2>
        {comparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => {
                  const data = comparisonData.find((d) => d.name === label);
                  return data?.fullName || label;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="variance"
                stroke="#ff7300"
                name="Variance"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/Attendee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparison.events.map((eventData, index) => (
                <tr key={eventData.event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {eventData.event.name}
                    </div>
                    <div className="text-sm text-gray-500">{eventData.event.client || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(eventData.budget.totalEstimated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(eventData.budget.totalActual)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      eventData.budget.variance > 0
                        ? "text-red-600 font-semibold"
                        : eventData.budget.variance < 0
                          ? "text-green-600 font-semibold"
                          : "text-gray-600"
                    }`}
                  >
                    {formatCurrency(eventData.budget.variance)}
                    <div className="text-xs text-gray-500">
                      {eventData.budget.variancePercentage > 0 ? "+" : ""}
                      {eventData.budget.variancePercentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(eventData.budget.costPerAttendee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        eventData.event.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : eventData.event.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : eventData.event.status === "Planning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {eventData.event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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


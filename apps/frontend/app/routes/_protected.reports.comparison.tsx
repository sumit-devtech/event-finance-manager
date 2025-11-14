import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams, useSubmit, useNavigation } from "@remix-run/react";
import React from "react";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to="/reports" className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-4 transition-colors font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Comparison Report</h1>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 text-red-800 shadow-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!comparison || comparison.events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link to="/reports" className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-4 transition-colors font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Comparison Report</h1>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600 text-lg">
              Please select at least 2 events from the reports page to generate a comparison.
            </p>
          </div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link to="/reports" className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-4 transition-colors font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Reports
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Event Comparison Report</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Comparing {comparison.events.length} event{comparison.events.length !== 1 ? "s" : ""}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Generated: {new Date(comparison.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Aggregate Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Total Estimated</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(comparison.aggregate.totalEstimated)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Total Actual</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(comparison.aggregate.totalActual)}
          </div>
        </div>
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg text-white ${
          comparison.aggregate.variance > 0
            ? "bg-gradient-to-br from-red-500 to-red-600"
            : comparison.aggregate.variance < 0
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : "bg-gradient-to-br from-gray-500 to-gray-600"
        }`}>
          <div className="text-xs sm:text-sm opacity-90 mb-1">Aggregate Variance</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(comparison.aggregate.variance)}
          </div>
          <div className="text-xs sm:text-sm opacity-75 mt-1">
            {comparison.aggregate.variancePercentage > 0 ? "+" : ""}
            {comparison.aggregate.variancePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="text-xs sm:text-sm opacity-90 mb-1">Avg Cost per Event</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {formatCurrency(comparison.aggregate.totalActual / comparison.events.length)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Estimated vs Actual Comparison Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Estimated vs Actual Comparison
          </h2>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
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
                  labelFormatter={(label) => {
                    const data = comparisonData.find((d) => d.name === label);
                    return data?.fullName || label;
                  }}
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
                <p className="text-sm">No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Cost per Attendee Comparison */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Cost per Attendee</h2>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
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
                  labelFormatter={(label) => {
                    const data = comparisonData.find((d) => d.name === label);
                    return data?.fullName || label;
                  }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="costPerAttendee" fill="#ffc658" name="Cost per Attendee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">No data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget Items by Category Comparison */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Budget Items by Category</h2>
        {categoryComparisonData.length > 0 ? (
          <>
            {/* Category Comparison Chart */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
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
                  {comparison.events.map((event, index) => (
                    <Bar 
                      key={`estimated-${index}`}
                      dataKey={`Event ${index + 1} Estimated`} 
                      fill={index === 0 ? "#8884d8" : index === 1 ? "#82ca9d" : "#ffc658"} 
                      name={`${event.event.name} (Est.)`}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                  {comparison.events.map((event, index) => (
                    <Bar 
                      key={`actual-${index}`}
                      dataKey={`Event ${index + 1} Actual`} 
                      fill={index === 0 ? "#8884d8" : index === 1 ? "#82ca9d" : "#ffc658"} 
                      name={`${event.event.name} (Act.)`}
                      radius={[4, 4, 0, 0]}
                      opacity={0.7}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Comparison Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Category
                      </th>
                      {comparison.events.map((event, index) => (
                        <React.Fragment key={event.event.id}>
                          <th colSpan={2} className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l-2 border-gray-200">
                            {event.event.name}
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                    <tr>
                      <th className="px-4 sm:px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"></th>
                      {comparison.events.map((event) => (
                        <React.Fragment key={event.event.id}>
                          <th className="px-4 sm:px-6 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider border-l-2 border-gray-200">
                            Estimated
                          </th>
                          <th className="px-4 sm:px-6 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actual
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryComparisonData.map((row, rowIndex) => (
                      <tr key={row.category} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 sticky left-0 bg-inherit z-10">
                          {row.category}
                        </td>
                        {comparison.events.map((event, eventIndex) => {
                          const estimated = row[`Event ${eventIndex + 1} Estimated`] as number || 0;
                          const actual = row[`Event ${eventIndex + 1} Actual`] as number || 0;
                          const variance = actual - estimated;
                          return (
                            <React.Fragment key={event.event.id}>
                              <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right border-l-2 border-gray-200 ${
                                estimated === 0 ? "text-gray-400" : ""
                              }`}>
                                {estimated > 0 ? formatCurrency(estimated) : "-"}
                              </td>
                              <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right ${
                                variance > 0
                                  ? "text-red-600 font-semibold"
                                  : variance < 0
                                    ? "text-green-600 font-semibold"
                                    : "text-gray-900"
                              } ${actual === 0 ? "text-gray-400" : ""}`}>
                                {actual > 0 ? formatCurrency(actual) : "-"}
                                {actual > 0 && estimated > 0 && (
                                  <div className={`text-xs mt-0.5 ${
                                    variance > 0 ? "text-red-500" : variance < 0 ? "text-green-500" : "text-gray-500"
                                  }`}>
                                    {variance > 0 ? "+" : ""}{formatCurrency(variance)}
                                  </div>
                                )}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-indigo-50 font-semibold border-t-2 border-indigo-200">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-indigo-900 sticky left-0 bg-indigo-50 z-10">
                        Total
                      </td>
                      {comparison.events.map((event, eventIndex) => (
                        <React.Fragment key={event.event.id}>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-indigo-900 text-right border-l-2 border-indigo-200">
                            {formatCurrency(event.budget.totalEstimated)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-indigo-900 text-right">
                            {formatCurrency(event.budget.totalActual)}
                            <div className={`text-xs mt-0.5 ${
                              event.budget.variance > 0 ? "text-red-600" : event.budget.variance < 0 ? "text-green-600" : "text-indigo-700"
                            }`}>
                              {event.budget.variance > 0 ? "+" : ""}{formatCurrency(event.budget.variance)}
                            </div>
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">No category data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Variance Trend Line Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Variance Trend</h2>
        {comparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={comparisonData}>
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
                labelFormatter={(label) => {
                  const data = comparisonData.find((d) => d.name === label);
                  return data?.fullName || label;
                }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="variance"
                stroke="#ff7300"
                name="Variance"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">No data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Detailed Comparison</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
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
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost/Attendee
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparison.events.map((eventData, index) => (
                  <tr key={eventData.event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {eventData.event.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">{eventData.event.client || "N/A"}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(eventData.budget.totalEstimated)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(eventData.budget.totalActual)}
                    </td>
                    <td
                      className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        eventData.budget.variance > 0
                          ? "text-red-600"
                          : eventData.budget.variance < 0
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    >
                      {formatCurrency(eventData.budget.variance)}
                      <div className="text-xs opacity-75 mt-0.5">
                        {eventData.budget.variancePercentage > 0 ? "+" : ""}
                        {eventData.budget.variancePercentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(eventData.budget.costPerAttendee)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
      </div>

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


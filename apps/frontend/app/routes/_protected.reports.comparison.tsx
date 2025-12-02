import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams, useSubmit, useNavigation } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { env } from "~/lib/env";
import toast from "react-hot-toast";
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
  PieChart,
  Pie,
  Cell,
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const eventIds = searchParams.get("eventIds");
    if (!eventIds) {
      toast.error("Event IDs are required");
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Export failed:", errorMessage);
      toast.error("Failed to export report. Please try again.");
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
      const variance = categoryData.actual - categoryData.estimated;
      categoryRow[`Event ${index + 1} Variance`] = variance;
      const variancePercent = categoryData.estimated > 0 
        ? (variance / categoryData.estimated) * 100 
        : 0;
      categoryRow[`Event ${index + 1} VariancePercent`] = variancePercent;
    });
    categoryComparisonData.push(categoryRow);
  });

  // Helper functions
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#ff6b6b", "#4ecdc4"];

  // Calculate event efficiency score (0-100)
  const calculateEventScore = (event: ComparisonEvent): number => {
    const efficiency = event.budget.totalEstimated > 0
      ? (event.budget.totalActual / event.budget.totalEstimated) * 100
      : 100;
    const variancePenalty = Math.abs(event.budget.variancePercentage) * 2;
    const score = Math.max(0, Math.min(100, 100 - (efficiency - 100) - variancePenalty));
    return Math.round(score);
  };

  // Get score label
  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Highly Efficient";
    if (score >= 80) return "Efficient";
    if (score >= 70) return "Acceptable";
    if (score >= 60) return "Over Budget";
    return "Significantly Over Budget";
  };

  // Calculate percentage difference between two events for a category
  const calculatePercentageDiff = (value1: number, value2: number): number => {
    if (value2 === 0) return value1 > 0 ? 100 : 0;
    return ((value1 - value2) / value2) * 100;
  };

  // Get variance color for heatmap
  const getVarianceColor = (variancePercent: number): string => {
    if (variancePercent > 10) return "bg-red-500";
    if (variancePercent > 5) return "bg-red-400";
    if (variancePercent > 0) return "bg-red-300";
    if (variancePercent === 0) return "bg-blue-400";
    if (variancePercent > -5) return "bg-green-300";
    if (variancePercent > -10) return "bg-green-400";
    return "bg-green-500";
  };

  // Prepare pie chart data for each event
  const pieChartData = comparison.events.map((event) => {
    const categories = Object.entries(event.budget.totalsByCategory)
      .map(([name, data]) => ({
        name,
        value: data.actual || data.estimated,
      }))
      .filter((item) => item.value > 0);
    return categories;
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg text-white">
          <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-1">Total Estimated</div>
          <div className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold break-words">
            {isMobile && comparison.aggregate.totalEstimated > 999999
              ? `$${(comparison.aggregate.totalEstimated / 1000000).toFixed(1)}M`
              : formatCurrency(comparison.aggregate.totalEstimated)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg text-white">
          <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-1">Total Actual</div>
          <div className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold break-words">
            {isMobile && comparison.aggregate.totalActual > 999999
              ? `$${(comparison.aggregate.totalActual / 1000000).toFixed(1)}M`
              : formatCurrency(comparison.aggregate.totalActual)}
          </div>
        </div>
        <div className={`p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg text-white ${
          comparison.aggregate.variance > 0
            ? "bg-gradient-to-br from-red-500 to-red-600"
            : comparison.aggregate.variance < 0
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : "bg-gradient-to-br from-gray-500 to-gray-600"
        }`}>
          <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-1">Aggregate Variance</div>
          <div className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold break-words">
            {isMobile && Math.abs(comparison.aggregate.variance) > 999999
              ? `${comparison.aggregate.variance > 0 ? "+" : ""}$${(Math.abs(comparison.aggregate.variance) / 1000000).toFixed(1)}M`
              : formatCurrency(comparison.aggregate.variance)}
          </div>
          <div className="text-[10px] sm:text-xs lg:text-sm opacity-75 mt-0.5 sm:mt-1">
            {comparison.aggregate.variancePercentage > 0 ? "+" : ""}
            {comparison.aggregate.variancePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg text-white">
          <div className="text-[10px] sm:text-xs lg:text-sm opacity-90 mb-1">Avg Cost per Event</div>
          <div className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold break-words">
            {isMobile && (comparison.aggregate.totalActual / comparison.events.length) > 999999
              ? `$${((comparison.aggregate.totalActual / comparison.events.length) / 1000000).toFixed(1)}M`
              : formatCurrency(comparison.aggregate.totalActual / comparison.events.length)}
          </div>
        </div>
      </div>

      {/* 🎯 8. Comparison Summary Panels - Individual Event Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {comparison.events.map((eventData, index) => {
          const score = calculateEventScore(eventData);
          const scoreLabel = getScoreLabel(score);
          return (
            <div key={eventData.event.id} className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{eventData.event.name}</h3>
                  {eventData.event.client && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{eventData.event.client}</p>
                  )}
                </div>
                <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                  eventData.event.status === "Completed"
                    ? "bg-blue-100 text-blue-800"
                    : eventData.event.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : eventData.event.status === "Planning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                }`}>
                  {eventData.event.status}
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Estimated</div>
                  <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 break-words">
                    {isMobile && eventData.budget.totalEstimated > 999999
                      ? `$${(eventData.budget.totalEstimated / 1000000).toFixed(1)}M`
                      : formatCurrency(eventData.budget.totalEstimated)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Actual</div>
                  <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 break-words">
                    {isMobile && eventData.budget.totalActual > 999999
                      ? `$${(eventData.budget.totalActual / 1000000).toFixed(1)}M`
                      : formatCurrency(eventData.budget.totalActual)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Variance</div>
                  <div className={`text-sm sm:text-base lg:text-lg font-semibold ${
                    eventData.budget.variance > 0
                      ? "text-red-600"
                      : eventData.budget.variance < 0
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}>
                    {eventData.budget.variance > 0 ? "+" : ""}
                    {isMobile && Math.abs(eventData.budget.variance) > 999999
                      ? `$${(Math.abs(eventData.budget.variance) / 1000000).toFixed(1)}M`
                      : formatCurrency(eventData.budget.variance)}
                    <span className="text-xs sm:text-sm ml-1 sm:ml-2">
                      ({eventData.budget.variancePercentage > 0 ? "+" : ""}
                      {eventData.budget.variancePercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Cost per Attendee</div>
                  <div className="text-sm sm:text-base lg:text-lg font-semibold text-indigo-600 break-words">
                    {formatCurrency(eventData.budget.costPerAttendee)}
                  </div>
                </div>
                {/* Event Score */}
                <div className="pt-2 sm:pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-500">Efficiency Score</span>
                    <span className={`text-xs sm:text-sm font-semibold ${
                      score >= 90 ? "text-green-600" : score >= 70 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {score}/100
                    </span>
                  </div>
                  <div className="mt-1.5 sm:mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className={`h-1.5 sm:h-2 rounded-full transition-all ${
                          score >= 90 ? "bg-green-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{scoreLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🎯 6. Event Score/Rating Comparison */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Event Efficiency Scores</h2>
        <div className="space-y-3 sm:space-y-4">
          {comparison.events.map((eventData) => {
            const score = calculateEventScore(eventData);
            const scoreLabel = getScoreLabel(score);
            return (
              <div key={eventData.event.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{eventData.event.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full flex-shrink-0 ${
                        score >= 90 ? "bg-green-100 text-green-800" : 
                        score >= 70 ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {score}/100
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600">({scoreLabel})</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div
                      className={`h-2 sm:h-3 rounded-full transition-all ${
                        score >= 90 ? "bg-green-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {/* Estimated vs Actual Comparison Bar Chart */}
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
            Estimated vs Actual Comparison
          </h2>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={isMobile ? -90 : -45} 
                  textAnchor="end" 
                  height={isMobile ? 100 : 80}
                  tick={{ fontSize: isMobile ? 8 : 10 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
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
                    fontSize: isMobile ? '10px' : '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
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
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Cost per Attendee</h2>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={isMobile ? -90 : -45} 
                  textAnchor="end" 
                  height={isMobile ? 100 : 80}
                  tick={{ fontSize: isMobile ? 8 : 10 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
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
                    fontSize: isMobile ? '10px' : '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
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

      {/* 🎯 3. Variance Heatmap */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Variance Heatmap</h2>
        {categoryComparisonData.length > 0 ? (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-gray-200">
                      Category
                    </th>
                    {comparison.events.map((event) => (
                      <th key={event.event.id} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]">
                        <span className="block truncate max-w-[80px] sm:max-w-none mx-auto" title={event.event.name}>
                          {isMobile ? (event.event.name.length > 10 ? event.event.name.substring(0, 10) + "..." : event.event.name) : event.event.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categoryComparisonData.map((row) => (
                    <tr key={row.category} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                        {row.category}
                      </td>
                      {comparison.events.map((event, eventIndex) => {
                        const variancePercent = row[`Event ${eventIndex + 1} VariancePercent`] as number || 0;
                        return (
                          <td key={event.event.id} className="px-2 sm:px-4 py-2 sm:py-4 text-center">
                            <div className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-[10px] sm:text-xs lg:text-sm font-semibold text-white min-w-[80px] sm:min-w-[100px] ${getVarianceColor(variancePercent)}`}>
                              {variancePercent > 0 ? "+" : ""}{variancePercent.toFixed(1)}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-sm">No category data available</p>
          </div>
        )}
      </div>

      {/* 🎯 5. Category-Level Comparison Cards */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from(allCategories).map((category) => {
            const categoryData = comparison.events.map((event, index) => {
              const data = event.budget.totalsByCategory[category] || { estimated: 0, actual: 0 };
              const variance = data.actual - data.estimated;
              const variancePercent = data.estimated > 0 ? (variance / data.estimated) * 100 : 0;
              return {
                eventName: event.event.name,
                estimated: data.estimated,
                actual: data.actual,
                variance,
                variancePercent,
              };
            });
            
            // Calculate average variance for sorting
            const avgVariance = categoryData.reduce((sum, d) => sum + Math.abs(d.variancePercent), 0) / categoryData.length;
            
            return (
              <div key={category} className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">{category}</h3>
                <div className="space-y-2 sm:space-y-3">
                  {categoryData.map((data) => (
                    <div key={data.eventName} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] sm:text-xs font-medium text-gray-700 mb-1 truncate">{data.eventName}</div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-0.5">
                        <div>Est: {isMobile && data.estimated > 999999 ? `$${(data.estimated / 1000000).toFixed(1)}M` : formatCurrency(data.estimated)}</div>
                        <div>Act: {isMobile && data.actual > 999999 ? `$${(data.actual / 1000000).toFixed(1)}M` : formatCurrency(data.actual)}</div>
                      </div>
                      <div className={`text-[10px] sm:text-xs font-semibold mt-1 ${
                        data.variance > 0 ? "text-red-600" : data.variance < 0 ? "text-green-600" : "text-gray-600"
                      }`}>
                        {data.variance > 0 ? "+" : ""}
                        {isMobile && Math.abs(data.variance) > 999999 
                          ? `$${(Math.abs(data.variance) / 1000000).toFixed(1)}M` 
                          : formatCurrency(data.variance)} 
                        ({data.variancePercent > 0 ? "+" : ""}{data.variancePercent.toFixed(1)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎯 2C. Pie Chart Comparison - Category Breakdown */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Category Distribution Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {comparison.events.map((event, eventIndex) => (
            <div key={event.event.id} className="text-center">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 truncate px-2">{event.event.name}</h3>
              {pieChartData[eventIndex] && pieChartData[eventIndex].length > 0 ? (
                <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
                  <PieChart>
                    <Pie
                      data={pieChartData[eventIndex]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={isMobile ? 50 : 70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData[eventIndex].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[150px] sm:h-[200px] flex items-center justify-center text-gray-400">
                  <p className="text-xs sm:text-sm">No data</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 4. Cost Per Attendee Comparison - Enhanced */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Cost Per Attendee Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {comparison.events.map((eventData) => {
            const avgEstimatedPerAttendee = eventData.budget.attendeeCount > 0
              ? eventData.budget.totalEstimated / eventData.budget.attendeeCount
              : 0;
            return (
              <div key={eventData.event.id} className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 truncate">{eventData.event.name}</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Estimated per Attendee</div>
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 break-words">
                      {formatCurrency(avgEstimatedPerAttendee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Actual per Attendee</div>
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-indigo-600 break-words">
                      {formatCurrency(eventData.budget.costPerAttendee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Variance</div>
                    <div className={`text-xs sm:text-sm font-semibold ${
                      eventData.budget.costPerAttendee > avgEstimatedPerAttendee ? "text-red-600" : "text-green-600"
                    }`}>
                      {eventData.budget.costPerAttendee > avgEstimatedPerAttendee ? "+" : ""}
                      {formatCurrency(eventData.budget.costPerAttendee - avgEstimatedPerAttendee)}
                    </div>
                  </div>
                  <div className="pt-1.5 sm:pt-2 border-t border-indigo-200">
                    <div className="text-[10px] sm:text-xs text-gray-500">Attendees</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700">{eventData.budget.attendeeCount}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎯 7. Timeline-Based Comparison */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Event Timeline Comparison</h2>
        <div className="space-y-4 sm:space-y-6">
          {comparison.events.map((eventData) => {
            const startDate = eventData.event.startDate ? new Date(eventData.event.startDate) : null;
            const endDate = eventData.event.endDate ? new Date(eventData.event.endDate) : null;
            const duration = startDate && endDate 
              ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
              : null;
            const dailySpend = duration && duration > 0
              ? eventData.budget.totalActual / duration
              : null;
            
            return (
              <div key={eventData.event.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{eventData.event.name}</h3>
                    {startDate && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {startDate.toLocaleDateString()} - {endDate?.toLocaleDateString() || "Ongoing"}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                    eventData.event.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : eventData.event.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {eventData.event.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Duration</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">
                      {duration ? `${duration} days` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total Cost</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                      {isMobile && eventData.budget.totalActual > 999999
                        ? `$${(eventData.budget.totalActual / 1000000).toFixed(1)}M`
                        : formatCurrency(eventData.budget.totalActual)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Daily Spend</div>
                    <div className="text-xs sm:text-sm font-semibold text-indigo-600 break-words">
                      {dailySpend ? formatCurrency(dailySpend) : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Variance</div>
                    <div className={`text-xs sm:text-sm font-semibold ${
                      eventData.budget.variance > 0 ? "text-red-600" : "text-green-600"
                    }`}>
                      {eventData.budget.variance > 0 ? "+" : ""}
                      {isMobile && Math.abs(eventData.budget.variance) > 999999
                        ? `$${(Math.abs(eventData.budget.variance) / 1000000).toFixed(1)}M`
                        : formatCurrency(eventData.budget.variance)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Items by Category Comparison */}
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Budget Items by Category</h2>
        {categoryComparisonData.length > 0 ? (
          <>
            {/* Category Comparison Chart */}
            <div className="mb-4 sm:mb-6">
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <BarChart data={categoryComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="category" 
                    angle={isMobile ? -90 : -45} 
                    textAnchor="end" 
                    height={isMobile ? 120 : 100}
                    tick={{ fontSize: isMobile ? 8 : 10 }}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
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
            <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                        Category
                      </th>
                      {comparison.events.map((event, index) => (
                        <React.Fragment key={event.event.id}>
                          <th colSpan={3} className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-l-2 border-gray-200">
                            <span className="block truncate max-w-[60px] sm:max-w-none mx-auto" title={event.event.name}>
                              {isMobile ? (event.event.name.length > 8 ? event.event.name.substring(0, 8) + "..." : event.event.name) : event.event.name}
                            </span>
                          </th>
                        </React.Fragment>
                      ))}
                      {comparison.events.length > 1 && (
                        <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-l-2 border-gray-300">
                          % Diff
                        </th>
                      )}
                    </tr>
                    <tr>
                      <th className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200"></th>
                      {comparison.events.map((event) => (
                        <React.Fragment key={event.event.id}>
                          <th className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider border-l-2 border-gray-200">
                            Est.
                          </th>
                          <th className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Act.
                          </th>
                          <th className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Var
                          </th>
                        </React.Fragment>
                      ))}
                      {comparison.events.length > 1 && (
                        <th className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider border-l-2 border-gray-300">
                          % Diff
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryComparisonData.map((row, rowIndex) => (
                      <tr key={row.category} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                          {row.category}
                        </td>
                        {comparison.events.map((event, eventIndex) => {
                          const estimated = row[`Event ${eventIndex + 1} Estimated`] as number || 0;
                          const actual = row[`Event ${eventIndex + 1} Actual`] as number || 0;
                          const variance = actual - estimated;
                          return (
                            <React.Fragment key={event.event.id}>
                              <td className={`px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-gray-900 text-right border-l-2 border-gray-200 ${
                                estimated === 0 ? "text-gray-400" : ""
                              }`}>
                                {estimated > 0 ? (
                                  isMobile && estimated > 999999
                                    ? `$${(estimated / 1000000).toFixed(1)}M`
                                    : formatCurrency(estimated)
                                ) : "-"}
                              </td>
                              <td className={`px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-right ${
                                actual === 0 ? "text-gray-400" : "text-gray-900"
                              }`}>
                                {actual > 0 ? (
                                  isMobile && actual > 999999
                                    ? `$${(actual / 1000000).toFixed(1)}M`
                                    : formatCurrency(actual)
                                ) : "-"}
                              </td>
                              <td className={`px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-right font-semibold ${
                                variance > 0
                                  ? "text-red-600"
                                  : variance < 0
                                    ? "text-green-600"
                                    : "text-gray-600"
                              } ${variance === 0 ? "text-gray-400" : ""}`}>
                                {estimated > 0 || actual > 0 ? (
                                  <>
                                    {variance > 0 ? "+" : ""}
                                    {isMobile && Math.abs(variance) > 999999
                                      ? `$${(Math.abs(variance) / 1000000).toFixed(1)}M`
                                      : formatCurrency(variance)}
                                  </>
                                ) : "-"}
                              </td>
                            </React.Fragment>
                          );
                        })}
                        {/* % Diff Column */}
                        {comparison.events.length > 1 && (() => {
                          const event1Actual = row[`Event 1 Actual`] as number || 0;
                          const event2Actual = row[`Event 2 Actual`] as number || 0;
                          const percentDiff = calculatePercentageDiff(event1Actual, event2Actual);
                          return (
                            <td className={`px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-center font-semibold border-l-2 border-gray-300 ${
                              percentDiff > 0 ? "text-red-600" : percentDiff < 0 ? "text-green-600" : "text-gray-600"
                            }`}>
                              {event1Actual > 0 || event2Actual > 0 ? (
                                <>
                                  {percentDiff > 0 ? "+" : ""}{percentDiff.toFixed(1)}%
                                </>
                              ) : "-"}
                            </td>
                          );
                        })()}
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-indigo-50 font-semibold border-t-2 border-indigo-200">
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-indigo-900 sticky left-0 bg-indigo-50 z-10 border-r border-indigo-200">
                        Total
                      </td>
                      {comparison.events.map((event, eventIndex) => (
                        <React.Fragment key={event.event.id}>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-indigo-900 text-right border-l-2 border-indigo-200">
                            {isMobile && event.budget.totalEstimated > 999999
                              ? `$${(event.budget.totalEstimated / 1000000).toFixed(1)}M`
                              : formatCurrency(event.budget.totalEstimated)}
                          </td>
                          <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-indigo-900 text-right">
                            {isMobile && event.budget.totalActual > 999999
                              ? `$${(event.budget.totalActual / 1000000).toFixed(1)}M`
                              : formatCurrency(event.budget.totalActual)}
                          </td>
                          <td className={`px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-right font-semibold ${
                            event.budget.variance > 0 ? "text-red-600" : event.budget.variance < 0 ? "text-green-600" : "text-indigo-700"
                          }`}>
                            {event.budget.variance > 0 ? "+" : ""}
                            {isMobile && Math.abs(event.budget.variance) > 999999
                              ? `$${(Math.abs(event.budget.variance) / 1000000).toFixed(1)}M`
                              : formatCurrency(event.budget.variance)}
                          </td>
                        </React.Fragment>
                      ))}
                      {comparison.events.length > 1 && (
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-[10px] sm:text-xs lg:text-sm text-indigo-900 text-center border-l-2 border-indigo-300">
                          {(() => {
                            const event1Actual = comparison.events[0].budget.totalActual;
                            const event2Actual = comparison.events[1].budget.totalActual;
                            const percentDiff = calculatePercentageDiff(event1Actual, event2Actual);
                            return (
                              <span className={percentDiff > 0 ? "text-red-600" : percentDiff < 0 ? "text-green-600" : "text-indigo-700"}>
                                {percentDiff > 0 ? "+" : ""}{percentDiff.toFixed(1)}%
                              </span>
                            );
                          })()}
                        </td>
                      )}
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
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Variance Trend</h2>
        {comparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={isMobile ? -90 : -45} 
                textAnchor="end" 
                height={isMobile ? 100 : 80}
                tick={{ fontSize: isMobile ? 8 : 10 }}
              />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
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
                    fontSize: isMobile ? '10px' : '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
                <Line
                  type="monotone"
                  dataKey="variance"
                  stroke="#ff7300"
                  name="Variance"
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ r: isMobile ? 3 : 5 }}
                  activeDot={{ r: isMobile ? 5 : 7 }}
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
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Detailed Comparison</h2>
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="space-y-3 sm:space-y-4">
            {comparison.events.map((eventData) => (
              <div key={eventData.event.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{eventData.event.name}</h3>
                    {eventData.event.client && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{eventData.event.client}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                    eventData.event.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : eventData.event.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : eventData.event.status === "Planning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  }`}>
                    {eventData.event.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Estimated</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                      {isMobile && eventData.budget.totalEstimated > 999999
                        ? `$${(eventData.budget.totalEstimated / 1000000).toFixed(1)}M`
                        : formatCurrency(eventData.budget.totalEstimated)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Actual</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                      {isMobile && eventData.budget.totalActual > 999999
                        ? `$${(eventData.budget.totalActual / 1000000).toFixed(1)}M`
                        : formatCurrency(eventData.budget.totalActual)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Variance</div>
                    <div className={`text-xs sm:text-sm font-semibold ${
                      eventData.budget.variance > 0
                        ? "text-red-600"
                        : eventData.budget.variance < 0
                          ? "text-green-600"
                          : "text-gray-600"
                    }`}>
                      {eventData.budget.variance > 0 ? "+" : ""}
                      {isMobile && Math.abs(eventData.budget.variance) > 999999
                        ? `$${(Math.abs(eventData.budget.variance) / 1000000).toFixed(1)}M`
                        : formatCurrency(eventData.budget.variance)}
                      <div className="text-[10px] opacity-75 mt-0.5">
                        ({eventData.budget.variancePercentage > 0 ? "+" : ""}
                        {eventData.budget.variancePercentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Cost/Attendee</div>
                    <div className="text-xs sm:text-sm font-semibold text-indigo-600 break-words">
                      {formatCurrency(eventData.budget.costPerAttendee)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto -mx-3 sm:-mx-4 lg:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost/Attendee
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparison.events.map((eventData, index) => (
                  <tr key={eventData.event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {eventData.event.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">{eventData.event.client || "N/A"}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(eventData.budget.totalEstimated)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(eventData.budget.totalActual)}
                    </td>
                    <td
                      className={`px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
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
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(eventData.budget.costPerAttendee)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
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


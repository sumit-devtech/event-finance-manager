import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: {
    files: number;
    budgetItems: number;
    activityLogs: number;
  };
}

interface LoaderData {
  user: User;
  events: Event[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    planningEvents: number;
    cancelledEvents: number;
    totalBudgetItems: number;
    upcomingEvents: Event[];
    recentEvents: Event[];
  };
}

/**
 * Loader - fetch dashboard data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch all events for statistics
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
    });

    const now = new Date();
    const upcomingEvents = events
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5);

    const recentEvents = events
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);

    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter((e) => e.status === "Active").length,
      completedEvents: events.filter((e) => e.status === "Completed").length,
      planningEvents: events.filter((e) => e.status === "Planning").length,
      cancelledEvents: events.filter((e) => e.status === "Cancelled").length,
      totalBudgetItems: events.reduce((sum, e) => sum + e._count.budgetItems, 0),
      upcomingEvents,
      recentEvents,
    };

    return json<LoaderData>({ user, events: events || [], stats });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return json<LoaderData>({
      user,
      events: [],
      stats: {
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        planningEvents: 0,
        cancelledEvents: 0,
        totalBudgetItems: 0,
        upcomingEvents: [],
        recentEvents: [],
      },
    });
  }
}

export default function Dashboard() {
  const { user, events, stats } = useLoaderData<typeof loader>();

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  // Prepare chart data
  const statusData = [
    { name: "Planning", value: stats.planningEvents },
    { name: "Active", value: stats.activeEvents },
    { name: "Completed", value: stats.completedEvents },
    { name: "Cancelled", value: stats.cancelledEvents },
  ].filter((item) => item.value > 0);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || user.email.split("@")[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Here's an overview of your event management dashboard
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Link
            to="/events"
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 sm:p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm opacity-90 mb-1">Total Events</div>
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalEvents}</div>
              </div>
              <svg className="w-8 h-8 sm:w-10 sm:h-10 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm opacity-90 mb-1">Active Events</div>
                <div className="text-2xl sm:text-3xl font-bold">{stats.activeEvents}</div>
              </div>
              <svg className="w-8 h-8 sm:w-10 sm:h-10 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm opacity-90 mb-1">Completed</div>
                <div className="text-2xl sm:text-3xl font-bold">{stats.completedEvents}</div>
              </div>
              <svg className="w-8 h-8 sm:w-10 sm:h-10 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm opacity-90 mb-1">Budget Items</div>
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalBudgetItems}</div>
              </div>
              <svg className="w-8 h-8 sm:w-10 sm:h-10 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Charts and Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Events by Status Chart */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Events Overview
            </h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
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

          {/* Status Distribution Pie Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Status Distribution
        </h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
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

        {/* Upcoming Events and Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Upcoming Events */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Events</h2>
              <Link
                to="/events"
                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            {stats.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block p-3 sm:p-4 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-indigo-900 truncate">
                          {event.name}
                        </h3>
                        {event.client && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">{event.client}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                            {event.status}
                          </span>
                          {event.startDate && (
                            <span className="text-xs text-gray-500">
                              {formatDate(event.startDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">No upcoming events</p>
                <Link
                  to="/events/new"
                  className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  Create your first event →
                </Link>
              </div>
            )}
          </div>

          {/* Recent Events */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Events</h2>
              <Link
                to="/events"
                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            {stats.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block p-3 sm:p-4 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-indigo-900 truncate">
                          {event.name}
                        </h3>
                        {event.client && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">{event.client}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                            {event.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Created {formatDate(event.createdAt)}
                          </span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500">No recent events</p>
                <Link
                  to="/events/new"
                  className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  Create your first event →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/events/new"
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
            >
              <svg className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-indigo-900">New Event</span>
            </Link>

            <Link
              to="/events"
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
            >
              <svg className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-green-900">View Events</span>
            </Link>

            <Link
              to="/reports"
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
            >
              <svg className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-blue-900">Reports</span>
            </Link>

            {(user.role === "Admin" || user.role === "EventManager" || user.role === "Finance") && (
              <Link
                to="/events"
                className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
              >
                <svg className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-purple-900">Budget</span>
              </Link>
            )}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6 rounded-xl shadow-lg text-white mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Account Information</h3>
              <div className="space-y-1 text-sm sm:text-base opacity-90">
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                {user.name && (
                  <p>
                    <span className="font-medium">Name:</span> {user.name}
                  </p>
                )}
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-30 text-indigo-900 border border-white border-opacity-30">
                    {user.role}
                  </span>
                </p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

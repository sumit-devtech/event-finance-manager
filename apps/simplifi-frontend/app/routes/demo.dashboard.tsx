import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

/**
 * Demo Dashboard - No authentication required
 * Shows sample data for demonstration purposes
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Return demo data - no API calls needed
  return json({
    demo: true,
    stats: {
      totalEvents: 3,
      activeEvents: 1,
      completedEvents: 2,
      totalBudget: 50000,
      totalExpenses: 35000,
    },
    events: [
      {
        id: "demo-1",
        name: "Tech Conference 2024",
        status: "active",
        startDate: "2024-06-15",
        endDate: "2024-06-17",
        budget: 25000,
        expenses: 18000,
      },
      {
        id: "demo-2",
        name: "Product Launch Event",
        status: "completed",
        startDate: "2024-05-01",
        endDate: "2024-05-01",
        budget: 15000,
        expenses: 12000,
      },
      {
        id: "demo-3",
        name: "Annual Company Meeting",
        status: "completed",
        startDate: "2024-04-10",
        endDate: "2024-04-12",
        budget: 10000,
        expenses: 5000,
      },
    ],
  });
}

export default function DemoDashboard() {
  const { stats, events } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> You're viewing sample data. Sign up to create your own events.
          </p>
          <Link
            to="/signup"
            className="text-sm text-yellow-800 underline hover:text-yellow-900"
          >
            Sign Up →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demo Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Explore Simplifi with sample data. Sign up to start managing your own events.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Events</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Events</div>
            <div className="text-3xl font-bold text-green-600">{stats.activeEvents}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Budget</div>
            <div className="text-3xl font-bold text-blue-600">${stats.totalBudget.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
            <div className="text-3xl font-bold text-orange-600">${stats.totalExpenses.toLocaleString()}</div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sample Events</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {events.map((event: any) => (
              <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex gap-4 text-sm text-gray-600">
                      <span>Budget: ${event.budget.toLocaleString()}</span>
                      <span>Expenses: ${event.expenses.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === "active" 
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-indigo-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to create your own events?</h2>
          <p className="text-indigo-100 mb-6">
            Sign up now to start managing your event finances with Simplifi
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="px-6 py-3 bg-white text-indigo-600 rounded-md hover:bg-gray-100 font-semibold"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border-2 border-white text-white rounded-md hover:bg-indigo-700 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


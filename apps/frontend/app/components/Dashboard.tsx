import { Link, useSearchParams } from "@remix-run/react";
import { Calendar, DollarSign, TrendingUp, Clock, Crown, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { User } from "~/lib/auth";

interface DashboardProps {
  user: User;
  organization?: any;
  events: any[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    planningEvents: number;
    cancelledEvents: number;
    totalBudgetItems: number;
    upcomingEvents: any[];
    recentEvents: any[];
  };
}

export function Dashboard({ user, organization, events, stats }: DashboardProps) {
  const [searchParams] = useSearchParams();
  // Check if we're in demo mode by checking the route path or demo flag
  const isDemo = typeof window !== 'undefined' 
    ? window.location.pathname.startsWith('/demo') || searchParams.get('demo') === 'true'
    : searchParams.get('demo') === 'true';

  // Demo data matching Figma design
  const demoStats = [
    { label: 'Active Events', value: '12', change: '+2 this month', icon: Calendar, color: 'blue', href: '/events?status=Active' },
    { label: 'Total Budget', value: '$485K', change: '+12% from last month', icon: DollarSign, color: 'green', href: '/budget' },
    { label: 'Pending Approvals', value: '8', change: '3 urgent', icon: Clock, color: 'yellow', href: '/expenses' },
    { label: 'ROI Average', value: '245%', change: '+18% improvement', icon: TrendingUp, color: 'purple', href: '/analytics' },
  ];

  const demoBudgetData = [
    { month: 'Jan', budget: 45000, spent: 42000 },
    { month: 'Feb', budget: 52000, spent: 48000 },
    { month: 'Mar', budget: 48000, spent: 51000 },
    { month: 'Apr', budget: 61000, spent: 58000 },
    { month: 'May', budget: 55000, spent: 52000 },
    { month: 'Jun', budget: 67000, spent: 63000 },
  ];

  const demoExpenseCategories = [
    { name: 'Venue', value: 35, color: '#3b82f6' },
    { name: 'Catering', value: 28, color: '#10b981' },
    { name: 'Marketing', value: 18, color: '#f59e0b' },
    { name: 'Entertainment', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 7, color: '#6b7280' },
  ];

  const demoRecentEvents = [
    { id: 'demo-1', name: 'Tech Conference 2024', status: 'active', budget: 125000, spent: 98000, progress: 78 },
    { id: 'demo-2', name: 'Product Launch Event', status: 'planning', budget: 85000, spent: 12000, progress: 14 },
    { id: 'demo-3', name: 'Annual Gala', status: 'active', budget: 95000, spent: 87000, progress: 92 },
    { id: 'demo-4', name: 'Workshop Series', status: 'completed', budget: 45000, spent: 44500, progress: 100 },
  ];

  // Use demo data if in demo mode, otherwise use real stats
  const dashboardStats = isDemo ? demoStats : [
    { 
      label: 'Active Events', 
      value: stats.activeEvents.toString(), 
      change: `${stats.activeEvents > 0 ? '+' : ''}${stats.activeEvents} active`, 
      icon: Calendar, 
      color: 'blue',
      href: '/events?status=Active'
    },
    { 
      label: 'Total Budget Items', 
      value: stats.totalBudgetItems.toString(), 
      change: 'Across all events', 
      icon: DollarSign, 
      color: 'green',
      href: '/budget'
    },
    { 
      label: 'Total Events', 
      value: stats.totalEvents.toString(), 
      change: `${stats.planningEvents} planning`, 
      icon: Clock, 
      color: 'yellow',
      href: '/events'
    },
    { 
      label: 'Completed', 
      value: stats.completedEvents.toString(), 
      change: 'Events finished', 
      icon: TrendingUp, 
      color: 'purple',
      href: '/events?status=Completed'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'planning': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Use demo data if in demo mode, otherwise calculate from real events
  const recentEventsWithBudget = isDemo ? demoRecentEvents : stats.recentEvents.slice(0, 5).map(event => ({
    name: event.name,
    status: event.status,
    budget: 0, // TODO: Get from budget API
    spent: 0, // TODO: Get from expenses API
    progress: 0,
    id: event.id
  }));

  const budgetData = isDemo ? demoBudgetData : []; // TODO: Get real budget data
  const expenseCategories = isDemo ? demoExpenseCategories : []; // TODO: Get real expense data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back{user.name ? `, ${user.name}` : ''}! Here's what's happening with your events.
        </p>
        {isDemo && (
          <p className="text-yellow-700 text-sm mt-1">
            You're viewing demo data. Sign up to create your own events.
          </p>
        )}
      </div>

      {/* Organization Info */}
      {organization && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Organization</p>
              <h3 className="text-xl font-semibold">{organization.name}</h3>
              {organization.industry && (
                <p className="text-gray-600 text-sm mt-1">{organization.industry}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Team Members</p>
              <p className="text-2xl font-bold">{organization.members?.length || 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            purple: 'bg-purple-100 text-purple-600',
          };
          const StatCard = (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.change}</p>
              </div>
            </div>
          );
          
          return stat.href ? (
            <Link key={index} to={isDemo ? `/demo${stat.href}` : stat.href}>
              {StatCard}
            </Link>
          ) : StatCard;
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Spending Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Budget vs Actual Spending</h3>
          {budgetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="spent" fill="#10b981" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No budget data available</p>
            </div>
          )}
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          {expenseCategories.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.value}%`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                    <span className="text-sm">{category.name}: {category.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No expense data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Events Table */}
      {recentEventsWithBudget.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Event Name</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Budget</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Spent</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentEventsWithBudget.map((event, index) => (
                  <tr key={event.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {event.id ? (
                        <Link 
                          to={isDemo ? `/demo/events/${event.id}` : `/events/${event.id}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {event.name}
                        </Link>
                      ) : (
                        <p className="text-gray-900">{event.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${event.budget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${event.spent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${event.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{event.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


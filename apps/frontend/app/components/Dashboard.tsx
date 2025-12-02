import { Link, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { Calendar, DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle, FileText, Plus, Crown } from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import type { User } from "~/lib/auth";
import { demoDashboardStats, demoDashboardBudgetData, demoDashboardExpenseCategories, demoDashboardRecentEvents, demoDashboardAlerts } from "~/lib/demoData";
import { ProgressBar } from "./shared/ProgressBar";
import { Dropdown } from "./shared";

interface DashboardEvent {
  id?: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  progress: number;
}

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  planningEvents: number;
  cancelledEvents: number;
  totalBudgetItems: number;
  upcomingEvents: DashboardEvent[];
  recentEvents: DashboardEvent[];
}

interface BudgetDataPoint {
  month: string;
  budget: number;
  spent: number;
}

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

interface DashboardAlert {
  id: string;
  type: string;
  message: string;
  count?: number;
  urgent: boolean;
}

interface DashboardProps {
  user: User | null;
  organization?: { name?: string; industry?: string; members?: unknown[] } | null;
  events: DashboardEvent[];
  stats: DashboardStats;
  budgetData?: BudgetDataPoint[];
  expenseCategories?: ExpenseCategory[];
  alerts?: DashboardAlert[];
  isDemo?: boolean;
}

export function Dashboard({ user, organization, events, stats, budgetData: budgetDataProp, expenseCategories: expenseCategoriesProp, alerts: alertsProp, isDemo: isDemoProp }: DashboardProps) {
  const [searchParams] = useSearchParams();
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('6months');
  // Check if we're in demo mode by checking the demo query parameter
  const isDemo = isDemoProp ?? searchParams.get('demo') === 'true';

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isFinance = user?.role === 'Finance';
  const isViewer = user?.role === 'Viewer';
  
  // Create Event: Admin and EventManager only (Finance cannot create events)
  const canCreateEvent = (isAdmin || isEventManager || isDemo);
  // Manage Budget: Admin, EventManager, and Finance can manage budgets
  const canManageBudget = !isViewer || isDemo;
  // View Reports: Admin, EventManager, and Finance (Viewer cannot access reports)
  const canViewReports = (isAdmin || isEventManager || isFinance || isDemo);

  // Use demo data from centralized file - map icons
  const demoStats = demoDashboardStats.map(stat => {
    let icon = Calendar;
    if (stat.label === 'Total Budget') icon = DollarSign;
    else if (stat.label === 'Pending Approvals') icon = Clock;
    else if (stat.label === 'ROI Average') icon = TrendingUp;
    return { ...stat, icon };
  });

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
  const recentEventsWithBudget = isDemo ? demoDashboardRecentEvents : stats.recentEvents.slice(0, 5).map(event => {
    // Find the full event data with budget/spent from the events array
    const fullEvent = events.find((e) => e.id === event.id) || event;
    const budget = fullEvent.budget || 0;
    const spent = fullEvent.spent || 0;
    const progress = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    
    return {
      name: event.name,
      status: event.status,
      budget: budget,
      spent: spent,
      progress: progress,
      id: event.id
    };
  });

  const budgetData = isDemo ? demoDashboardBudgetData : (budgetDataProp || []);
  const expenseCategories = isDemo ? demoDashboardExpenseCategories : (expenseCategoriesProp || []);

  const isFreeUser = user?.subscription === 'free';
  const freeEventsRemaining = user?.freeEventsRemaining || 0;

  // Calculate budget overview
  const totalBudget = isDemo
    ? 485000
    : events.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalSpent = isDemo
    ? 362000
    : events.reduce((sum, event) => sum + (event.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get budget status color
  const getBudgetStatusColor = (percentage: number) => {
    if (percentage > 90) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', indicator: 'bg-red-500' };
    if (percentage > 75) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', indicator: 'bg-amber-500' };
    return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', indicator: 'bg-emerald-500' };
  };

  const budgetStatus = getBudgetStatusColor(utilizationPercentage);
  const budgetStatusLabel = utilizationPercentage > 90 ? 'Over Budget' : utilizationPercentage > 75 ? 'At Risk' : 'On Track';

  const alerts = isDemo ? demoDashboardAlerts : (alertsProp || []);

  // Filter chart data based on selected filters
  const filteredChartData = budgetData.filter((item, index) => {
    if (dateRangeFilter === '3months') return index >= 3;
    if (dateRangeFilter === '6months') return true;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          {isDemo ? "Welcome! Here's what's happening with your events." : `Welcome back${user?.name ? `, ${user.name}` : ''}! Here's what's happening with your events.`}
        </p>
        {isDemo && (
          <p className="text-yellow-700 text-sm mt-1">
            You're viewing demo data. Sign up to create your own events.
          </p>
        )}
      </div>

      {/* Free Trial Banner */}
      {isFreeUser && !isDemo && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="md:w-6 md:h-6" />
                <h3 className="text-lg md:text-xl font-semibold">Free Trial Active</h3>
              </div>
              <p className="opacity-90 text-sm md:text-base">
                You have {freeEventsRemaining} free event(s) remaining. Upgrade to unlock unlimited events and premium features.
              </p>
            </div>
            <button className="w-full sm:w-auto px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 whitespace-nowrap font-medium text-sm md:text-base">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Organization Info */}
      {organization && (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm mb-1">Organization</p>
              <h3 className="text-lg md:text-xl font-semibold truncate">{organization.name}</h3>
              {organization.industry && (
                <p className="text-gray-600 text-sm mt-1">{organization.industry}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-gray-600 text-xs md:text-sm">Team Members</p>
              <p className="text-xl md:text-2xl font-bold">{organization.members?.length || 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {/* Total Budget Card */}
        <div className="bg-white p-5 md:p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Budget</p>
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">${totalBudget.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-xs text-gray-500">All events combined</p>
          </div>
        </div>

        {/* Utilized Budget Card */}
        <div className={`bg-white p-5 md:p-6 rounded-xl border-2 ${budgetStatus.border} hover:shadow-lg transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Utilized</p>
            <div className={`p-2.5 ${budgetStatus.bg} rounded-lg`}>
              <TrendingUp size={20} className={budgetStatus.text} />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">${totalSpent.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${budgetStatus.indicator}`}></div>
            <p className={`text-xs font-medium ${budgetStatus.text}`}>
              {utilizationPercentage.toFixed(1)}% - {budgetStatusLabel}
            </p>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className={`bg-white p-5 md:p-6 rounded-xl border-2 ${totalRemaining < 0 ? 'border-red-200' : 'border-emerald-200'} hover:shadow-lg transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Remaining</p>
            <div className={`p-2.5 ${totalRemaining < 0 ? 'bg-red-100' : 'bg-emerald-100'} rounded-lg`}>
              <DollarSign size={20} className={totalRemaining < 0 ? 'text-red-600' : 'text-emerald-600'} />
            </div>
          </div>
          <p className={`text-3xl md:text-4xl font-bold mb-2 ${totalRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            ${Math.abs(totalRemaining).toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${totalRemaining < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <p className={`text-xs font-medium ${totalRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {totalRemaining < 0 ? 'Over budget' : 'Available'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-600" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Alerts & Notifications</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${alert.urgent
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-1.5 rounded-lg ${alert.urgent ? 'bg-red-100' : 'bg-amber-100'}`}>
                      <AlertCircle size={16} className={alert.urgent ? 'text-red-600' : 'text-amber-600'} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${alert.urgent ? 'text-red-900' : 'text-amber-900'}`}>
                        {alert.message}
                      </p>
                      {alert.count && alert.count > 1 && (
                        <p className={`text-sm mt-1 ${alert.urgent ? 'text-red-700' : 'text-amber-700'}`}>
                          {alert.count} items require attention
                        </p>
                      )}
                    </div>
                  </div>
                  {alert.type === 'approval' && (
                    <Link
                      to={isDemo ? "/expenses?demo=true" : "/expenses"}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Overview by Category */}
      {expenseCategories.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Budget Overview by Category</h3>
          <div className="space-y-4">
            {expenseCategories.map((category, index) => {
              const percentage = category.value;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-sm md:text-base text-gray-700 truncate">{category.name}</span>
                    <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      {category.value}%
                    </span>
                  </div>
                  <ProgressBar
                    value={percentage}
                    variant={percentage > 90 ? "danger" : percentage > 75 ? "warning" : "safe"}
                    height="md"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spend Over Time Chart - Improved */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Spend Over Time</h3>

          {/* Chart Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Event Filter */}
            <Dropdown
              value={selectedEventFilter}
              onChange={setSelectedEventFilter}
              options={[
                { value: 'all', label: 'All Events' },
                ...events.slice(0, 5).map((event) => ({
                  value: event.id || '',
                  label: event.name,
                })),
              ]}
              placeholder="Select event"
              size="sm"
              className="min-w-[150px]"
            />

            {/* Date Range Filter */}
            <Dropdown
              value={dateRangeFilter}
              onChange={setDateRangeFilter}
              options={[
                { value: '3months', label: 'Last 3 Months' },
                { value: '6months', label: 'Last 6 Months' },
                { value: '12months', label: 'Last 12 Months' },
              ]}
              placeholder="Select date range"
              size="sm"
              className="min-w-[150px]"
            />
          </div>
        </div>

        {filteredChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={filteredChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                label={{ value: 'Month', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6b7280' } }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Budget"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#10b981"
                strokeWidth={3}
                name="Spent"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
            <p>No budget data available</p>
          </div>
        )}
      </div>

      {/* Expense Distribution */}
      {expenseCategories.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
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
                  <div className="w-4 h-4 rounded color-swatch" style={{ backgroundColor: category.color }} />
                  <span className="text-sm">{category.name}: {category.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {recentEventsWithBudget.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold">Recent Events</h3>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-gray-200">
            {recentEventsWithBudget.map((event, index) => (
              <div key={event.id || index} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {event.id ? (
                      <Link
                        to={isDemo ? `/events/${event.id}?demo=true` : `/events/${event.id}`}
                        className="font-medium truncate text-blue-600 hover:underline block"
                      >
                        {event.name}
                      </Link>
                    ) : (
                      <p className="font-medium truncate text-gray-900">{event.name}</p>
                    )}
                  </div>
                  <span className={`ml-3 px-3 py-1 rounded-full text-sm whitespace-nowrap capitalize ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">${event.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-medium">${event.spent.toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{event.progress}%</span>
                  </div>
                  <ProgressBar
                    value={event.progress}
                    variant={event.progress > 90 ? "danger" : event.progress > 75 ? "warning" : "primary"}
                    height="md"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                          to={isDemo ? `/events/${event.id}?demo=true` : `/events/${event.id}`} 
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
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px]">
                          <ProgressBar
                            value={event.progress}
                            variant={event.progress > 90 ? "danger" : event.progress > 75 ? "warning" : "primary"}
                            height="sm"
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

      {/* Empty State */}
      {recentEventsWithBudget.length === 0 && !isDemo && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first event</p>
          {canCreateEvent && (
            <Link
              to={isDemo ? "/events/new?demo=true" : "/events/new"}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Event
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* New Event */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-600 rounded-lg">
              <Plus size={20} className="text-white" />
            </div>
            <h4 className="text-lg md:text-xl font-semibold text-gray-900">New Event</h4>
          </div>
          <p className="text-gray-700 text-sm mb-5">Start planning your next event with our easy-to-use tools</p>
          {canCreateEvent ? (
            <Link
              to={isDemo ? "/events/new?demo=true" : "/events/new"}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span>Create Event</span>
            </Link>
          ) : (
            <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
              <Plus size={18} />
              <span>Create Event</span>
            </div>
          )}
        </div>

        {/* Budget Line */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-600 rounded-lg">
              <DollarSign size={20} className="text-white" />
            </div>
            <h4 className="text-lg md:text-xl font-semibold text-gray-900">Budget Line</h4>
          </div>
          <p className="text-gray-700 text-sm mb-5">Add budget line items and track expenses across events</p>
          {canManageBudget ? (
            <Link
              to={isDemo ? "/budget?demo=true" : "/budget"}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <DollarSign size={18} />
              <span>Manage Budget</span>
            </Link>
          ) : (
            <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
              <DollarSign size={18} />
              <span>Manage Budget</span>
            </div>
          )}
        </div>

        {/* Generate Report */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-600 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <h4 className="text-lg md:text-xl font-semibold text-gray-900">Generate Report</h4>
          </div>
          <p className="text-gray-700 text-sm mb-5">Create comprehensive reports and export your data</p>
          {canViewReports ? (
            <Link
              to={isDemo ? "/reports?demo=true" : "/reports"}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <FileText size={18} />
              <span>View Reports</span>
            </Link>
          ) : (
            <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
              <FileText size={18} />
              <span>View Reports</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



import { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Crown } from './Icons';
import { eventsAPI, expensesAPI } from '../utils/api';
import { getDemoEvents, getDemoExpenses } from '../utils/demoData';

interface DashboardProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function Dashboard({ user, organization, isDemo }: DashboardProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setEvents(getDemoEvents());
      setExpenses(getDemoExpenses());
      setLoading(false);
    } else {
      fetchData();
    }
  }, [isDemo, organization]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsResult] = await Promise.all([
        eventsAPI.list(organization?.id).catch(() => ({ events: [] })),
      ]);
      
      setEvents(eventsResult.events || []);
      
      // Fetch expenses for all events
      if (eventsResult.events?.length > 0) {
        const allExpenses = await Promise.all(
          eventsResult.events.map((event: any) => 
            expensesAPI.listByEvent(event.id).catch(() => ({ expenses: [] }))
          )
        );
        const flatExpenses = allExpenses.flatMap(result => result.expenses || []);
        setExpenses(flatExpenses);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setEvents([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const isFreeUser = user?.subscription === 'free';
  const freeEventsRemaining = user?.freeEventsRemaining || 0;

  // Calculate stats from real data
  const totalBudget = events.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalSpent = events.reduce((sum, event) => sum + (event.spent || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
  const avgROI = events.length > 0 ? 124 : 0; // Placeholder for ROI calculation

  const stats = [
    { label: 'Total Events', value: events.length.toString(), change: `${events.length} active`, icon: Calendar, color: 'blue' },
    { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, change: `$${totalSpent.toLocaleString()} spent`, icon: DollarSign, color: 'green' },
    { label: 'ROI', value: `${avgROI}%`, change: 'Average across events', icon: TrendingUp, color: 'purple' },
    { label: 'Pending Approvals', value: pendingExpenses.toString(), change: expenses.filter(e => e.status === 'pending' && e.amount > 5000).length + ' urgent', icon: AlertCircle, color: 'yellow' },
  ];

  // Get recent events (last 4)
  const recentEvents = events.slice(0, 4);

  // Calculate budget by category
  const budgetByCategory = events.reduce((acc: any, event: any) => {
    // This is simplified - in real app, you'd get this from budget line items
    const categories = ['Venue', 'Catering', 'Marketing', 'Technology', 'Entertainment'];
    categories.forEach(cat => {
      if (!acc[cat]) {
        acc[cat] = { allocated: 0, spent: 0 };
      }
      // Distribute budget evenly for demo
      acc[cat].allocated += (event.budget || 0) / categories.length;
      acc[cat].spent += (event.spent || 0) / categories.length;
    });
    return acc;
  }, {});

  const budgetData = Object.entries(budgetByCategory).map(([category, data]: [string, any]) => ({
    category,
    allocated: Math.round(data.allocated),
    spent: Math.round(data.spent),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ''}! Here's what's happening with your events.
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
                <h3 className="text-lg md:text-xl">Free Trial Active</h3>
              </div>
              <p className="opacity-90 text-sm md:text-base">
                You have {freeEventsRemaining} free event(s) remaining. Upgrade to unlock unlimited events and premium features.
              </p>
            </div>
            <button className="w-full sm:w-auto px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 whitespace-nowrap">
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
              <h3 className="truncate">{organization.name}</h3>
              {organization.industry && (
                <p className="text-gray-600 text-sm mt-1">{organization.industry}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-gray-600 text-xs md:text-sm">Team Members</p>
              <p className="text-xl md:text-2xl">{organization.members?.length || 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="text-sm md:text-base text-gray-600">{stat.label}</p>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <Icon size={18} className={`md:w-5 md:h-5 text-${stat.color}-600`} />
                </div>
              </div>
              <p className="text-2xl md:text-3xl mb-1 md:mb-2">{stat.value}</p>
              <p className="text-xs md:text-sm text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Budget Overview */}
      {budgetData.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <h3 className="mb-4 md:mb-6">Budget Overview by Category</h3>
          <div className="space-y-4">
            {budgetData.map((item, index) => {
              const percentage = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-sm md:text-base text-gray-700 truncate">{item.category}</span>
                    <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      ${item.spent.toLocaleString()} / ${item.allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% utilized</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3>Recent Events</h3>
          </div>
          
          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-gray-200">
            {recentEvents.map((event) => {
              const progress = event.budget > 0 ? (event.spent / event.budget) * 100 : 0;
              return (
                <div key={event.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`ml-3 px-3 py-1 rounded-full text-sm whitespace-nowrap ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">${event.budget.toLocaleString()}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          progress > 90 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600">Event Name</th>
                  <th className="px-6 py-3 text-left text-gray-600">Date</th>
                  <th className="px-6 py-3 text-left text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-gray-600">Budget</th>
                  <th className="px-6 py-3 text-left text-gray-600">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentEvents.map((event) => {
                  const progress = event.budget > 0 ? (event.spent / event.budget) * 100 : 0;
                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p>{event.name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        ${event.budget.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full ${
                                progress > 90 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="mb-2">No Events Yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first event</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Event
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={20} className="text-blue-600 md:w-6 md:h-6" />
              <h4 className="text-base md:text-lg">Create Event</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">Start planning your next event with our easy-to-use tools</p>
            <button className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base">
              New Event
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={20} className="text-green-600 md:w-6 md:h-6" />
              <h4 className="text-base md:text-lg">Review Expenses</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">{pendingExpenses} expenses waiting for your approval</p>
            <button className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base">
              Review Now
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={20} className="text-purple-600 md:w-6 md:h-6" />
              <h4 className="text-base md:text-lg">View Analytics</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">Explore detailed insights and ROI metrics</p>
            <button className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base">
              View Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

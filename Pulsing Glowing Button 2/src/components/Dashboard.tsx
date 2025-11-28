import { Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Crown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface DashboardProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function Dashboard({ user, organization, isDemo }: DashboardProps) {
  const stats = [
    { label: 'Active Events', value: '12', change: '+2 this month', icon: Calendar, color: 'blue' },
    { label: 'Total Budget', value: '$485K', change: '+12% from last month', icon: DollarSign, color: 'green' },
    { label: 'Pending Approvals', value: '8', change: '3 urgent', icon: Clock, color: 'yellow' },
    { label: 'ROI Average', value: '245%', change: '+18% improvement', icon: TrendingUp, color: 'purple' },
  ];

  const budgetData = [
    { month: 'Jan', budget: 45000, spent: 42000 },
    { month: 'Feb', budget: 52000, spent: 48000 },
    { month: 'Mar', budget: 48000, spent: 51000 },
    { month: 'Apr', budget: 61000, spent: 58000 },
    { month: 'May', budget: 55000, spent: 52000 },
    { month: 'Jun', budget: 67000, spent: 63000 },
  ];

  const expenseCategories = [
    { name: 'Venue', value: 35, color: '#3b82f6' },
    { name: 'Catering', value: 28, color: '#10b981' },
    { name: 'Marketing', value: 18, color: '#f59e0b' },
    { name: 'Entertainment', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 7, color: '#6b7280' },
  ];

  const recentEvents = [
    { name: 'Tech Conference 2024', status: 'active', budget: 125000, spent: 98000, progress: 78 },
    { name: 'Product Launch Event', status: 'planning', budget: 85000, spent: 12000, progress: 14 },
    { name: 'Annual Gala', status: 'active', budget: 95000, spent: 87000, progress: 92 },
    { name: 'Workshop Series', status: 'completed', budget: 45000, spent: 44500, progress: 100 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'planning': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isFreeUser = user?.subscription === 'free';
  const freeEventsRemaining = user?.freeEventsRemaining || 0;

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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={24} />
                <h3>Free Trial Active</h3>
              </div>
              <p className="opacity-90 mb-4">
                You have {freeEventsRemaining} free event(s) remaining. Upgrade to unlock unlimited events and premium features.
              </p>
              <button className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organization Info */}
      {organization && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Organization</p>
              <h3>{organization.name}</h3>
              {organization.industry && (
                <p className="text-gray-600 text-sm mt-1">{organization.industry}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Team Members</p>
              <p className="text-2xl">{organization.members?.length || 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Spent Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-4">Budget vs Actual Spending</h3>
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
        </div>

        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-4">Expense Distribution</h3>
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
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3>Recent Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Event Name</th>
                <th className="px-6 py-3 text-left text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-gray-600">Budget</th>
                <th className="px-6 py-3 text-left text-gray-600">Spent</th>
                <th className="px-6 py-3 text-left text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEvents.map((event, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p>{event.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
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
    </div>
  );
}

import { TrendingUp, TrendingDown, DollarSign, Calendar, Users } from './Icons';

interface AnalyticsProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function Analytics({ user, organization, isDemo }: AnalyticsProps) {
  // Mock data
  const kpiData = [
    { label: 'Total ROI', value: '124%', change: '+8%', trend: 'up', description: 'Return on investment' },
    { label: 'Avg Cost per Attendee', value: '$285', change: '-5%', trend: 'down', description: 'Across all events' },
    { label: 'Budget Accuracy', value: '92%', change: '+3%', trend: 'up', description: 'Staying within budget' },
    { label: 'Vendor Satisfaction', value: '4.5/5', change: '+0.2', trend: 'up', description: 'Average rating' },
  ];

  const monthlyData = [
    { month: 'Jan', budget: 85000, spent: 78000, events: 2 },
    { month: 'Feb', budget: 120000, spent: 115000, events: 3 },
    { month: 'Mar', budget: 95000, spent: 88000, events: 2 },
    { month: 'Apr', budget: 150000, spent: 142000, events: 4 },
    { month: 'May', budget: 110000, spent: 98000, events: 3 },
    { month: 'Jun', budget: 130000, spent: 125000, events: 3 },
  ];

  const categoryData = [
    { category: 'Venue', percentage: 35, amount: 105000, color: 'bg-blue-500' },
    { category: 'Catering', percentage: 25, amount: 75000, color: 'bg-green-500' },
    { category: 'Marketing', percentage: 20, amount: 60000, color: 'bg-purple-500' },
    { category: 'Technology', percentage: 12, amount: 36000, color: 'bg-yellow-500' },
    { category: 'Entertainment', percentage: 8, amount: 24000, color: 'bg-pink-500' },
  ];

  const eventPerformance = [
    { name: 'Annual Tech Conference 2024', budget: 85000, spent: 78000, attendees: 500, roi: 145 },
    { name: 'Product Launch Event', budget: 45000, spent: 42000, attendees: 200, roi: 128 },
    { name: 'Team Building Retreat', budget: 25000, spent: 22000, attendees: 50, roi: 85 },
    { name: 'Customer Appreciation Day', budget: 35000, spent: 33000, attendees: 300, roi: 112 },
  ];

  const maxBudget = Math.max(...monthlyData.map(d => d.budget));
  const maxValue = maxBudget * 1.1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Analytics</h2>
        <p className="text-gray-600 mt-1">Track performance and ROI across all your events</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-2">{kpi.label}</p>
            <p className="text-3xl mb-2">{kpi.value}</p>
            <div className="flex items-center gap-2">
              {kpi.trend === 'up' ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change}
              </span>
              <span className="text-sm text-gray-500">{kpi.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Budget vs Spent Trend */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="mb-6">Budget vs Actual Spending (6 Months)</h3>
        <div className="space-y-4">
          {monthlyData.map((data, index) => {
            const budgetWidth = (data.budget / maxValue) * 100;
            const spentWidth = (data.spent / maxValue) * 100;
            const efficiency = ((data.budget - data.spent) / data.budget) * 100;

            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{data.month}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Budget: ${data.budget.toLocaleString()}
                    </span>
                    <span className="text-blue-600">
                      Spent: ${data.spent.toLocaleString()}
                    </span>
                    <span className={efficiency > 0 ? 'text-green-600' : 'text-red-600'}>
                      {efficiency > 0 ? 'Under' : 'Over'} {Math.abs(efficiency).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-8">
                  {/* Budget bar (background) */}
                  <div
                    className="absolute top-0 h-8 bg-gray-200 rounded"
                    style={{ width: `${budgetWidth}%` }}
                  ></div>
                  {/* Spent bar (foreground) */}
                  <div
                    className={`absolute top-0 h-8 rounded ${
                      data.spent > data.budget ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${spentWidth}%` }}
                  ></div>
                  <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-3 text-white text-sm">
                    {data.events} event{data.events > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">Budgeted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Spent (Under budget)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Spent (Over budget)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-6">Spending by Category</h3>
          <div className="space-y-4">
            {categoryData.map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{cat.category}</span>
                  <div className="text-sm text-gray-600">
                    ${cat.amount.toLocaleString()} ({cat.percentage}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Spending</span>
              <span className="text-2xl">${categoryData.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-6">Performance Metrics</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Events</p>
                  <p className="text-2xl">17</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">This Year</p>
                <p className="text-green-600 flex items-center gap-1 justify-end">
                  <TrendingUp size={16} />
                  <span>+25%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Attendees</p>
                  <p className="text-2xl">2,850</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Across All Events</p>
                <p className="text-green-600 flex items-center gap-1 justify-end">
                  <TrendingUp size={16} />
                  <span>+15%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Avg Event Budget</p>
                  <p className="text-2xl">$47,500</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Per Event</p>
                <p className="text-green-600 flex items-center gap-1 justify-end">
                  <TrendingUp size={16} />
                  <span>+8%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3>Event Performance Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Event Name</th>
                <th className="px-6 py-3 text-left text-gray-600">Budget</th>
                <th className="px-6 py-3 text-left text-gray-600">Spent</th>
                <th className="px-6 py-3 text-left text-gray-600">Efficiency</th>
                <th className="px-6 py-3 text-left text-gray-600">Attendees</th>
                <th className="px-6 py-3 text-left text-gray-600">Cost/Attendee</th>
                <th className="px-6 py-3 text-left text-gray-600">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {eventPerformance.map((event, index) => {
                const efficiency = ((event.budget - event.spent) / event.budget) * 100;
                const costPerAttendee = event.spent / event.attendees;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{event.name}</td>
                    <td className="px-6 py-4 text-gray-700">${event.budget.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-700">${event.spent.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={efficiency >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {efficiency >= 0 ? 'Under' : 'Over'} {Math.abs(efficiency).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{event.attendees}</td>
                    <td className="px-6 py-4 text-gray-700">${costPerAttendee.toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        event.roi >= 120 ? 'bg-green-100 text-green-700' :
                        event.roi >= 100 ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.roi}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <TrendingUp size={24} className="text-green-600 flex-shrink-0" />
            <div>
              <h4 className="mb-2">Strong Performance</h4>
              <p className="text-gray-700 text-sm">
                Your events are averaging 92% budget accuracy, which is excellent. Keep maintaining this level of planning and execution.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <DollarSign size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="mb-2">Cost Optimization</h4>
              <p className="text-gray-700 text-sm">
                Cost per attendee decreased by 5% compared to last quarter. Consider sharing these best practices across teams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

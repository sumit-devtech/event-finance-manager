import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AnalyticsProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function Analytics({ user, organization, isDemo }: AnalyticsProps) {
  const roiData = [
    { event: 'Tech Conf', roi: 245, revenue: 520000, cost: 125000 },
    { event: 'Product Launch', roi: 180, revenue: 238000, cost: 85000 },
    { event: 'Annual Gala', roi: 210, revenue: 290000, cost: 95000 },
    { event: 'Workshop', roi: 195, revenue: 88000, cost: 45000 },
    { event: 'Trade Show', roi: 225, revenue: 337500, cost: 150000 },
  ];

  const monthlyTrends = [
    { month: 'Jan', events: 3, budget: 145000, spent: 142000, roi: 215 },
    { month: 'Feb', events: 5, budget: 245000, spent: 238000, roi: 225 },
    { month: 'Mar', events: 4, budget: 185000, spent: 180000, roi: 210 },
    { month: 'Apr', events: 6, budget: 295000, spent: 287000, roi: 235 },
    { month: 'May', events: 4, budget: 205000, spent: 198000, roi: 220 },
    { month: 'Jun', events: 7, budget: 345000, spent: 335000, roi: 240 },
  ];

  const categoryPerformance = [
    { category: 'Budget Efficiency', score: 92 },
    { category: 'Attendee Satisfaction', score: 88 },
    { category: 'Vendor Performance', score: 85 },
    { category: 'Timeline Adherence', score: 90 },
    { category: 'ROI Achievement', score: 95 },
  ];

  const budgetUtilization = [
    { name: 'Utilized', value: 68, color: '#10b981' },
    { name: 'Remaining', value: 32, color: '#e5e7eb' },
  ];

  const topVendors = [
    { name: 'Grand Convention', value: 450000, events: 12 },
    { name: 'Premium Catering', value: 285000, events: 18 },
    { name: 'Entertainment Plus', value: 195000, events: 15 },
    { name: 'EventStaff Plus', value: 176000, events: 22 },
    { name: 'AdTech Solutions', value: 125000, events: 8 },
  ];

  const kpis = [
    {
      label: 'Average ROI',
      value: '225%',
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Budget Utilization',
      value: '92%',
      change: '+5%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Events This Quarter',
      value: '18',
      change: '+3',
      trend: 'up',
      icon: Calendar,
      color: 'purple',
    },
    {
      label: 'Avg Attendees/Event',
      value: '425',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Analytics & Insights</h2>
        <p className="text-gray-600 mt-1">Track performance metrics and ROI across all events</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                  <Icon className={`text-${kpi.color}-600`} size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{kpi.change}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-2xl">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* ROI Analysis */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="mb-4">Event ROI Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="event" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="cost" fill="#ef4444" name="Cost ($)" />
            <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
            <Bar yAxisId="right" dataKey="roi" fill="#3b82f6" name="ROI (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-4">Monthly Budget Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} name="Budget" />
              <Line type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2} name="Spent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-4">Performance Scorecard</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={categoryPerformance}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Performance" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Utilization & Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-4">Overall Budget Utilization</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={budgetUtilization}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  label={(entry) => `${entry.value}%`}
                >
                  {budgetUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Utilized (68%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm">Remaining (32%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="mb-4">Top Vendors by Spend</h3>
          <div className="space-y-4">
            {topVendors.map((vendor, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p>{vendor.name}</p>
                    <p className="text-sm">${(vendor.value / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(vendor.value / topVendors[0].value) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{vendor.events} events</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3>Event Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Event</th>
                <th className="px-6 py-3 text-right text-gray-600">Cost</th>
                <th className="px-6 py-3 text-right text-gray-600">Revenue</th>
                <th className="px-6 py-3 text-right text-gray-600">ROI</th>
                <th className="px-6 py-3 text-center text-gray-600">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roiData.map((event, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{event.event}</td>
                  <td className="px-6 py-4 text-right text-red-600">
                    ${event.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-green-600">
                    ${event.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {event.roi}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min((event.roi / 300) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {event.roi >= 200 ? 'Excellent' : event.roi >= 150 ? 'Good' : 'Average'}
                      </span>
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

import React from 'react';
import { TrendingUp, DollarSign, Users, Target, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ROIMetrics {
  totalBudget: number;
  actualSpend: number;
  leadsGenerated: number;
  conversions: number;
  revenueGenerated: number;
  roiPercent: number;
}

export const ROIAnalytics: React.FC<{ eventId: string }> = ({ eventId }) => {
  const metrics: ROIMetrics = {
    totalBudget: 50000,
    actualSpend: 42500,
    leadsGenerated: 450,
    conversions: 68,
    revenueGenerated: 125000,
    roiPercent: 194,
  };

  const spendByCategory = [
    { category: 'Venue', amount: 15000, percent: 35 },
    { category: 'Catering', amount: 8500, percent: 20 },
    { category: 'Marketing', amount: 12000, percent: 28 },
    { category: 'Technology', amount: 5000, percent: 12 },
    { category: 'Miscellaneous', amount: 2000, percent: 5 },
  ];

  const conversionFunnel = [
    { stage: 'Attendees', count: 450, percent: 100 },
    { stage: 'Engaged', count: 280, percent: 62 },
    { stage: 'Qualified Leads', count: 150, percent: 33 },
    { stage: 'Conversions', count: 68, percent: 15 },
  ];

  const monthlyPerformance = [
    { month: 'Jan', budget: 10000, spent: 8500, revenue: 20000 },
    { month: 'Feb', budget: 12000, spent: 11200, revenue: 28000 },
    { month: 'Mar', budget: 15000, spent: 13800, revenue: 35000 },
    { month: 'Apr', budget: 13000, spent: 8900, revenue: 42000 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const costPerLead = metrics.actualSpend / metrics.leadsGenerated;
  const costPerConversion = metrics.actualSpend / metrics.conversions;
  const conversionRate = (metrics.conversions / metrics.leadsGenerated) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">ROI Analytics</h2>
            <p className="text-sm text-gray-500">Comprehensive event performance metrics</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Download Report</button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ROI Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded">
              <ArrowUp className="w-4 h-4" />
              +{metrics.roiPercent}%
            </span>
          </div>
          <p className="text-sm opacity-90">Return on Investment</p>
          <p className="text-3xl font-bold mt-2">{metrics.roiPercent}%</p>
          <p className="text-xs mt-2 opacity-75">Revenue: ${metrics.revenueGenerated.toLocaleString()}</p>
        </div>

        {/* Budget vs Spend */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">Under Budget</span>
          </div>
          <p className="text-sm text-gray-600">Budget vs Spend</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.actualSpend.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">
            Budget: ${metrics.totalBudget.toLocaleString()} ({((metrics.actualSpend / metrics.totalBudget) * 100).toFixed(1)}%)
          </p>
        </div>

        {/* Leads Generated */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-gray-500">${costPerLead.toFixed(2)} CPL</span>
          </div>
          <p className="text-sm text-gray-600">Leads Generated</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.leadsGenerated}</p>
          <p className="text-xs text-gray-500 mt-2">Cost per lead: ${costPerLead.toFixed(2)}</p>
        </div>

        {/* Conversions */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-gray-500">{conversionRate.toFixed(1)}% rate</span>
          </div>
          <p className="text-sm text-gray-600">Conversions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.conversions}</p>
          <p className="text-xs text-gray-500 mt-2">Cost per conversion: ${costPerConversion.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Breakdown */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Spending Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              <PieChart>
                <Pie
                  data={spendByCategory}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percent }) => `${category} (${percent}%)`}
                >
                  {spendByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {spendByCategory.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-600">{item.category}</span>
                </div>
                <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              <BarChart data={conversionFunnel} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {conversionFunnel.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{stage.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{stage.count}</span>
                  <span className="text-gray-400">({stage.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Over Time */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Performance Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" minHeight={320}>
            <AreaChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="budget" stackId="1" stroke="#94A3B8" fill="#94A3B8" name="Budget" />
              <Area type="monotone" dataKey="spent" stackId="2" stroke="#3B82F6" fill="#3B82F6" name="Spent" />
              <Area type="monotone" dataKey="revenue" stackId="3" stroke="#10B981" fill="#10B981" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium text-gray-900">Excellent ROI Performance</p>
              <p className="text-sm text-gray-600">Your event generated 194% ROI, significantly above the industry average of 120%.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
            <div>
              <p className="font-medium text-gray-900">Budget Optimization Opportunity</p>
              <p className="text-sm text-gray-600">
                You saved $7,500 from the original budget. Consider reallocating to Marketing for increased lead generation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
            <div>
              <p className="font-medium text-gray-900">Conversion Rate Improvement</p>
              <p className="text-sm text-gray-600">
                Current conversion rate is 15%. Implementing post-event nurture campaigns could increase this to 22%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

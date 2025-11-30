import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Zap, X, CheckCircle } from './Icons';

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'info';
  data: any;
  createdAt: string;
}

interface InsightsPanelProps {
  eventId: string;
  onDismiss?: (insightId: string) => void;
}

export default function InsightsPanel({ eventId, onDismiss }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock insights - in real app, fetch from API
    setTimeout(() => {
      setInsights([
        {
          id: '1',
          type: 'budget_variance',
          title: 'Catering Budget Variance Alert',
          description: 'Catering is over budget by 15.2%. Actual: $57,600 vs Estimated: $50,000',
          severity: 'medium',
          data: {
            category: 'Catering',
            estimated: 50000,
            actual: 57600,
            variance: 7600,
            variancePercentage: 15.2,
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'roi_analysis',
          title: 'Excellent ROI Achievement',
          description: 'Event achieved 124.5% ROI, exceeding expectations with 450 conversions!',
          severity: 'high',
          data: {
            roiPercentage: 124.5,
            conversions: 450,
            revenue: 180000,
            spent: 80000,
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'budget_variance',
          title: 'Marketing Under Budget',
          description: 'Marketing is under budget by 8.5%. Actual: $18,300 vs Estimated: $20,000',
          severity: 'low',
          data: {
            category: 'Marketing',
            estimated: 20000,
            actual: 18300,
            variance: -1700,
            variancePercentage: -8.5,
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          type: 'trend_analysis',
          title: 'Spending Trend Alert',
          description: 'Event spending is 12% higher than similar past events. Review expense categories.',
          severity: 'medium',
          data: {
            currentSpend: 80000,
            averagePastSpend: 71400,
            difference: 8600,
            percentageHigher: 12,
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  }, [eventId]);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-700',
          label: 'High Priority',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700',
          label: 'Medium Priority',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
          label: 'Low Priority',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700',
          label: 'Info',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget_variance':
        return <AlertCircle size={24} />;
      case 'roi_analysis':
        return <TrendingUp size={24} />;
      case 'trend_analysis':
        return <TrendingDown size={24} />;
      default:
        return <Zap size={24} />;
    }
  };

  const filteredInsights = filter === 'all'
    ? insights
    : insights.filter(i => i.type === filter);

  const insightTypes = [
    { value: 'all', label: 'All Insights', count: insights.length },
    { value: 'budget_variance', label: 'Budget Variance', count: insights.filter(i => i.type === 'budget_variance').length },
    { value: 'roi_analysis', label: 'ROI Analysis', count: insights.filter(i => i.type === 'roi_analysis').length },
    { value: 'trend_analysis', label: 'Trends', count: insights.filter(i => i.type === 'trend_analysis').length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={32} />
            <div>
              <h3>AI-Powered Insights</h3>
              <p className="text-purple-100 text-sm mt-1">
                Automated analysis and recommendations
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-100 text-sm">Total Insights</p>
            <p className="text-3xl">{insights.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {insightTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === type.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label} ({type.count})
          </button>
        ))}
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="mb-2">No Insights Available</h4>
          <p className="text-gray-600">
            Insights will be generated automatically as you manage your event budget and expenses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => {
            const config = getSeverityConfig(insight.severity);
            return (
              <div
                key={insight.id}
                className={`border rounded-lg p-6 ${config.bg} ${config.border}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg bg-white ${config.icon}`}>
                      {getTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{insight.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm ${config.badge}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(insight.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(insight.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                      title="Dismiss"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {/* Insight Data */}
                {insight.type === 'budget_variance' && insight.data && (
                  <div className="bg-white rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Estimated</p>
                      <p className="text-lg">${insight.data.estimated.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Actual</p>
                      <p className="text-lg">${insight.data.actual.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Variance</p>
                      <p className={`text-lg ${insight.data.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {insight.data.variance > 0 ? '+' : ''}${insight.data.variance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {insight.type === 'roi_analysis' && insight.data && (
                  <div className="bg-white rounded-lg p-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">ROI</p>
                      <p className="text-lg text-green-600">{insight.data.roiPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Revenue</p>
                      <p className="text-lg">${insight.data.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Spent</p>
                      <p className="text-lg">${insight.data.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Conversions</p>
                      <p className="text-lg">{insight.data.conversions}</p>
                    </div>
                  </div>
                )}

                {insight.type === 'trend_analysis' && insight.data && (
                  <div className="bg-white rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Current Spend</p>
                      <p className="text-lg">${insight.data.currentSpend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Average Past</p>
                      <p className="text-lg">${insight.data.averagePastSpend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Difference</p>
                      <p className="text-lg text-orange-600">+{insight.data.percentageHigher}%</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
        <Zap size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-purple-900 mb-1">How Insights Work</p>
          <p className="text-purple-700 text-sm">
            Our AI continuously analyzes your event data to identify patterns, variances, and opportunities. 
            Insights are generated automatically when significant events occur, such as budget variances exceeding 
            10% or when ROI calculations complete.
          </p>
        </div>
      </div>
    </div>
  );
}

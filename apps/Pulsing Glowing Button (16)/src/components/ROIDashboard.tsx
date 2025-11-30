import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, AlertCircle } from './Icons';

interface ROIDashboardProps {
  event: any;
  onUpdateROIData: (data: any) => Promise<void>;
}

export default function ROIDashboard({ event, onUpdateROIData }: ROIDashboardProps) {
  const [revenue, setRevenue] = useState(event?.revenue || 0);
  const [leadsGenerated, setLeadsGenerated] = useState(event?.leadsGenerated || 0);
  const [conversions, setConversions] = useState(event?.conversions || 0);
  const [saving, setSaving] = useState(false);

  // Calculate metrics
  const actualSpend = event?.spent || 0;
  const roi = actualSpend > 0 ? ((revenue - actualSpend) / actualSpend) * 100 : 0;
  const costPerLead = leadsGenerated > 0 ? actualSpend / leadsGenerated : 0;
  const costPerConversion = conversions > 0 ? actualSpend / conversions : 0;
  const conversionRate = leadsGenerated > 0 ? (conversions / leadsGenerated) * 100 : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateROIData({
        revenue: parseFloat(revenue.toString()),
        leadsGenerated: parseInt(leadsGenerated.toString()),
        conversions: parseInt(conversions.toString()),
      });
    } catch (error) {
      console.error('Error saving ROI data:', error);
    } finally {
      setSaving(false);
    }
  };

  const getROIColor = (roiValue: number) => {
    if (roiValue > 100) return 'text-green-600 bg-green-100';
    if (roiValue > 0) return 'text-blue-600 bg-blue-100';
    return 'text-red-600 bg-red-100';
  };

  const getROIIcon = (roiValue: number) => {
    if (roiValue > 0) return <TrendingUp size={32} className="text-green-600" />;
    return <TrendingDown size={32} className="text-red-600" />;
  };

  const isEventCompleted = event?.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={32} />
            <div>
              <h3>ROI Metrics & Analytics</h3>
              <p className="text-purple-100 text-sm mt-1">
                Track revenue, leads, and return on investment
              </p>
            </div>
          </div>
          {isEventCompleted && (
            <div className={`px-4 py-2 rounded-lg ${getROIColor(roi)}`}>
              <p className="text-sm opacity-75">ROI</p>
              <p className="text-3xl">{roi.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {!isEventCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-900 mb-1">Event In Progress</p>
            <p className="text-yellow-700 text-sm">
              ROI metrics are available for tracking. Mark the event as "Completed" to finalize calculations and generate insights.
            </p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="mb-6">Update ROI Data</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Revenue Generated ($)
            </label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="0.00"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">Total revenue attributed to this event</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              <Users size={16} className="inline mr-2" />
              Leads Generated
            </label>
            <input
              type="number"
              value={leadsGenerated}
              onChange={(e) => setLeadsGenerated(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Number of qualified leads</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              <Target size={16} className="inline mr-2" />
              Conversions
            </label>
            <input
              type="number"
              value={conversions}
              onChange={(e) => setConversions(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Leads converted to customers</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <TrendingUp size={20} />
              <span>Update ROI Metrics</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ROI Percentage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">ROI</p>
            <div className={`p-2 rounded-lg ${roi > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {getROIIcon(roi)}
            </div>
          </div>
          <p className={`text-4xl mb-2 ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {roi.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">
            {roi > 100 ? 'Excellent return!' : roi > 0 ? 'Positive ROI' : 'Negative ROI'}
          </p>
        </div>

        {/* Cost Per Lead */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Cost Per Lead</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-4xl text-blue-600 mb-2">
            ${costPerLead.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            {leadsGenerated} leads generated
          </p>
        </div>

        {/* Cost Per Conversion */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Cost Per Conversion</p>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-4xl text-purple-600 mb-2">
            ${costPerConversion.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            {conversions} conversions
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Conversion Rate</p>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
          <p className="text-4xl text-orange-600 mb-2">
            {conversionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">
            Lead to customer ratio
          </p>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="mb-6">Financial Breakdown</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Budget Allocated</span>
            <span className="text-xl text-gray-900">${(event?.budget || 0).toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Actual Spend</span>
            <span className="text-xl text-gray-900">${actualSpend.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Revenue Generated</span>
            <span className="text-xl text-green-600">${revenue.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
            <span className="text-gray-700">Net Profit/Loss</span>
            <span className={`text-2xl ${revenue - actualSpend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenue - actualSpend >= 0 ? '+' : '-'}${Math.abs(revenue - actualSpend).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      {isEventCompleted && (
        <div className={`border rounded-lg p-6 ${
          roi > 100 ? 'bg-green-50 border-green-300' :
          roi > 0 ? 'bg-blue-50 border-blue-300' :
          'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              roi > 100 ? 'bg-green-200' :
              roi > 0 ? 'bg-blue-200' :
              'bg-red-200'
            }`}>
              {getROIIcon(roi)}
            </div>
            <div className="flex-1">
              <h4 className={
                roi > 100 ? 'text-green-900' :
                roi > 0 ? 'text-blue-900' :
                'text-red-900'
              }>
                {roi > 100 ? 'Outstanding Performance!' :
                 roi > 0 ? 'Positive ROI Achieved' :
                 'ROI Below Target'}
              </h4>
              <p className={`mt-2 ${
                roi > 100 ? 'text-green-700' :
                roi > 0 ? 'text-blue-700' :
                'text-red-700'
              }`}>
                {roi > 100 ? 
                  `This event exceeded expectations with a ${roi.toFixed(1)}% return on investment. Great work!` :
                 roi > 0 ?
                  `This event generated a positive ${roi.toFixed(1)}% ROI with ${conversions} conversions.` :
                  `This event resulted in a ${roi.toFixed(1)}% ROI. Consider reviewing expenses and revenue strategies for future events.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

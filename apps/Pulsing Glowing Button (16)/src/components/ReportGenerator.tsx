import React, { useState } from 'react';
import { FileText, Download, Calendar, DollarSign, TrendingUp, Users, Filter } from 'lucide-react';

interface Report {
  id: string;
  reportType: string;
  eventName: string;
  createdBy: string;
  createdAt: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

export const ReportGenerator: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState('budget-summary');
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedReports] = useState<Report[]>([
    {
      id: '1',
      reportType: 'Budget Summary',
      eventName: 'Annual Tech Summit 2024',
      createdBy: 'John Smith',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      format: 'PDF',
    },
    {
      id: '2',
      reportType: 'Expense Analysis',
      eventName: 'Marketing Workshop',
      createdBy: 'Sarah Johnson',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      format: 'Excel',
    },
    {
      id: '3',
      reportType: 'ROI Metrics',
      eventName: 'Annual Tech Summit 2024',
      createdBy: 'Michael Chen',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      format: 'PDF',
    },
  ]);

  const reportTypes = [
    { value: 'budget-summary', label: 'Budget Summary Report', icon: DollarSign, description: 'Complete budget breakdown with variance analysis' },
    { value: 'expense-analysis', label: 'Expense Analysis Report', icon: TrendingUp, description: 'Detailed expense tracking and categorization' },
    { value: 'roi-metrics', label: 'ROI Metrics Report', icon: TrendingUp, description: 'Return on investment calculations and insights' },
    { value: 'vendor-performance', label: 'Vendor Performance Report', icon: Users, description: 'Vendor ratings, costs, and recommendations' },
    { value: 'financial-summary', label: 'Financial Summary Report', icon: DollarSign, description: 'Comprehensive financial overview' },
    { value: 'custom', label: 'Custom Report', icon: Filter, description: 'Build a custom report with selected metrics' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Simulate download
      alert(`Report generated!\n\nType: ${reportTypes.find(r => r.value === selectedReportType)?.label}\nFormat: ${selectedFormat}\n\nIn a real application, this would download the file.`);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Report Generator</h2>
        </div>
        <p className="text-gray-600">Generate comprehensive reports for your events</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Configure Report</h3>

        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Report Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedReportType(type.value)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedReportType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${selectedReportType === type.value ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Output Format</label>
          <div className="flex gap-3">
            {(['PDF', 'Excel', 'CSV'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedFormat === format
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium">{format}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Date Range (Optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Additional Options</label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
            <span className="text-sm text-gray-700">Include charts and visualizations</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
            <span className="text-sm text-gray-700">Include detailed expense breakdown</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">Include vendor information</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">Include ROI calculations</span>
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate & Download Report
            </>
          )}
        </button>
      </div>

      {/* Recently Generated Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recently Generated Reports</h3>
        <div className="space-y-3">
          {generatedReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{report.reportType}</p>
                  <p className="text-sm text-gray-600">{report.eventName}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span>by {report.createdBy}</span>
                    <span className="px-2 py-0.5 bg-gray-200 rounded">{report.format}</span>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from './Icons';

interface BudgetManagerProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function BudgetManager({ user, organization, isDemo }: BudgetManagerProps) {
  const [selectedEvent, setSelectedEvent] = useState('1');
  const [showAddLine, setShowAddLine] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('current');

  const events = [
    { id: '1', name: 'Annual Tech Conference 2024' },
    { id: '2', name: 'Product Launch Event' },
    { id: '3', name: 'Team Building Retreat' },
  ];

  const versions = [
    { id: 'current', name: 'Current Budget', date: '2024-03-01', status: 'active' },
    { id: 'v2', name: 'Revised Budget v2', date: '2024-02-15', status: 'archived' },
    { id: 'v1', name: 'Initial Budget', date: '2024-01-20', status: 'archived' },
  ];

  const budgetLines = [
    { id: 1, category: 'Venue', item: 'Conference Hall Rental', allocated: 35000, spent: 35000, status: 'approved' },
    { id: 2, category: 'Venue', item: 'AV Equipment', allocated: 12000, spent: 10500, status: 'approved' },
    { id: 3, category: 'Catering', item: 'Breakfast & Lunch', allocated: 28000, spent: 24000, status: 'approved' },
    { id: 4, category: 'Catering', item: 'Coffee Breaks', allocated: 8000, spent: 7200, status: 'approved' },
    { id: 5, category: 'Marketing', item: 'Social Media Ads', allocated: 15000, spent: 15000, status: 'approved' },
    { id: 6, category: 'Marketing', item: 'Print Materials', allocated: 8000, spent: 6500, status: 'pending' },
    { id: 7, category: 'Technology', item: 'Event App', allocated: 12000, spent: 12000, status: 'approved' },
    { id: 8, category: 'Technology', item: 'Registration System', allocated: 6000, spent: 4800, status: 'approved' },
    { id: 9, category: 'Entertainment', item: 'Keynote Speaker', allocated: 20000, spent: 0, status: 'pending' },
    { id: 10, category: 'Entertainment', item: 'Evening Reception Band', allocated: 8000, spent: 0, status: 'pending' },
  ];

  const totalAllocated = budgetLines.reduce((sum, line) => sum + line.allocated, 0);
  const totalSpent = budgetLines.reduce((sum, line) => sum + line.spent, 0);
  const remaining = totalAllocated - totalSpent;
  const percentageSpent = (totalSpent / totalAllocated) * 100;

  const categoryTotals = budgetLines.reduce((acc: any, line) => {
    if (!acc[line.category]) {
      acc[line.category] = { allocated: 0, spent: 0 };
    }
    acc[line.category].allocated += line.allocated;
    acc[line.category].spent += line.spent;
    return acc;
  }, {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Budget Manager</h2>
        <p className="text-gray-600 mt-1">Create and manage event budgets with version control</p>
      </div>

      {/* Event and Version Selectors */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Budget Version</label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {versions.map(version => (
                <option key={version.id} value={version.id}>
                  {version.name} - {new Date(version.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Budget</p>
          <p className="text-3xl mb-2">${totalAllocated.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Allocated across all categories</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Spent</p>
          <p className="text-3xl text-blue-600 mb-2">${totalSpent.toLocaleString()}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                percentageSpent > 90 ? 'bg-red-500' : percentageSpent > 75 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentageSpent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{percentageSpent.toFixed(1)}% of budget</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Remaining</p>
          <p className={`text-3xl mb-2 ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(remaining).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {remaining < 0 ? 'Over budget' : 'Available to spend'}
          </p>
        </div>
      </div>

      {/* Category Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="mb-4">Budget by Category</h3>
        <div className="space-y-4">
          {Object.entries(categoryTotals).map(([category, data]: [string, any]) => {
            const percentage = (data.spent / data.allocated) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{category}</span>
                  <span className="text-sm text-gray-600">
                    ${data.spent.toLocaleString()} / ${data.allocated.toLocaleString()}
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

      {/* Budget Lines */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3>Budget Line Items</h3>
          <button
            onClick={() => setShowAddLine(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Add Line Item</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Category</th>
                <th className="px-6 py-3 text-left text-gray-600">Item</th>
                <th className="px-6 py-3 text-left text-gray-600">Allocated</th>
                <th className="px-6 py-3 text-left text-gray-600">Spent</th>
                <th className="px-6 py-3 text-left text-gray-600">Remaining</th>
                <th className="px-6 py-3 text-left text-gray-600">Status</th>
                <th className="px-6 py-3 text-center text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budgetLines.map((line) => {
                const remaining = line.allocated - line.spent;
                return (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{line.category}</td>
                    <td className="px-6 py-4 text-gray-900">{line.item}</td>
                    <td className="px-6 py-4 text-gray-700">${line.allocated.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-700">${line.spent.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                        ${Math.abs(remaining).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(line.status)}`}>
                        {line.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Version Control Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle size={24} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="mb-2">Version Control</h4>
            <p className="text-gray-700 mb-4">
              Create a new budget version to track changes and maintain a history of revisions.
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create New Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

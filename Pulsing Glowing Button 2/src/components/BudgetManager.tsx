import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface BudgetManagerProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function BudgetManager({ user, organization, isDemo }: BudgetManagerProps) {
  const [selectedEvent, setSelectedEvent] = useState('1');
  const [selectedVersion, setSelectedVersion] = useState('v2');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const events = [
    { id: '1', name: 'Tech Conference 2024' },
    { id: '2', name: 'Product Launch Event' },
    { id: '3', name: 'Annual Gala' },
  ];

  const budgetVersions = [
    { id: 'v1', name: 'Initial Budget', date: '2024-01-15', status: 'draft' },
    { id: 'v2', name: 'Revised Budget', date: '2024-02-01', status: 'final' },
    { id: 'v3', name: 'Current Working', date: '2024-02-15', status: 'draft' },
  ];

  const budgetItems = [
    { id: 1, category: 'Venue', description: 'Conference Hall Rental', vendor: 'Grand Convention Center', estimated: 45000, actual: 45000, status: 'confirmed' },
    { id: 2, category: 'Catering', description: 'Lunch & Refreshments (500 pax)', vendor: 'Premium Catering Co.', estimated: 25000, actual: 0, status: 'pending' },
    { id: 3, category: 'Marketing', description: 'Digital Marketing Campaign', vendor: 'AdTech Solutions', estimated: 15000, actual: 12000, status: 'partial' },
    { id: 4, category: 'Entertainment', description: 'Keynote Speaker Fee', vendor: 'Speaker Bureau Inc.', estimated: 20000, actual: 20000, status: 'confirmed' },
    { id: 5, category: 'Technology', description: 'AV Equipment & Setup', vendor: 'Tech Events Pro', estimated: 12000, actual: 0, status: 'pending' },
    { id: 6, category: 'Staffing', description: 'Event Staff (20 people)', vendor: 'EventStaff Plus', estimated: 8000, actual: 0, status: 'pending' },
  ];

  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimated, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actual, 0);
  const variance = totalEstimated - totalActual;
  const variancePercent = ((variance / totalEstimated) * 100).toFixed(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'partial': return 'bg-blue-100 text-blue-700';
      case 'final': return 'bg-purple-100 text-purple-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Budget Management</h2>
          <p className="text-gray-600 mt-1">Track and manage event budgets and line items</p>
        </div>
        <button
          onClick={() => setIsAddingItem(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          <span>Add Line Item</span>
        </button>
      </div>

      {/* Event and Version Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-gray-700">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-gray-700">Budget Version</label>
            <div className="flex gap-2">
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {budgetVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} ({version.date})
                  </option>
                ))}
              </select>
              <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Estimated</p>
          <p className="text-2xl text-blue-600">${totalEstimated.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Actual</p>
          <p className="text-2xl text-green-600">${totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Variance</p>
          <p className={`text-2xl ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(variance).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {variance >= 0 ? 'Under' : 'Over'} budget by {variancePercent}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(budgetVersions.find(v => v.id === selectedVersion)?.status || 'draft')}`}>
            {budgetVersions.find(v => v.id === selectedVersion)?.status || 'Draft'}
          </span>
          {budgetVersions.find(v => v.id === selectedVersion)?.status === 'final' && (
            <div className="flex items-center gap-1 mt-2 text-purple-600">
              <Check size={16} />
              <span className="text-sm">Finalized</span>
            </div>
          )}
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3>Budget Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Category</th>
                <th className="px-6 py-3 text-left text-gray-600">Description</th>
                <th className="px-6 py-3 text-left text-gray-600">Vendor</th>
                <th className="px-6 py-3 text-right text-gray-600">Estimated</th>
                <th className="px-6 py-3 text-right text-gray-600">Actual</th>
                <th className="px-6 py-3 text-center text-gray-600">Status</th>
                <th className="px-6 py-3 text-center text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budgetItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p>{item.description}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.vendor}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ${item.estimated.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ${item.actual.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}>
                      {item.status}
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
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4">
                  <strong>Total</strong>
                </td>
                <td className="px-6 py-4 text-right">
                  <strong>${totalEstimated.toLocaleString()}</strong>
                </td>
                <td className="px-6 py-4 text-right">
                  <strong>${totalActual.toLocaleString()}</strong>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Alert for over budget */}
      {variance < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800">Budget Alert</p>
            <p className="text-red-700 text-sm mt-1">
              This event is currently over budget by ${Math.abs(variance).toLocaleString()} ({Math.abs(Number(variancePercent))}%). 
              Please review expenses and adjust allocations accordingly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

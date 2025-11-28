import { Link } from "@remix-run/react";
import { useState } from "react";
import { Plus, Edit2, Trash2, Check, AlertCircle, X } from 'lucide-react';
import type { User } from "~/lib/auth";

interface BudgetManagerProps {
  user: User;
  events: any[];
  budgetItems?: any[];
  budgetVersions?: any[];
  isDemo?: boolean;
}

export function BudgetManager({ user, events, budgetItems = [], budgetVersions = [], isDemo = false }: BudgetManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'partial': return 'bg-blue-100 text-blue-700';
      case 'final': return 'bg-purple-100 text-purple-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalEstimated = budgetItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const variance = totalEstimated - totalActual;
  const variancePercent = totalEstimated > 0 ? ((variance / totalEstimated) * 100).toFixed(1) : '0';

  const handleAddItem = () => {
    if (isDemo) {
      setShowAddForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      alert("Demo Mode: Budget line item would be added, but changes aren't saved in demo mode.");
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
          <p className="text-gray-600 mt-1">Track and manage event budgets and line items</p>
          {isDemo && (
            <p className="text-yellow-700 text-sm mt-1">
              Demo Mode: You can add budget items, but changes won't be saved.
            </p>
          )}
        </div>
        {isDemo ? (
          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            <span>Add Line Item</span>
          </button>
        ) : (
          <Link
            to="/budget/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            <span>Add Line Item</span>
          </Link>
        )}
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
            {variance >= 0 ? 'Under' : 'Over'} budget by {Math.abs(Number(variancePercent))}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor('draft')}`}>
            Draft
          </span>
        </div>
      </div>

      {/* Budget Items Table */}
      {budgetItems.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Budget Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Category</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Description</th>
                  <th className="px-6 py-3 text-right text-gray-600 font-medium">Estimated</th>
                  <th className="px-6 py-3 text-right text-gray-600 font-medium">Actual</th>
                  <th className="px-6 py-3 text-center text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budgetItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p>{item.description || item.name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${(item.estimatedCost || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${(item.actualCost || 0).toLocaleString()}
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
                  <td colSpan={2} className="px-6 py-4">
                    <strong>Total</strong>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <strong>${totalEstimated.toLocaleString()}</strong>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <strong>${totalActual.toLocaleString()}</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No budget items yet</p>
          <Link
            to="/budget/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Add Budget Item</span>
          </Link>
        </div>
      )}

      {/* Alert for over budget */}
      {variance < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-semibold">Budget Alert</p>
            <p className="text-red-700 text-sm mt-1">
              This event is currently over budget by ${Math.abs(variance).toLocaleString()} ({Math.abs(Number(variancePercent))}%). 
              Please review expenses and adjust allocations accordingly.
            </p>
          </div>
        </div>
      )}

      {/* Add Line Item Form Modal */}
      {showAddForm && isDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Add Budget Line Item</h3>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="font-medium">Demo Mode</p>
                <p className="text-sm mt-1">This budget item won't be saved in demo mode.</p>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Venue</option>
                    <option>Catering</option>
                    <option>Marketing</option>
                    <option>Entertainment</option>
                    <option>Technology</option>
                    <option>Staffing</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of the budget item"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Vendor</label>
                  <input
                    type="text"
                    placeholder="Vendor name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium">Estimated Cost</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium">Actual Cost</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Status</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>pending</option>
                    <option>confirmed</option>
                    <option>partial</option>
                  </select>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Line Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Form, useNavigation } from '@remix-run/react';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import type { User } from "~/lib/auth";

interface BudgetManagerProps {
  user: User | null;
  organization?: any;
  event?: any;
  budgetItems?: any[];
  isDemo?: boolean;
}

export function BudgetManager({ user, organization, event, budgetItems = [], isDemo = false }: BudgetManagerProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showAddLine, setShowAddLine] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    estimatedCost: '',
    actualCost: '',
    vendor: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Demo budget lines - in real app, fetch from API
  const [demoBudgetLines, setDemoBudgetLines] = useState([
    { id: 1, category: 'Venue', description: 'Conference Hall Rental', estimatedCost: 35000, actualCost: 35000 },
    { id: 2, category: 'Venue', description: 'AV Equipment', estimatedCost: 12000, actualCost: 10500 },
    { id: 3, category: 'Catering', description: 'Breakfast & Lunch', estimatedCost: 28000, actualCost: 24000 },
    { id: 4, category: 'Catering', description: 'Coffee Breaks', estimatedCost: 8000, actualCost: 7200 },
    { id: 5, category: 'Marketing', description: 'Social Media Ads', estimatedCost: 15000, actualCost: 15000 },
    { id: 6, category: 'Marketing', description: 'Print Materials', estimatedCost: 8000, actualCost: 6500 },
    { id: 7, category: 'Technology', description: 'Event App', estimatedCost: 12000, actualCost: 12000 },
    { id: 8, category: 'Technology', description: 'Registration System', estimatedCost: 6000, actualCost: 4800 },
    { id: 9, category: 'Entertainment', description: 'Keynote Speaker', estimatedCost: 20000, actualCost: 0 },
    { id: 10, category: 'Entertainment', description: 'Evening Reception Band', estimatedCost: 8000, actualCost: 0 },
  ]);

  // Use real budget items if available, otherwise use demo data
  const budgetLines = isDemo 
    ? demoBudgetLines 
    : budgetItems.map((item: any) => {
        // Handle Decimal types from Prisma - they can be numbers, strings, or Decimal objects
        const parseDecimal = (value: any): number => {
          if (value === null || value === undefined) return 0;
          if (typeof value === 'number') return value;
          if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
          }
          // If it's a Decimal object with toNumber method
          if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
            return value.toNumber();
          }
          return 0;
        };

        return {
          id: item.id,
          category: item.category,
          description: item.description || '',
          estimatedCost: parseDecimal(item.estimatedCost),
          actualCost: parseDecimal(item.actualCost),
          vendor: item.vendor || '',
        };
      });

  // Reset form after successful submission (for demo mode only)
  useEffect(() => {
    if (isDemo && showAddLine && !editingItem) {
      // In demo mode, form resets are handled in handleSubmit
    }
  }, [isDemo, showAddLine, editingItem]);

  const totalAllocated = budgetLines.reduce((sum, line) => sum + (line.estimatedCost || 0), 0);
  const totalSpent = budgetLines.reduce((sum, line) => sum + (line.actualCost || 0), 0);
  const remaining = totalAllocated - totalSpent;
  const percentageSpent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const categoryTotals = budgetLines.reduce((acc: any, line) => {
    if (!acc[line.category]) {
      acc[line.category] = { allocated: 0, spent: 0 };
    }
    acc[line.category].allocated += (line.estimatedCost || 0);
    acc[line.category].spent += (line.actualCost || 0);
    return acc;
  }, {});

  const handleSubmit = (e: React.FormEvent) => {
    // For demo mode, prevent default and handle manually
    if (isDemo) {
      e.preventDefault();
      setError(null);
      
      if (editingItem) {
        setDemoBudgetLines(demoBudgetLines.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item, 
                category: formData.category,
                description: formData.description,
                estimatedCost: parseFloat(formData.estimatedCost) || 0,
                actualCost: parseFloat(formData.actualCost) || 0,
                vendor: formData.vendor,
              }
            : item
        ));
      } else {
        setDemoBudgetLines([...demoBudgetLines, {
          id: Date.now(),
          category: formData.category,
          description: formData.description,
          estimatedCost: parseFloat(formData.estimatedCost) || 0,
          actualCost: parseFloat(formData.actualCost) || 0,
          vendor: formData.vendor,
        }]);
      }
      setShowAddLine(false);
      setEditingItem(null);
      setFormData({ category: '', description: '', estimatedCost: '', actualCost: '', vendor: '' });
      return;
    }

    // For non-demo, validate - Form will submit automatically
    setError(null);
    if (!event?.id) {
      e.preventDefault();
      setError('Please select an event first');
      return;
    }
    // Regular Form will submit to route action automatically
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      description: item.description || '',
      estimatedCost: (item.estimatedCost || 0).toString(),
      actualCost: (item.actualCost || 0).toString(),
      vendor: item.vendor || '',
    });
    setShowAddLine(true);
    setError(null);
  };

  const handleDelete = (id: string | number) => {
    if (isDemo) {
      setDemoBudgetLines(demoBudgetLines.filter(item => item.id !== id));
    } else {
      if (!confirm('Are you sure you want to delete this budget item?')) {
        return;
      }
      // Create a form and submit it (same pattern as events)
      const form = document.createElement('form');
      form.method = 'post';
      form.action = window.location.pathname;
      
      const intentInput = document.createElement('input');
      intentInput.type = 'hidden';
      intentInput.name = 'intent';
      intentInput.value = 'deleteBudgetItem';
      form.appendChild(intentInput);
      
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'budgetItemId';
      idInput.value = id.toString();
      form.appendChild(idInput);
      
      document.body.appendChild(form);
      form.submit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Budget Manager</h2>
        <p className="text-gray-600 mt-1">Create and manage event budgets with line items</p>
        {event && (
          <p className="text-sm text-gray-500 mt-1">Event: {event.name}</p>
        )}
        {isDemo && (
          <p className="text-yellow-700 text-sm mt-2">Demo Mode: Changes are not saved</p>
        )}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Allocated</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            ${totalAllocated.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            ${totalSpent.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Remaining</div>
          <div className={`text-2xl font-bold mt-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${remaining.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Percentage Spent</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {percentageSpent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryTotals).map(([category, totals]: [string, any]) => (
              <div key={category} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{category}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Allocated: ${totals.allocated.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Spent: ${totals.spent.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Budget Line Items</h3>
          {!isDemo && event?.id && (
            <button
              onClick={() => {
                setShowAddLine(true);
                setEditingItem(null);
                setFormData({ category: '', description: '', estimatedCost: '', actualCost: '', vendor: '' });
                setError(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Line Item
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetLines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No budget items found. Click "Add Line Item" to create one.
                  </td>
                </tr>
              ) : (
                budgetLines.map((line) => {
                  const variance = (line.estimatedCost || 0) - (line.actualCost || 0);
                  return (
                    <tr key={line.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{line.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{line.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(line.estimatedCost || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(line.actualCost || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{line.vendor || '-'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(variance).toLocaleString()} {variance >= 0 ? 'under' : 'over'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {!isDemo && (
                            <>
                              <button
                                onClick={() => handleEdit(line)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(line.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddLine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddLine(false);
                  setEditingItem(null);
                  setFormData({ category: '', description: '', estimatedCost: '', actualCost: '', vendor: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <Form method="post" onSubmit={handleSubmit} className="p-6 space-y-4">
              {isDemo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  <p className="font-medium">Demo Mode</p>
                  <p className="text-sm mt-1">This budget item won't be saved in demo mode.</p>
                </div>
              )}

              <input type="hidden" name="intent" value={editingItem ? "updateBudgetItem" : "createBudgetItem"} />
              {editingItem && <input type="hidden" name="budgetItemId" value={editingItem.id} />}
              {event?.id && <input type="hidden" name="eventId" value={event.id} />}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  <option value="Venue">Venue</option>
                  <option value="Catering">Catering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="StaffTravel">Staff Travel</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost</label>
                  <input
                    type="number"
                    name="actualCost"
                    value={formData.actualCost}
                    onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter vendor name (optional)"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Add'} Line Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLine(false);
                    setEditingItem(null);
                    setFormData({ category: '', description: '', estimatedCost: '', actualCost: '', vendor: '' });
                  }}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

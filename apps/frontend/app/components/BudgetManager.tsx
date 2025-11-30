import { useState, useEffect } from 'react';
import { Form, useNavigation } from '@remix-run/react';
import { Plus, Edit, Trash, X, FileText, User as UserIcon, Clock, Download, Upload } from './Icons';
import type { User } from "~/lib/auth";

interface BudgetManagerProps {
  user: User | null;
  organization?: any;
  event?: any;
  events?: any[]; // Add events array for showing event names
  budgetItems?: any[];
  users?: any[]; // Add users for assigned user dropdown
  isDemo?: boolean;
}

type BudgetItemStatus = 'Pending' | 'Approved' | 'Closed';

interface BudgetLineItem {
  id: string | number;
  category: string;
  subcategory?: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  status: BudgetItemStatus;
  notes?: string;
  fileAttachment?: string;
  assignedUser?: string;
  strategicGoalId?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  vendor?: string;
  eventId?: string;
  eventName?: string;
}

export function BudgetManager({ user, organization, event, events = [], budgetItems = [], users = [], isDemo = false }: BudgetManagerProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showAddLine, setShowAddLine] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetLineItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    estimatedCost: '',
    actualCost: '',
    status: 'Pending' as BudgetItemStatus,
    notes: '',
    assignedUser: '',
    strategicGoalId: '',
    vendor: '',
    fileAttachment: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);

  // Demo budget lines with all new fields
  const [demoBudgetLines, setDemoBudgetLines] = useState<BudgetLineItem[]>([
    { 
      id: 1, 
      category: 'Venue', 
      subcategory: 'Rental',
      description: 'Conference Hall Rental', 
      estimatedCost: 35000, 
      actualCost: 35000,
      variance: 0,
      status: 'Approved',
      notes: 'Booked for 3 days',
      assignedUser: 'Sarah Johnson',
      lastEditedBy: 'Sarah Johnson',
      lastEditedAt: '2024-03-10T10:30:00Z',
    },
    { 
      id: 2, 
      category: 'Venue', 
      subcategory: 'Equipment',
      description: 'AV Equipment', 
      estimatedCost: 12000, 
      actualCost: 10500,
      variance: 1500,
      status: 'Approved',
      notes: 'Negotiated discount',
      assignedUser: 'Mike Davis',
      lastEditedBy: 'Mike Davis',
      lastEditedAt: '2024-03-08T14:20:00Z',
    },
    { 
      id: 3, 
      category: 'Catering', 
      subcategory: 'Meals',
      description: 'Breakfast & Lunch', 
      estimatedCost: 28000, 
      actualCost: 24000,
      variance: 4000,
      status: 'Approved',
      assignedUser: 'Emily Chen',
      lastEditedBy: 'Emily Chen',
      lastEditedAt: '2024-03-09T09:15:00Z',
    },
  ]);

  // Helper function to get event name from eventId
  const getEventName = (eventId: string | undefined): string => {
    if (!eventId) return '';
    const foundEvent = events.find((e: any) => e.id === eventId);
    return foundEvent?.name || '';
  };

  // Use real budget items if available, otherwise use demo data
  const budgetLines: BudgetLineItem[] = isDemo 
    ? demoBudgetLines 
    : budgetItems.map((item: any) => {
        const parseDecimal = (value: any): number => {
          if (value === null || value === undefined) return 0;
          if (typeof value === 'number') return value;
          if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
          }
          if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
            return value.toNumber();
          }
          return 0;
        };

        const estimated = parseDecimal(item.estimatedCost);
        const actual = parseDecimal(item.actualCost);
        const variance = estimated - actual;

        return {
          id: item.id,
          category: item.category,
          subcategory: item.subcategory || '',
          description: item.description || '',
          estimatedCost: estimated,
          actualCost: actual,
          variance,
          status: (item.status || 'Pending') as BudgetItemStatus,
          notes: item.notes || '',
          fileAttachment: item.fileAttachment || '',
          assignedUser: typeof item.assignedUser === 'string' ? item.assignedUser : (item.assignedUser?.fullName || item.assignedUser?.name || item.assignedUser?.email || item.assignedUserId || ''),
          assignedUserId: item.assignedUserId || (typeof item.assignedUser === 'object' && item.assignedUser?.id ? item.assignedUser.id : ''),
          strategicGoalId: item.strategicGoalId || '',
          lastEditedBy: item.lastEditedBy || item.updatedBy || user?.name || 'Unknown',
          lastEditedAt: item.updatedAt || item.lastEditedAt || new Date().toISOString(),
          vendor: item.vendor || '',
          eventId: item.eventId || '', // Store eventId for display
          eventName: getEventName(item.eventId), // Get event name
        };
      });

  // Role-based permissions
  const canEditEstimated = () => {
    if (isDemo) return true;
    const userRole = user?.role?.toLowerCase() || '';
    return ['admin', 'marketing', 'eventmanager'].includes(userRole);
  };

  const canEditActual = () => {
    if (isDemo) return true;
    const userRole = user?.role?.toLowerCase() || '';
    return ['admin', 'finance', 'accountant', 'eventmanager'].includes(userRole);
  };

  const canEditAll = () => {
    if (isDemo) return true;
    const userRole = user?.role?.toLowerCase() || '';
    return ['admin', 'eventmanager'].includes(userRole);
  };

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
    if (isDemo) {
      e.preventDefault();
      setError(null);
      
      const newItem: BudgetLineItem = {
        id: editingItem?.id || Date.now(),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        actualCost: parseFloat(formData.actualCost) || 0,
        variance: (parseFloat(formData.estimatedCost) || 0) - (parseFloat(formData.actualCost) || 0),
        status: formData.status,
        notes: formData.notes,
        assignedUser: formData.assignedUser,
        strategicGoalId: formData.strategicGoalId,
        vendor: formData.vendor,
        lastEditedBy: user?.name || 'Current User',
        lastEditedAt: new Date().toISOString(),
      };

      if (editingItem) {
        setDemoBudgetLines(demoBudgetLines.map(item => 
          item.id === editingItem.id ? newItem : item
        ));
      } else {
        setDemoBudgetLines([...demoBudgetLines, newItem]);
      }
      
      setShowAddLine(false);
      setEditingItem(null);
      setFormData({ 
        category: '', 
        subcategory: '',
        description: '', 
        estimatedCost: '', 
        actualCost: '', 
        status: 'Pending',
        notes: '',
        assignedUser: '',
        strategicGoalId: '',
        vendor: '',
        fileAttachment: null,
      });
      return;
    }

    setError(null);
    // For updates, get eventId from the item being edited
    // For creates, require event to be selected
    if (!editingItem && !event?.id) {
      e.preventDefault();
      setError('Please select an event first');
      return;
    }
  };

  const handleEdit = (item: BudgetLineItem) => {
    setEditingItem(item);
    // Get assignedUserId from the item if available (for form submission)
    const assignedUserId = (item as any).assignedUserId || '';
    setFormData({
      category: item.category || '',
      subcategory: item.subcategory || '',
      description: item.description || '',
      estimatedCost: item.estimatedCost ? item.estimatedCost.toString() : '',
      actualCost: item.actualCost ? item.actualCost.toString() : '',
      status: item.status || 'Pending',
      notes: item.notes || '',
      assignedUser: assignedUserId || item.assignedUser || '', // Use ID for form submission
      strategicGoalId: item.strategicGoalId || '',
      vendor: item.vendor || '',
      fileAttachment: null,
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

  const getStatusColor = (status: BudgetItemStatus) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Get users for user assignment (prefer users prop, fallback to organization members)
  const availableUsers = users.length > 0 ? users : (organization?.members || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Budget Planner</h2>
        <p className="text-gray-600 mt-1">Manage budget line items with detailed tracking and role-based access</p>
        {event ? (
          <p className="text-sm text-gray-500 mt-1">Event: {event.name}</p>
        ) : events.length > 0 && budgetLines.some((line: any) => line.eventId) && (
          <p className="text-sm text-gray-500 mt-1">Showing budgets for all events</p>
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
                setFormData({ 
                  category: '', 
                  subcategory: '',
                  description: '', 
                  estimatedCost: '', 
                  actualCost: '', 
                  status: 'Pending',
                  notes: '',
                  assignedUser: '',
                  strategicGoalId: '',
                  vendor: '',
                  fileAttachment: null,
                });
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
                {!event && events.length > 0 && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetLines.length === 0 ? (
                <tr>
                  <td colSpan={!event && events.length > 0 ? 10 : 9} className="px-6 py-8 text-center text-gray-500">
                    No budget items found. {event?.id ? 'Click "Add Line Item" to create one.' : 'Select an event to add budget items.'}
                  </td>
                </tr>
              ) : (
                budgetLines.map((line) => (
                  <>
                    <tr 
                      key={line.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === line.id ? null : line.id)}
                    >
                      {!event && events.length > 0 && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                          {line.eventName || 'Unknown Event'}
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{line.category}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{line.subcategory || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{line.description}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(line.estimatedCost || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(line.actualCost || 0).toLocaleString()}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
                        line.variance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${Math.abs(line.variance).toLocaleString()} {line.variance >= 0 ? 'under' : 'over'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(line.status)}`}>
                          {line.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {line.assignedUser || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {!isDemo && (
                            <>
                              <button
                                onClick={() => handleEdit(line)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(line.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRow === line.id && (
                      <tr>
                        <td colSpan={!event && events.length > 0 ? 10 : 9} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700 mb-2">Notes</p>
                              <p className="text-gray-600">{line.notes || 'No notes'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-2">File Attachment</p>
                              {line.fileAttachment ? (
                                <a href={line.fileAttachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                  <FileText size={14} />
                                  View Attachment
                                </a>
                              ) : (
                                <p className="text-gray-500">No attachment</p>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-2">Strategic Goal</p>
                              <p className="text-gray-600">{line.strategicGoalId || 'Not mapped'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-2">Vendor</p>
                              <p className="text-gray-600">{line.vendor || '-'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-2">Audit Log</p>
                              <div className="flex items-center gap-2 text-gray-600">
                                <UserIcon size={14} />
                                <span>Last edited by: {line.lastEditedBy || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 mt-1">
                                <Clock size={14} />
                                <span>{formatDate(line.lastEditedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddLine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddLine(false);
                  setEditingItem(null);
                  setFormData({ 
                    category: '', 
                    subcategory: '',
                    description: '', 
                    estimatedCost: '', 
                    actualCost: '', 
                    status: 'Pending',
                    notes: '',
                    assignedUser: '',
                    strategicGoalId: '',
                    vendor: '',
                    fileAttachment: null,
                  });
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
              {editingItem && <input type="hidden" name="budgetItemId" value={editingItem.id.toString()} />}
              {editingItem?.eventId && <input type="hidden" name="eventId" value={editingItem.eventId} />}
              {!editingItem && event?.id && <input type="hidden" name="eventId" value={event.id} />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="Technology">Technology</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Rental, Equipment, Meals"
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Spend
                    {!canEditEstimated() && <span className="text-gray-400 text-xs ml-2">(Read-only)</span>}
                  </label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    min="0"
                    step="0.01"
                    disabled={!canEditEstimated()}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !canEditEstimated() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Spend
                    {!canEditActual() && <span className="text-gray-400 text-xs ml-2">(Read-only)</span>}
                  </label>
                  <input
                    type="number"
                    name="actualCost"
                    value={formData.actualCost}
                    onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                    min="0"
                    step="0.01"
                    disabled={!canEditActual()}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !canEditActual() ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BudgetItemStatus })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned User</label>
                  <select
                    name="assignedUser"
                    value={formData.assignedUser}
                    onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select user</option>
                    {availableUsers.map((member: any) => {
                      const userId = member.id;
                      const displayName = member.fullName || member.name || member.email || 'Unknown';
                      return (
                        <option key={userId} value={userId}>
                          {displayName}
                        </option>
                      );
                    })}
                  </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strategic Goal Mapping</label>
                <input
                  type="text"
                  name="strategicGoalId"
                  value={formData.strategicGoalId}
                  onChange={(e) => setFormData({ ...formData, strategicGoalId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter strategic goal ID or name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Attachment</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    name="fileAttachment"
                    onChange={(e) => setFormData({ ...formData, fileAttachment: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.fileAttachment && (
                    <span className="text-sm text-gray-600">{formData.fileAttachment.name}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingItem ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingItem ? 'Update' : 'Add'
                  )} Line Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLine(false);
                    setEditingItem(null);
                    setFormData({ 
                      category: '', 
                      subcategory: '',
                      description: '', 
                      estimatedCost: '', 
                      actualCost: '', 
                      status: 'Pending',
                      notes: '',
                      assignedUser: '',
                      strategicGoalId: '',
                      vendor: '',
                      fileAttachment: null,
                    });
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

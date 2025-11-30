import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Download, Check, X, Clock, AlertCircle } from 'lucide-react';
import { useFetcher } from "@remix-run/react";
import type { User } from "~/lib/auth";

interface ExpenseTrackerProps {
  user: User | null;
  organization?: any;
  event?: any;
  expenses?: any[];
  isDemo?: boolean;
  fetcher?: any;
}

export function ExpenseTracker({ user, organization, event, expenses: initialExpenses = [], isDemo = false, fetcher }: ExpenseTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    amount: '',
    vendor: '',
    description: '',
    eventId: event?.id || '',
  });

  // Transform API expenses to component format
  const transformExpense = (exp: any) => ({
    id: exp.id,
    event: exp.event?.name || 'Unknown Event',
    category: exp.category || 'Miscellaneous',
    item: exp.title,
    amount: exp.amount,
    vendor: exp.vendor || exp.vendorLink?.name || 'N/A',
    date: exp.createdAt ? new Date(exp.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    submittedBy: exp.creator?.fullName || exp.creator?.email || 'Unknown',
    status: exp.status?.toLowerCase() || 'pending',
    approver: exp.workflows?.find((w: any) => w.action === 'approved')?.approver?.fullName,
    notes: exp.description,
  });

  // Transform API expenses to component format
  const transformedExpenses = initialExpenses.map(transformExpense);

  const [expenses, setExpenses] = useState(() => {
    if (isDemo) {
      return [
    {
      id: 1,
      event: event?.name || 'Annual Tech Conference 2024',
      category: 'Venue',
      item: 'Conference Hall Rental',
      amount: 35000,
      vendor: 'Moscone Center',
      date: '2024-02-15',
      submittedBy: user?.name || 'Sarah Johnson',
      status: 'approved',
      approver: 'Mike Davis',
      notes: 'Full payment for 3-day rental',
    },
    {
      id: 2,
      event: event?.name || 'Annual Tech Conference 2024',
      category: 'Catering',
      item: 'Lunch Catering - Day 1',
      amount: 8500,
      vendor: 'Gourmet Catering Co',
      date: '2024-03-15',
      submittedBy: user?.name || 'Emily Chen',
      status: 'pending',
      notes: '500 attendees x $17 per person',
    },
    {
      id: 3,
      event: event?.name || 'Product Launch Event',
      category: 'Marketing',
      item: 'Social Media Campaign',
      amount: 12000,
      vendor: 'Digital Marketing Agency',
      date: '2024-02-20',
      submittedBy: user?.name || 'Mike Davis',
      status: 'approved',
      approver: 'Sarah Johnson',
      notes: 'Month-long campaign',
    },
    {
      id: 4,
      event: event?.name || 'Annual Tech Conference 2024',
      category: 'Technology',
      item: 'Event Mobile App',
      amount: 12000,
      vendor: 'TechSolutions Inc',
      date: '2024-01-30',
      submittedBy: user?.name || 'Sarah Johnson',
      status: 'approved',
      approver: 'Mike Davis',
      notes: 'Custom app development',
    },
  ];
    } else {
      return transformedExpenses;
    }
  });

  // Sync expenses from props when they change
  useEffect(() => {
    if (!isDemo && initialExpenses.length >= 0) {
      const transformed = initialExpenses.map(transformExpense);
      setExpenses(transformed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExpenses, isDemo]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.event.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || expense.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <X size={16} />;
      default: return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      setExpenses([...expenses, {
        id: Date.now(),
        event: event?.name || 'Event',
        category: formData.category,
        item: formData.title,
        amount: parseFloat(formData.amount) || 0,
        vendor: formData.vendor,
        date: new Date().toISOString().split('T')[0],
        submittedBy: user?.name || 'User',
        status: 'pending',
        notes: formData.description,
      }]);
      setShowAddExpense(false);
      setFormData({ category: '', title: '', amount: '', vendor: '', description: '', eventId: event?.id || '' });
    } else if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "create");
      formDataToSubmit.append("eventId", formData.eventId || event?.id || '');
      formDataToSubmit.append("category", formData.category);
      formDataToSubmit.append("title", formData.title);
      formDataToSubmit.append("amount", formData.amount);
      if (formData.vendor) formDataToSubmit.append("vendor", formData.vendor);
      if (formData.description) formDataToSubmit.append("description", formData.description);

      fetcher.submit(formDataToSubmit, { method: "post" });
      setShowAddExpense(false);
      setFormData({ category: '', title: '', amount: '', vendor: '', description: '', eventId: event?.id || '' });
    }
  };

  const handleApprove = (id: string | number) => {
    if (isDemo) {
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, status: 'approved', approver: user?.name || 'Approver' } : exp
      ));
    } else if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "approve");
      formDataToSubmit.append("expenseId", String(id));

      fetcher.submit(formDataToSubmit, { method: "post" });
    }
  };

  const handleReject = (id: string | number) => {
    if (isDemo) {
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, status: 'rejected', approver: user?.name || 'Approver' } : exp
      ));
    } else if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "reject");
      formDataToSubmit.append("expenseId", String(id));

      fetcher.submit(formDataToSubmit, { method: "post" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Tracker</h2>
          <p className="text-gray-600 mt-1">Track and approve expenses for your events</p>
          {isDemo && (
            <p className="text-yellow-700 text-sm mt-2">Demo Mode: Changes are not saved</p>
          )}
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition-colors"
        >
          <Plus size={20} />
          <span>Submit Expense</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Expenses</p>
          <p className="text-3xl font-bold mb-2">${totalExpenses.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{expenses.length} submissions</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Approved</p>
          <p className="text-3xl text-green-600 font-bold mb-2">${approvedTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{statusCounts.approved} expenses</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Pending Approval</p>
          <p className="text-3xl text-yellow-600 font-bold mb-2">${pendingTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{statusCounts.pending} expenses</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({statusCounts.approved})
            </button>
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {statusCounts.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">
              You have {statusCounts.pending} expense{statusCounts.pending > 1 ? 's' : ''} waiting for approval
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Total pending amount: ${pendingTotal.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Expense Submissions</h3>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Date</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Event</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Item</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Vendor</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Amount</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Submitted By</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Status</th>
                <th className="px-6 py-3 text-center text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{expense.event}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{expense.item}</p>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{expense.vendor}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">${expense.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-700">{expense.submittedBy}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${getStatusColor(expense.status)}`}>
                      {getStatusIcon(expense.status)}
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {expense.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(expense.id)}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleReject(expense.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="mb-2 font-semibold text-lg">No expenses found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search' : 'No expenses submitted yet'}
          </p>
        </div>
      )}

      {/* Add Expense Form Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Submit New Expense</h3>
              <button 
                onClick={() => {
                  setShowAddExpense(false);
                  setFormData({ category: '', item: '', amount: '', vendor: '', date: '', notes: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {isDemo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  <p className="font-medium">Demo Mode</p>
                  <p className="text-sm mt-1">This expense won't be saved in demo mode.</p>
                </div>
              )}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Venue">Venue</option>
                  <option value="Catering">Catering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Technology">Technology</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Staffing">Staffing</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Item Description *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Conference Hall Rental"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Vendor</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Notes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Additional information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Receipt (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-gray-400 text-sm mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpense(false);
                    setFormData({ category: '', item: '', amount: '', vendor: '', date: '', notes: '' });
                  }}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Download, Check, X, Clock, AlertCircle } from 'lucide-react';
import { useFetcher } from "@remix-run/react";
import type { User } from "~/lib/auth";
import type { ExpenseWithVendor, VendorWithStats, EventWithDetails } from "~/types";
import { FilterBar, DataTable, SummaryStats, EmptyState } from "./shared";
import toast from "react-hot-toast";
import type { FilterConfig, TableColumn, SummaryStat } from "~/types";
import { getExpenseStatusColor } from "~/lib/utils";

interface ExpenseTrackerProps {
  user: User | null;
  organization?: { name?: string } | null;
  event?: EventWithDetails | null;
  expenses?: ExpenseWithVendor[];
  vendors?: VendorWithStats[];
  isDemo?: boolean;
  fetcher?: ReturnType<typeof useFetcher>;
}

export function ExpenseTracker({ user, organization, event, expenses: initialExpenses = [], vendors = [], isDemo = false, fetcher }: ExpenseTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isFinance = user?.role === 'Finance';
  const isViewer = user?.role === 'Viewer';

  // Check if user can create expenses
  const canCreateExpense = isAdmin || isEventManager || isFinance || isDemo;

  // Check if user can approve/reject expenses (Admin and EventManager only)
  const canApproveExpense = isAdmin || isEventManager || isDemo;
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    amount: '',
    vendorId: '',
    description: '',
    eventId: event?.id || '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      category: 'Logistics',
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

  // Handle fetcher state changes
  useEffect(() => {
    if (fetcher?.data?.error) {
      setSubmitError(fetcher.data.error);
      setShowAddExpense(true); // Keep form open on error
    } else if (fetcher?.state === "idle" && fetcher?.data && !fetcher.data.error) {
      // Success - close form and clear error
      setShowAddExpense(false);
      setSubmitError(null);
      setFormData({ category: '', title: '', amount: '', vendorId: '', description: '', eventId: event?.id || '', date: new Date().toISOString().split('T')[0] });
      setSelectedFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher?.data, fetcher?.state]);

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

  const getStatusColor = getExpenseStatusColor;

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
      setFormData({ category: '', title: '', amount: '', vendorId: '', description: '', eventId: event?.id || '', date: new Date().toISOString().split('T')[0] });
      setSelectedFile(null);
    } else if (fetcher) {
      // Clear previous errors
      setSubmitError(null);

      // Validate required fields
      if (!formData.category) {
        setSubmitError("Category is required");
        return;
      }
      if (!formData.title || !formData.title.trim()) {
        setSubmitError("Title is required");
        return;
      }
      if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
        setSubmitError("Valid amount is required");
        return;
      }

      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "createExpense");
      formDataToSubmit.append("eventId", formData.eventId || event?.id || '');
      formDataToSubmit.append("category", formData.category);
      formDataToSubmit.append("title", formData.title);
      formDataToSubmit.append("amount", formData.amount);
      if (formData.vendorId) formDataToSubmit.append("vendorId", formData.vendorId);
      if (formData.description) formDataToSubmit.append("description", formData.description);
      if (selectedFile) {
        formDataToSubmit.append("file", selectedFile);
      }

      fetcher.submit(formDataToSubmit, { method: "post" });
      // Don't close form immediately - let useEffect handle it based on success/error
    }
  };

  const handleApprove = (id: string | number) => {
    if (isDemo) {
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, status: 'approved', approver: user?.name || 'Approver' } : exp
      ));
    } else if (fetcher) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "approveExpense");
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
      formDataToSubmit.append("intent", "rejectExpense");
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
        {canCreateExpense && (
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition-colors"
          >
            <Plus size={20} />
            <span>Submit Expense</span>
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <SummaryStats
        stats={[
          {
            label: "Total Expenses",
            value: `$${totalExpenses.toLocaleString()}`,
            description: `${expenses.length} submissions`,
          },
          {
            label: "Approved",
            value: `$${approvedTotal.toLocaleString()}`,
            description: `${statusCounts.approved} expenses`,
            color: "text-green-600",
          },
          {
            label: "Pending Approval",
            value: `$${pendingTotal.toLocaleString()}`,
            description: `${statusCounts.pending} expenses`,
            color: "text-yellow-600",
          },
        ]}
      />

      {/* Filters and Search */}
      <FilterBar
        searchPlaceholder="Search expenses..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: "all", label: `All (${statusCounts.all})` },
              { value: "pending", label: `Pending (${statusCounts.pending})` },
              { value: "approved", label: `Approved (${statusCounts.approved})` },
              { value: "rejected", label: `Rejected (${statusCounts.rejected})` },
            ],
          },
        ]}
      />

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
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={<AlertCircle size={48} className="text-gray-400" />}
          title="No expenses found"
          description={searchQuery ? 'Try adjusting your search' : 'No expenses submitted yet'}
        />
      ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Expense Submissions</h3>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
            <div className="p-6">
              <DataTable
                columns={[
                  {
                    key: "date",
                    label: "Date",
                    render: (expense) => new Date(expense.date).toLocaleDateString(),
                  },
                  {
                    key: "event",
                    label: "Event",
                  },
                  {
                    key: "item",
                    label: "Item",
                    render: (expense) => (
                      <div>
                        <p className="text-gray-900 font-medium">{expense.item}</p>
                        <p className="text-sm text-gray-500">{expense.category}</p>
                      </div>
                    ),
                  },
                  {
                    key: "vendor",
                    label: "Vendor",
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    align: "right",
                    render: (expense) => (
                      <span className="font-semibold">${expense.amount.toLocaleString()}</span>
                    ),
                  },
                  {
                    key: "submittedBy",
                    label: "Submitted By",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (expense) => (
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${getStatusColor(expense.status)}`}>
                      {getStatusIcon(expense.status)}
                      {expense.status}
                    </span>
                    ),
                  },
                ]}
                data={filteredExpenses}
                actions={(expense) => (
                  <div className="flex items-center justify-center gap-2">
                    {expense.status === 'pending' && canApproveExpense && (
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
                )}
              />
            </div>
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
                  setFormData({ category: '', title: '', amount: '', vendorId: '', description: '', eventId: event?.id || '', date: new Date().toISOString().split('T')[0] });
                  setSelectedFile(null);
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
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{submitError}</p>
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
                  <option value="Logistics">Logistics</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="StaffTravel">Staff Travel</option>
                  <option value="Miscellaneous">Miscellaneous</option>
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
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No vendor selected</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} {vendor.serviceType ? `(${vendor.serviceType})` : ''}
                    </option>
                  ))}
                </select>
                {vendors.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No vendors available. <a href="/vendors" className="text-blue-600 hover:underline">Add vendors</a></p>
                )}
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
                  <input
                    type="file"
                    id="expense-file-upload"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File size must be less than 10MB');
                          e.target.value = '';
                          return;
                        }
                        setSelectedFile(file);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="expense-file-upload"
                    className="cursor-pointer block"
                  >
                    {selectedFile ? (
                      <div>
                        <p className="text-green-600 font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-gray-400 text-sm mt-1">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        const input = document.getElementById('expense-file-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  )}
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

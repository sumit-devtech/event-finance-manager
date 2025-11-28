import { useState } from 'react';
import { Plus, Filter, Search, Download, Check, X, Clock, AlertCircle } from 'lucide-react';

interface ExpenseTrackerProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function ExpenseTracker({ user, organization, isDemo }: ExpenseTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const expenses = [
    {
      id: 1,
      eventName: 'Tech Conference 2024',
      category: 'Venue',
      description: 'Conference Hall Deposit',
      vendor: 'Grand Convention Center',
      amount: 15000,
      date: '2024-02-01',
      submittedBy: 'John Smith',
      status: 'approved',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-02-02',
    },
    {
      id: 2,
      eventName: 'Tech Conference 2024',
      category: 'Marketing',
      description: 'Social Media Ads',
      vendor: 'AdTech Solutions',
      amount: 5000,
      date: '2024-02-05',
      submittedBy: 'Mike Davis',
      status: 'pending',
    },
    {
      id: 3,
      eventName: 'Product Launch Event',
      category: 'Catering',
      description: 'Coffee & Snacks Setup',
      vendor: 'Premium Catering Co.',
      amount: 2500,
      date: '2024-02-10',
      submittedBy: 'Emily Chen',
      status: 'approved',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-02-11',
    },
    {
      id: 4,
      eventName: 'Annual Gala',
      category: 'Entertainment',
      description: 'Live Band Performance',
      vendor: 'Entertainment Plus',
      amount: 8000,
      date: '2024-02-12',
      submittedBy: 'Robert Wilson',
      status: 'pending',
    },
    {
      id: 5,
      eventName: 'Tech Conference 2024',
      category: 'Technology',
      description: 'Projector Rental',
      vendor: 'Tech Events Pro',
      amount: 1200,
      date: '2024-02-14',
      submittedBy: 'Amanda Lee',
      status: 'rejected',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-02-15',
      rejectionReason: 'Already included in venue package',
    },
    {
      id: 6,
      eventName: 'Product Launch Event',
      category: 'Marketing',
      description: 'Press Release Distribution',
      vendor: 'PR Newswire',
      amount: 3500,
      date: '2024-02-16',
      submittedBy: 'John Smith',
      status: 'pending',
    },
  ];

  const filteredExpenses = filterStatus === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check size={16} />;
      case 'rejected': return <X size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingCount = expenses.filter(exp => exp.status === 'pending').length;
  const approvedTotal = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Expense Tracker</h2>
          <p className="text-gray-600 mt-1">Submit and manage event expenses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          <span>Submit Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Expenses</p>
          <p className="text-2xl">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Approved</p>
          <p className="text-2xl text-green-600">${approvedTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Pending Approval</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl text-yellow-600">{pendingCount}</p>
            <Clock className="text-yellow-600" size={20} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 justify-center">
            <Download size={20} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="mb-1">{expense.description}</h3>
                      <p className="text-gray-600 text-sm">{expense.eventName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(expense.status)}`}>
                      {getStatusIcon(expense.status)}
                      {expense.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="mt-1">{expense.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vendor</p>
                      <p className="mt-1">{expense.vendor}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="mt-1">${expense.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {expense.status === 'approved' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                      Approved by {expense.approvedBy} on {expense.approvalDate}
                    </div>
                  )}

                  {expense.status === 'rejected' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="text-red-800">Rejected by {expense.approvedBy}</p>
                          <p className="text-red-700 mt-1">{expense.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {expense.status === 'pending' && (
                  <div className="flex lg:flex-col gap-2">
                    <button className="flex-1 lg:flex-initial px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center">
                      <Check size={16} />
                      <span>Approve</span>
                    </button>
                    <button className="flex-1 lg:flex-initial px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 justify-center">
                      <X size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Expense Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3>Submit New Expense</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700">Event</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Tech Conference 2024</option>
                    <option>Product Launch Event</option>
                    <option>Annual Gala</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Category</label>
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
                  <label className="block mb-2 text-gray-700">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of the expense"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Vendor</label>
                  <input
                    type="text"
                    placeholder="Vendor name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-700">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-gray-400 text-sm mt-1">PDF, PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Plus, Filter, Search, Download, Check, X, Clock, AlertCircle } from './Icons';

interface ExpenseTrackerProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function ExpenseTracker({ user, organization, isDemo }: ExpenseTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const expenses = [
    {
      id: 1,
      event: 'Annual Tech Conference 2024',
      category: 'Venue',
      item: 'Conference Hall Rental',
      amount: 35000,
      vendor: 'Moscone Center',
      date: '2024-02-15',
      submittedBy: 'Sarah Johnson',
      status: 'approved',
      approver: 'Mike Davis',
      notes: 'Full payment for 3-day rental',
    },
    {
      id: 2,
      event: 'Annual Tech Conference 2024',
      category: 'Catering',
      item: 'Lunch Catering - Day 1',
      amount: 8500,
      vendor: 'Gourmet Catering Co',
      date: '2024-03-15',
      submittedBy: 'Emily Chen',
      status: 'pending',
      notes: '500 attendees x $17 per person',
    },
    {
      id: 3,
      event: 'Product Launch Event',
      category: 'Marketing',
      item: 'Social Media Campaign',
      amount: 12000,
      vendor: 'Digital Marketing Agency',
      date: '2024-02-20',
      submittedBy: 'Mike Davis',
      status: 'approved',
      approver: 'Sarah Johnson',
      notes: 'Month-long campaign',
    },
    {
      id: 4,
      event: 'Annual Tech Conference 2024',
      category: 'Technology',
      item: 'Event Mobile App',
      amount: 12000,
      vendor: 'TechSolutions Inc',
      date: '2024-01-30',
      submittedBy: 'Sarah Johnson',
      status: 'approved',
      approver: 'Mike Davis',
      notes: 'Custom app development',
    },
    {
      id: 5,
      event: 'Team Building Retreat',
      category: 'Venue',
      item: 'Resort Accommodation',
      amount: 15000,
      vendor: 'Mountain Resort',
      date: '2024-03-10',
      submittedBy: 'Emily Chen',
      status: 'pending',
      notes: '50 rooms for 3 nights',
    },
    {
      id: 6,
      event: 'Product Launch Event',
      category: 'Marketing',
      item: 'Print Materials',
      amount: 3500,
      vendor: 'Print Pro',
      date: '2024-03-01',
      submittedBy: 'Mike Davis',
      status: 'rejected',
      approver: 'Sarah Johnson',
      notes: 'Over budget - find alternative',
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Expense Tracker</h2>
          <p className="text-gray-600 mt-1">Track and approve expenses for your events</p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          <span>Submit Expense</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Expenses</p>
          <p className="text-3xl mb-2">${totalExpenses.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{expenses.length} submissions</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Approved</p>
          <p className="text-3xl text-green-600 mb-2">${approvedTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{statusCounts.approved} expenses</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Pending Approval</p>
          <p className="text-3xl text-yellow-600 mb-2">${pendingTotal.toLocaleString()}</p>
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
            <p className="text-yellow-800">
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
          <h3>Expense Submissions</h3>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-gray-600">Event</th>
                <th className="px-6 py-3 text-left text-gray-600">Item</th>
                <th className="px-6 py-3 text-left text-gray-600">Vendor</th>
                <th className="px-6 py-3 text-left text-gray-600">Amount</th>
                <th className="px-6 py-3 text-left text-gray-600">Submitted By</th>
                <th className="px-6 py-3 text-left text-gray-600">Status</th>
                <th className="px-6 py-3 text-center text-gray-600">Actions</th>
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
                    <p className="text-gray-900">{expense.item}</p>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{expense.vendor}</td>
                  <td className="px-6 py-4 text-gray-900">${expense.amount.toLocaleString()}</td>
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
                          <button className="p-2 hover:bg-green-50 rounded-lg text-green-600">
                            <Check size={16} />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg text-red-600">
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
          <h3 className="mb-2">No expenses found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search' : 'No expenses submitted yet'}
          </p>
        </div>
      )}
    </div>
  );
}

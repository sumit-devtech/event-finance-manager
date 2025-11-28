import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Plus, Filter, Search, Download, Check, X, Clock, AlertCircle } from 'lucide-react';
import type { User } from "~/lib/auth";

interface ExpenseTrackerProps {
  user: User;
  expenses: any[];
  isDemo?: boolean;
}

export function ExpenseTracker({ user, expenses = [], isDemo = false }: ExpenseTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <Check size={16} />;
      case 'rejected': return <X size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const pendingCount = expenses.filter(exp => exp.status === 'pending').length;
  const approvedTotal = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const handleSubmitExpense = () => {
    if (isDemo) {
      setShowAddForm(true);
    } else {
      navigate("/expenses/new");
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      alert("Demo Mode: Expense would be submitted, but changes aren't saved in demo mode.");
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Tracker</h2>
          <p className="text-gray-600 mt-1">Submit and manage event expenses</p>
          {isDemo && (
            <p className="text-yellow-700 text-sm mt-1">
              Demo Mode: You can submit expenses, but changes won't be saved.
            </p>
          )}
        </div>
        <button
          onClick={handleSubmitExpense}
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
          <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Approved</p>
          <p className="text-2xl font-bold text-green-600">${approvedTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Pending Approval</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <Clock className="text-yellow-600" size={20} />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length > 0 ? (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="mb-1 font-semibold">{expense.description || expense.name || 'Untitled Expense'}</h3>
                        {expense.event && (
                          <p className="text-gray-600 text-sm">{expense.event.name || expense.eventId}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(expense.status)}`}>
                        {getStatusIcon(expense.status)}
                        {expense.status || 'pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="mt-1">{expense.category || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Vendor</p>
                        <p className="mt-1">{expense.vendor || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="mt-1 font-semibold">${(expense.amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="mt-1">{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No expenses yet</p>
          <button
            onClick={handleSubmitExpense}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Submit Expense</span>
          </button>
        </div>
      )}

      {/* Add Expense Form Modal */}
      {showAddForm && isDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Submit New Expense</h3>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="font-medium">Demo Mode</p>
                <p className="text-sm mt-1">This expense won't be saved in demo mode.</p>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Event</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Tech Conference 2024</option>
                    <option>Product Launch Event</option>
                    <option>Annual Gala</option>
                  </select>
                </div>
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
                    placeholder="Brief description of the expense"
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
                    <label className="block mb-2 text-gray-700 font-medium">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-gray-400 text-sm mt-1">PDF, PNG, JPG up to 10MB</p>
                  </div>
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
                    Submit Expense
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


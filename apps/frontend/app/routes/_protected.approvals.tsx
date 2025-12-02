import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import type { ExpenseWithVendor } from "~/types";
import { FilterBar, DataTable, SummaryStats, EmptyState, ConfirmDialog } from "~/components/shared";
import { Check, X, Clock, AlertCircle, FileText, CheckCircle } from "~/components/Icons";
import toast from "react-hot-toast";
import { useState, useMemo } from "react";
import type { FilterConfig, TableColumn } from "~/types";
import { getExpenseStatusColor, formatCurrency, formatDate } from "~/lib/utils";
import { demoApprovalExpenses } from "~/lib/demoData";

interface LoaderData {
  user: User | null;
  pendingExpenses: ExpenseWithVendor[];
  allExpenses: ExpenseWithVendor[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  if (isDemo) {
    // Return demo data from centralized file
    return json<LoaderData>({ 
      user: null as any, 
      pendingExpenses: demoApprovalExpenses,
      allExpenses: demoApprovalExpenses,
    });
  }

  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch all expenses with Pending status
    const allExpenses = await api.get<ExpenseWithVendor[]>("/expenses", {
      token: token || undefined,
    }) || [];

    const pendingExpenses = allExpenses.filter(exp => exp.status === 'Pending');

    return json<LoaderData>({ 
      user, 
      pendingExpenses,
      allExpenses,
    });
  } catch (error: unknown) {
    console.error("Error fetching approvals:", error);
    return json<LoaderData>({ user, pendingExpenses: [], allExpenses: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  if (isDemo) {
    return json({ success: true, message: "Demo mode: Changes are not saved" });
  }

  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const expenseId = formData.get("expenseId") as string;
  const comments = formData.get("comments") as string || undefined;

  if (!expenseId) {
    return json({ error: "Expense ID is required" }, { status: 400 });
  }

  try {
    if (intent === "approve" || intent === "reject") {
      await api.post(
        `/expenses/${expenseId}/approve`,
        {
          action: intent === "approve" ? "approve" : "reject",
          comments,
        },
        { token: token || undefined }
      );

      return json({ success: true, message: `Expense ${intent === "approve" ? "approved" : "rejected"} successfully` });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return json({ error: errorMessage }, { status: 500 });
  }
}

export default function ApprovalsRoute() {
  const { user, pendingExpenses, allExpenses } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithVendor | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');

  // Role-based access
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const canApprove = isAdmin || isEventManager || isDemo;

  // Get unique events and categories for filters
  const events = useMemo(() => {
    const eventMap = new Map();
    allExpenses.forEach(exp => {
      if (exp.event) {
        eventMap.set(exp.event.id, exp.event.name);
      }
    });
    return Array.from(eventMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allExpenses]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    allExpenses.forEach(exp => {
      if (exp.category) categorySet.add(exp.category);
    });
    return Array.from(categorySet).sort();
  }, [allExpenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return pendingExpenses.filter(exp => {
      const matchesSearch = 
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.event?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEvent = filterEvent === 'all' || exp.eventId === filterEvent;
      const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;

      return matchesSearch && matchesEvent && matchesCategory;
    });
  }, [pendingExpenses, searchQuery, filterEvent, filterCategory]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const highValue = filteredExpenses.filter(exp => exp.amount >= 10000).length;
    const urgent = filteredExpenses.filter(exp => {
      const daysSince = Math.floor((Date.now() - new Date(exp.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince >= 3;
    }).length;

    return {
      total: filteredExpenses.length,
      totalAmount,
      highValue,
      urgent,
    };
  }, [filteredExpenses]);

  const handleApprove = (expense: ExpenseWithVendor) => {
    setSelectedExpense(expense);
    setShowApproveDialog(true);
  };

  const handleReject = (expense: ExpenseWithVendor) => {
    setSelectedExpense(expense);
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (!selectedExpense) return;

    const formData = new FormData();
    formData.append("intent", "approve");
    formData.append("expenseId", selectedExpense.id);
    if (approvalComments) formData.append("comments", approvalComments);

    fetcher.submit(formData, { method: "post" });
    setShowApproveDialog(false);
    setSelectedExpense(null);
    setApprovalComments('');
    toast.success("Expense approved successfully");
  };

  const confirmReject = () => {
    if (!selectedExpense) return;

    const formData = new FormData();
    formData.append("intent", "reject");
    formData.append("expenseId", selectedExpense.id);
    if (approvalComments) formData.append("comments", approvalComments);

    fetcher.submit(formData, { method: "post" });
    setShowRejectDialog(false);
    setSelectedExpense(null);
    setApprovalComments('');
    toast.success("Expense rejected");
  };

  // Handle fetcher response
  if (fetcher.data?.success) {
    // Refresh will happen automatically via loader
  }

  const columns: TableColumn<ExpenseWithVendor>[] = [
    {
      key: "event",
      label: "Event",
      render: (expense) => expense.event?.name || "Unknown",
    },
    {
      key: "title",
      label: "Expense",
      render: (expense) => (
        <div>
          <p className="text-gray-900 font-medium">{expense.title}</p>
          <p className="text-sm text-gray-500">{expense.category}</p>
        </div>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (expense) => expense.vendor || "N/A",
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (expense) => (
        <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
      ),
    },
    {
      key: "submittedBy",
      label: "Submitted By",
      render: (expense) => expense.creator?.fullName || expense.creator?.email || "Unknown",
    },
    {
      key: "date",
      label: "Date",
      render: (expense) => formatDate(expense.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (expense) => (
        <div className="flex items-center justify-center gap-2">
          {canApprove && (
            <>
              <button
                onClick={() => handleApprove(expense)}
                className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                title="Approve"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleReject(expense)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                title="Reject"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Dashboard</h2>
          <p className="text-gray-600 mt-1">Review and approve pending expenses</p>
        </div>
      </div>

      {/* Summary Stats */}
      <SummaryStats
        stats={[
          {
            label: "Pending Approvals",
            value: stats.total.toString(),
            description: `${formatCurrency(stats.totalAmount)} total`,
          },
          {
            label: "High Value",
            value: stats.highValue.toString(),
            description: "≥ $10,000",
            color: "text-orange-600",
          },
          {
            label: "Urgent",
            value: stats.urgent.toString(),
            description: "≥ 3 days old",
            color: "text-red-600",
          },
        ]}
      />

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search expenses..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: "event",
            label: "Event",
            type: "select",
            value: filterEvent,
            onChange: setFilterEvent,
            options: [
              { value: "all", label: "All Events" },
              ...events.map(event => ({ value: event.id, label: event.name })),
            ],
          },
          {
            key: "category",
            label: "Category",
            type: "select",
            value: filterCategory,
            onChange: setFilterCategory,
            options: [
              { value: "all", label: "All Categories" },
              ...categories.map(cat => ({ value: cat, label: cat })),
            ],
          },
        ]}
      />

      {/* Pending Approvals Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={48} className="text-gray-400" />}
          title="No pending approvals"
          description="All expenses have been reviewed"
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
          </div>
          <div className="p-6">
            <DataTable
              columns={columns}
              data={filteredExpenses}
            />
          </div>
        </div>
      )}

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => {
          setShowApproveDialog(false);
          setSelectedExpense(null);
          setApprovalComments('');
        }}
        onConfirm={confirmApprove}
        title="Approve Expense"
        message={`Are you sure you want to approve "${selectedExpense?.title}" for ${formatCurrency(selectedExpense?.amount || 0)}?`}
        confirmLabel="Approve"
        variant="success"
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <textarea
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add approval comments..."
          />
        </div>
      </ConfirmDialog>

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setSelectedExpense(null);
          setApprovalComments('');
        }}
        onConfirm={confirmReject}
        title="Reject Expense"
        message={`Are you sure you want to reject "${selectedExpense?.title}" for ${formatCurrency(selectedExpense?.amount || 0)}?`}
        confirmLabel="Reject"
        variant="danger"
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide a reason for rejection..."
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}


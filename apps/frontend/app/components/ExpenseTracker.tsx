import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Download, Check, X, Clock, AlertCircle, DollarSign, Calendar, FileText, User as UserIcon, Building, Image as ImageIcon, Loader } from "./Icons";
import { useFetcher } from "@remix-run/react";
import type { User } from "~/lib/auth";
import type { ExpenseWithVendor, VendorWithStats, EventWithDetails } from "~/types";
import { FilterBar, DataTable, SummaryStats, EmptyState, Dropdown, ExpenseWizard, DetailsModal } from "./shared";
import type { ExpenseFormData } from "./shared";
import toast from "react-hot-toast";
import type { FilterConfig, TableColumn, SummaryStat, ModalSection } from "~/types";
import { getExpenseStatusColor, formatCurrency, formatDate } from "~/lib/utils";
import { api } from "~/lib/api";
import { demoExpenseTrackerExpenses } from "~/lib/demoData";

interface ExpenseTrackerProps {
  user: User | null;
  organization?: { name?: string } | null;
  event?: EventWithDetails | null;
  expenses?: ExpenseWithVendor[];
  events?: EventWithDetails[];
  vendors?: VendorWithStats[];
  isDemo?: boolean;
  fetcher?: ReturnType<typeof useFetcher>;
}

export function ExpenseTracker({ user, organization, event, expenses: initialExpenses = [], events = [], vendors = [], isDemo = false, fetcher }: ExpenseTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [loadingExpenseDetails, setLoadingExpenseDetails] = useState(false);

  // Use Remix fetcher for expense details
  const expenseDetailsFetcher = useFetcher();

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isFinance = user?.role === 'Finance';
  const isViewer = user?.role === 'Viewer';

  // Check if user can create expenses
  const canCreateExpense = isAdmin || isEventManager || isFinance || isDemo;

  // Check if user can approve/reject expenses (Admin and EventManager only)
  const canApproveExpense = isAdmin || isEventManager || isDemo;

  // Transform API expenses to component format
  // Keep original expense data for modal, but also create transformed version for table
  const transformExpense = (exp: any) => {
    const transformed = {
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
      // Preserve original expense data for modal (including receiptFiles)
      _original: exp,
    };
    return transformed;
  };

  // Transform API expenses to component format
  const transformedExpenses = initialExpenses.map(transformExpense);

  const [expenses, setExpenses] = useState(() => {
    if (isDemo) {
      // Use demo data from centralized file, but update event name and submittedBy if provided
      return demoExpenseTrackerExpenses.map(exp => ({
        ...exp,
        event: event?.name || exp.event,
        submittedBy: user?.name || exp.submittedBy,
      }));
    } else {
      return transformedExpenses;
    }
  });

  // Sync expenses from props when they change
  useEffect(() => {
    if (isDemo) {
      // Keep demo expenses as-is
      return;
    }
    // Always sync when initialExpenses changes (including empty array)
    const transformed = initialExpenses.map(transformExpense);
    setExpenses(transformed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExpenses, isDemo]);

  // Handle fetcher state changes
  useEffect(() => {
    // Only process when fetcher is idle and has data
    if (fetcher?.state !== "idle" || !fetcher?.data) {
      return;
    }

    const fetcherData = fetcher.data as any;
    
    // Check for error
    if (typeof fetcherData === 'object' && 'error' in fetcherData) {
      toast.error(fetcherData.error);
      return;
    }
    
    // Check for success (explicit success flag or no error)
    if (typeof fetcherData === 'object' && !('error' in fetcherData) && fetcherData.success !== false) {
      setShowAddExpense(false);
      toast.success("Expense submitted successfully");
    }
  }, [fetcher?.state, fetcher?.data]);

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

  const handleWizardSubmit = async (wizardData: ExpenseFormData) => {
    if (isDemo) {
      setExpenses([...expenses, {
        id: Date.now(),
        event: events.find(e => e.id === wizardData.eventId)?.name || 'Event',
        category: wizardData.category,
        item: wizardData.title,
        amount: parseFloat(wizardData.amount) || 0,
        vendor: vendors.find(v => v.id === wizardData.vendorId)?.name || 'N/A',
        date: wizardData.date,
        submittedBy: user?.name || 'User',
        status: 'pending',
        notes: wizardData.description,
      }]);
      setShowAddExpense(false);
      toast.success("Expense submitted successfully (Demo Mode)");
      return;
    }

    if (!fetcher) {
      toast.error("Unable to submit expense");
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("intent", "createExpense");
      formDataToSubmit.append("eventId", wizardData.eventId);
      formDataToSubmit.append("category", wizardData.category);
      formDataToSubmit.append("title", wizardData.title);
      formDataToSubmit.append("amount", wizardData.amount);
      if (wizardData.vendorId) formDataToSubmit.append("vendorId", wizardData.vendorId);
      if (wizardData.description) formDataToSubmit.append("description", wizardData.description);
      if (wizardData.file) {
        formDataToSubmit.append("file", wizardData.file);
      }

      fetcher.submit(formDataToSubmit, { method: "post" });
      toast.success("Expense submitted successfully");
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast.error("Failed to submit expense");
      throw error;
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

  const handleViewExpense = async (expense: any) => {
    // Show modal immediately with available data
    // The expense might be in transformed format, so extract original if available
    const expenseToShow = expense._original || expense;

    console.log('=== View Expense Debug ===');
    console.log('Expense passed to handleViewExpense:', expense);
    console.log('Expense to show (original or expense):', expenseToShow);
    console.log('ReceiptFiles in expense:', expenseToShow.receiptFiles);
    console.log('ReceiptFiles count:', expenseToShow.receiptFiles?.length || 0);

    setSelectedExpense(expenseToShow);
    setShowExpenseDetails(true);
    setLoadingExpenseDetails(true);

    if (!isDemo) {
      // Ensure expense ID is a string - use original expense if available
      const expenseId = String(expenseToShow.id);

      console.log('Fetching expense details via Remix fetcher:', expenseId);
      setLoadingExpenseDetails(true);

      // Use Remix fetcher to fetch expense details through server-side action
      // This properly handles the action and returns JSON
      const formData = new FormData();
      formData.append("intent", "getExpenseDetails");
      formData.append("expenseId", expenseId);

      expenseDetailsFetcher.submit(formData, {
        method: "POST",
        action: "/expenses",
      });
    } else {
      setLoadingExpenseDetails(false);
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
                onRowClick={handleViewExpense}
                actions={(expense) => (
                  <div className="flex items-center justify-center gap-2">
                    {expense.status === 'pending' && canApproveExpense && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(expense.id);
                          }}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(expense.id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewExpense(expense);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                )}
              />
            </div>
        </div>
      )}

      {/* Expense Submission Wizard */}
      <ExpenseWizard
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSubmit={handleWizardSubmit}
        events={events}
        vendors={vendors}
        event={event}
        isLoading={fetcher?.state === "submitting"}
      />

      {/* Expense Details Modal */}
      {showExpenseDetails && selectedExpense && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          isOpen={showExpenseDetails}
          onClose={() => {
            setShowExpenseDetails(false);
            setSelectedExpense(null);
          }}
          isLoading={loadingExpenseDetails}
          canApprove={canApproveExpense}
          onApprove={() => {
            handleApprove(selectedExpense.id);
            setShowExpenseDetails(false);
            setSelectedExpense(null);
          }}
          onReject={() => {
            handleReject(selectedExpense.id);
            setShowExpenseDetails(false);
            setSelectedExpense(null);
          }}
        />
      )}
    </div>
  );
}

// Expense Details Modal Component
function ExpenseDetailsModal({
  expense,
  isOpen,
  onClose,
  isLoading,
  canApprove,
  onApprove,
  onReject,
}: {
  expense: any;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  canApprove: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!isOpen) return null;

  // Handle both transformed expense format and full API format
  const getExpenseTitle = () => expense.title || expense.item || "N/A";
  const getExpenseCategory = () => expense.category || "N/A";
  const getExpenseAmount = () => expense.amount || 0;
  const getExpenseDate = () => {
    if (expense.date) {
      try {
        return formatDate(new Date(expense.date));
      } catch {
        return expense.date;
      }
    }
    if (expense.createdAt) {
      try {
        return formatDate(new Date(expense.createdAt));
      } catch {
        return expense.createdAt;
      }
    }
    return "N/A";
  };
  const getExpenseEvent = () => {
    if (expense.event?.name) return expense.event.name;
    if (typeof expense.event === 'string') return expense.event;
    return "N/A";
  };
  const getExpenseVendor = () => {
    return expense.vendorLink?.name || expense.vendor || expense.vendorName || "N/A";
  };
  const getExpenseSubmittedBy = () => {
    return expense.creator?.fullName || expense.creator?.email || expense.submittedBy || "N/A";
  };
  const getExpenseStatus = () => {
    const status = expense.status || "pending";
    return typeof status === 'string' ? status.toLowerCase() : status;
  };

  const sections: ModalSection[] = [
    {
      title: "Basic Information",
      items: [
        {
          label: "Expense Title",
          value: getExpenseTitle(),
          icon: <FileText size={16} className="text-gray-500" />,
        },
        {
          label: "Category",
          value: getExpenseCategory(),
          icon: <Building size={16} className="text-gray-500" />,
        },
        {
          label: "Amount",
          value: formatCurrency(getExpenseAmount()),
          icon: <DollarSign size={16} className="text-gray-500" />,
        },
        {
          label: "Date",
          value: getExpenseDate(),
          icon: <Calendar size={16} className="text-gray-500" />,
        },
        {
          label: "Event",
          value: getExpenseEvent(),
          icon: <Calendar size={16} className="text-gray-500" />,
        },
        {
          label: "Vendor",
          value: getExpenseVendor(),
          icon: <Building size={16} className="text-gray-500" />,
        },
        {
          label: "Submitted By",
          value: getExpenseSubmittedBy(),
          icon: <UserIcon size={16} className="text-gray-500" />,
        },
        {
          label: "Status",
          value: getExpenseStatus(),
          icon: <Clock size={16} className="text-gray-500" />,
        },
      ],
    },
  ];

  if (expense.description || expense.notes) {
    sections.push({
      title: "Description",
      content: (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-900 whitespace-pre-wrap">{expense.description || expense.notes || "No description provided"}</p>
        </div>
      ),
    });
  }

  if (expense.workflows && expense.workflows.length > 0) {
    sections.push({
      title: "Approval History",
      items: expense.workflows.map((workflow: any, index: number) => ({
        label: workflow.action === "approved" ? "Approved by" : workflow.action === "rejected" ? "Rejected by" : "Action",
        value: `${workflow.approver?.fullName || workflow.approver?.email || "Unknown"} - ${workflow.actionAt ? formatDate(new Date(workflow.actionAt)) : "N/A"}${workflow.comments ? ` (${workflow.comments})` : ""}`,
        icon: workflow.action === "approved" ? <Check size={16} className="text-green-600" /> : <X size={16} className="text-red-600" />,
      })),
    });
  }

  // Always show Receipts section, even if empty
  const isImageFile = (mimeType: string | null | undefined, filename: string) => {
    if (!mimeType && !filename) return false;
    const mime = mimeType?.toLowerCase() || '';
    const ext = filename?.toLowerCase().split('.').pop() || '';
    return mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const { env } = await import('~/lib/env');
      const url = `${env.API_BASE_URL}/files/${fileId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Debug: Log receipt files with detailed info
  console.log('=== Expense Details Debug ===');
  console.log('Expense ID:', expense.id);
  console.log('Expense receiptFiles:', expense.receiptFiles);
  console.log('ReceiptFiles count:', expense.receiptFiles?.length || 0);
  if (expense.receiptFiles && expense.receiptFiles.length > 0) {
    expense.receiptFiles.forEach((file: any, index: number) => {
      console.log(`File ${index + 1}:`, {
        id: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        path: file.path,
        uploadedAt: file.uploadedAt
      });
    });
  }
  console.log('Full expense data:', expense);

  sections.push({
    title: "Receipts",
    content: expense.receiptFiles && expense.receiptFiles.length > 0 ? (
      <ReceiptFilesList
        files={expense.receiptFiles}
        onDownload={handleDownload}
        isImageFile={isImageFile}
      />
    ) : (
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No receipt files attached</p>
        </div>
    ),
  });

  const expenseStatus = getExpenseStatus();
  const statusColor = getExpenseStatusColor(expenseStatus);
  const statusBadge = (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${statusColor}`}>
      {expenseStatus === "approved" ? <Check size={14} /> : expenseStatus === "rejected" ? <X size={14} /> : <Clock size={14} />}
      {expenseStatus}
    </span>
  );

  const actions = [];
  if (expenseStatus === "pending" && canApprove) {
    // Add Close button first, then Reject, then Approve
    actions.push(
      { label: "Close", onClick: onClose, variant: "secondary" as const },
      { label: "Reject", onClick: onReject, variant: "secondary" as const },
      { label: "Approve", onClick: onApprove, variant: "primary" as const }
    );
  } else {
    // If no approve/reject actions, just show Close button
    actions.push(
      { label: "Close", onClick: onClose, variant: "secondary" as const }
    );
  }

  return (
    <DetailsModal
      title={getExpenseTitle()}
      subtitle={statusBadge}
      sections={sections}
      actions={actions}
      onClose={onClose}
    />
  );
}

// Receipt Files List Component with Image Previews
function ReceiptFilesList({
  files,
  onDownload,
  isImageFile,
}: {
  files: any[];
  onDownload: (fileId: string, filename: string) => void;
  isImageFile: (mimeType: string | null | undefined, filename: string) => boolean;
}) {
  return (
    <div className="space-y-4">
      {files.map((file: any) => (
        <ReceiptFileItem
          key={file.id}
          file={file}
          onDownload={onDownload}
          isImage={isImageFile(file.mimeType, file.filename)}
        />
      ))}
    </div>
  );
}

// Individual Receipt File Item with Image Preview
function ReceiptFileItem({
  file,
  onDownload,
  isImage,
}: {
  file: any;
  onDownload: (fileId: string, filename: string) => void;
  isImage: boolean;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (isImage && showPreview && !imageUrl && !imageError) {
      setLoadingImage(true);
      const loadImage = async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          const { env } = await import('~/lib/env');

          // Debug logging
          console.log('Loading image for file:', {
            fileId: file.id,
            filename: file.filename,
            mimeType: file.mimeType,
            url: `${env.API_BASE_URL}/files/${file.id}`
          });

          const url = `${env.API_BASE_URL}/files/${file.id}`;

          const response = await fetch(url, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          });

          console.log('Image fetch response:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
          });

          if (response.ok) {
            const blob = await response.blob();
            console.log('Image blob:', {
              size: blob.size,
              type: blob.type
            });

            // Verify it's actually an image blob
            if (blob.size === 0) {
              console.error('Image blob is empty');
              setImageError(true);
            } else if (!blob.type.startsWith('image/') && blob.type !== 'application/octet-stream') {
              console.warn('Blob type is not an image:', blob.type);
              // Still try to display it - might be a valid image with wrong MIME type
            }

            const blobUrl = window.URL.createObjectURL(blob);
            setImageUrl(blobUrl);
            console.log('Image URL created:', blobUrl);
          } else {
            const errorText = await response.text();
            console.error('Failed to load image:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              url: url
            });
            setImageError(true);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageError(true);
        } finally {
          setLoadingImage(false);
        }
      };
      loadImage();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (imageUrl) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isImage, file.id, imageUrl, imageError, showPreview]);

  const fileSize = file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size';
  const fileType = file.mimeType ? file.mimeType.split('/')[1] || file.mimeType : 'Unknown';

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isImage ? (
              <ImageIcon size={16} className="text-blue-600 flex-shrink-0" />
            ) : (
              <FileText size={16} className="text-gray-500 flex-shrink-0" />
            )}
            <span className="text-gray-900 font-medium truncate">{file.filename || 'Untitled'}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{fileSize}</span>
            {file.mimeType && (
              <span className="capitalize">{fileType}</span>
            )}
            {file.uploadedAt && (
              <span>{formatDate(new Date(file.uploadedAt))}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? (
                <>
                  <X size={16} />
                  <span className="text-sm">Hide</span>
                </>
              ) : (
                <>
                  <ImageIcon size={16} />
                  <span className="text-sm">Preview</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => onDownload(file.id, file.filename || 'file')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            title="Download file"
          >
            <Download size={16} />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>
      {isImage && showPreview && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white relative">
          {loadingImage && (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <div className="text-center">
                <Loader size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Loading preview...</p>
              </div>
            </div>
          )}
          {imageError && (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <div className="text-center">
                <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm mb-2">Preview not available</p>
                <button
                  onClick={() => {
                    setImageError(false);
                    setImageUrl(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {imageUrl && !imageError && (
            <div className="relative">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title="Close preview"
              >
                <X size={16} />
              </button>
              <img
                src={imageUrl}
                alt={file.filename || 'Receipt preview'}
                className="w-full h-auto max-h-96 object-contain"
                onError={() => {
                  console.error('Image load error in img tag');
                  setImageError(true);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Expense Details Modal Component
 */

import { FileText, Building, DollarSign, Calendar, Clock, User as UserIcon, Check, X } from "~/components/Icons";
import { DetailsModal } from "~/components/shared";
import { formatCurrency, formatDate, getExpenseStatusColor } from "~/lib/utils";
import { ReceiptFilesList } from "./ReceiptFilesList";
import { EXPENSE_LABELS, EXPENSE_STATUS, EXPENSE_MESSAGES, DEFAULT_EXPENSE_VALUES } from "~/constants/expenses";
import { DEFAULT_STRINGS, API_ENDPOINTS } from "~/constants/common";
import { env } from "~/lib/env";
import toast from "react-hot-toast";
import type { ModalSection } from "~/types";

interface ExpenseDetailsModalProps {
  expense: any;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  canApprove: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function ExpenseDetailsModal({
  expense,
  isOpen,
  onClose,
  isLoading,
  canApprove,
  onApprove,
  onReject,
}: ExpenseDetailsModalProps) {
  if (!isOpen) return null;

  // Handle both transformed expense format and full API format
  const getExpenseTitle = () => expense.title || expense.item || DEFAULT_STRINGS.NA;
  const getExpenseCategory = () => expense.category || DEFAULT_STRINGS.NA;
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
    return DEFAULT_STRINGS.NA;
  };
  const getExpenseEvent = () => {
    if (expense.event?.name) return expense.event.name;
    if (typeof expense.event === 'string') return expense.event;
    return DEFAULT_STRINGS.NA;
  };
  const getExpenseVendor = () => {
    return expense.vendorLink?.name || expense.vendor || expense.vendorName || DEFAULT_STRINGS.NA;
  };
  const getExpenseSubmittedBy = () => {
    return expense.creator?.fullName || expense.creator?.email || expense.submittedBy || DEFAULT_STRINGS.NA;
  };
  const getExpenseStatus = () => {
    const status = expense.status || EXPENSE_STATUS.PENDING;
    return typeof status === 'string' ? status.toLowerCase() : status;
  };

  const sections: ModalSection[] = [
    {
      title: EXPENSE_LABELS.BASIC_INFORMATION,
      items: [
        {
          label: EXPENSE_LABELS.EXPENSE_TITLE,
          value: getExpenseTitle(),
          icon: <FileText size={16} className="text-gray-500" />,
        },
        {
          label: EXPENSE_LABELS.CATEGORY,
          value: getExpenseCategory(),
          icon: <Building size={16} className="text-gray-500" />,
        },
        {
          label: EXPENSE_LABELS.AMOUNT,
          value: formatCurrency(getExpenseAmount()),
          icon: <DollarSign size={16} className="text-gray-500" />,
        },
        {
          label: EXPENSE_LABELS.DATE,
          value: getExpenseDate(),
          icon: <Calendar size={16} className="text-gray-500" />,
        },
        {
          label: EXPENSE_LABELS.EVENT,
          value: getExpenseEvent(),
          icon: <Calendar size={16} className="text-gray-500" />,
        },
        {
          label: EXPENSE_LABELS.VENDOR,
          value: getExpenseVendor(),
          icon: <Building size={16} className="text-gray-500" />,
        },
        {
          label: EXPENSE_LABELS.SUBMITTED_BY,
          value: getExpenseSubmittedBy(),
          icon: <UserIcon size={16} className="text-gray-500" />,
        },
        {
          label: EXPENSE_LABELS.STATUS_LABEL,
          value: getExpenseStatus(),
          icon: <Clock size={16} className="text-gray-500" />,
        },
      ],
    },
  ];

  if (expense.description || expense.notes) {
    sections.push({
      title: EXPENSE_LABELS.DESCRIPTION,
      content: (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-900 whitespace-pre-wrap">
            {expense.description || expense.notes || DEFAULT_EXPENSE_VALUES.NO_DESCRIPTION}
          </p>
        </div>
      ),
    });
  }

  if (expense.workflows && expense.workflows.length > 0) {
    sections.push({
      title: EXPENSE_LABELS.APPROVAL_HISTORY,
      items: expense.workflows.map((workflow: any) => ({
        label: workflow.action === "approved" 
          ? EXPENSE_LABELS.APPROVED_BY 
          : workflow.action === "rejected" 
          ? EXPENSE_LABELS.REJECTED_BY 
          : EXPENSE_LABELS.ACTION,
        value: `${workflow.approver?.fullName || workflow.approver?.email || DEFAULT_STRINGS.UNKNOWN} - ${workflow.actionAt ? formatDate(new Date(workflow.actionAt)) : DEFAULT_STRINGS.NA}${workflow.comments ? ` (${workflow.comments})` : ""}`,
        icon: workflow.action === "approved" 
          ? <Check size={16} className="text-green-600" /> 
          : <X size={16} className="text-red-600" />,
      })),
    });
  }

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const url = `${env.API_BASE_URL}${API_ENDPOINTS.FILES(fileId)}`;

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
      toast.success(EXPENSE_MESSAGES.FILE_DOWNLOAD_SUCCESS);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(EXPENSE_MESSAGES.FILE_DOWNLOAD_FAILED);
    }
  };

  sections.push({
    title: EXPENSE_LABELS.RECEIPTS,
    content: expense.receiptFiles && expense.receiptFiles.length > 0 ? (
      <ReceiptFilesList
        files={expense.receiptFiles}
        onDownload={handleDownload}
      />
    ) : (
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm">{EXPENSE_LABELS.NO_RECEIPT_FILES}</p>
      </div>
    ),
  });

  const expenseStatus = getExpenseStatus();
  const statusColor = getExpenseStatusColor(expenseStatus);
  const statusBadge = (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${statusColor}`}>
      {expenseStatus === EXPENSE_STATUS.APPROVED ? (
        <Check size={14} />
      ) : expenseStatus === EXPENSE_STATUS.REJECTED ? (
        <X size={14} />
      ) : (
        <Clock size={14} />
      )}
      {expenseStatus}
    </span>
  );

  const actions = [];
  if (expenseStatus === EXPENSE_STATUS.PENDING && canApprove) {
    actions.push(
      { label: EXPENSE_LABELS.CLOSE, onClick: onClose, variant: "secondary" as const },
      { label: EXPENSE_LABELS.REJECT, onClick: onReject, variant: "secondary" as const },
      { label: EXPENSE_LABELS.APPROVE, onClick: onApprove, variant: "primary" as const }
    );
  } else {
    actions.push(
      { label: EXPENSE_LABELS.CLOSE, onClick: onClose, variant: "secondary" as const }
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



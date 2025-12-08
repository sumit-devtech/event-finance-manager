/**
 * Budget Table Row Component
 */

import { Edit, Trash, FileText, User as UserIcon, Clock, Check, X } from '../Icons';
import { BUDGET_EXPANDED_LABELS, BUDGET_EMPTY_STATES, BUDGET_VARIANCE_LABELS, BUDGET_ITEM_STATUS } from '~/constants/budget';
import { DEFAULT_STRINGS } from '~/constants/common';
import { getBudgetItemStatusColor, formatVariance } from './utils/budgetHelpers';
import { formatDateTime } from '~/lib/utils';
import type { BudgetLineItem } from './utils/budgetTransformers';

interface BudgetTableRowProps {
  line: BudgetLineItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (item: BudgetLineItem) => void;
  onDelete: (id: string | number) => void;
  onApprove?: (id: string | number) => void;
  onReject?: (id: string | number) => void;
  canEditBudget: boolean;
  canApprove?: boolean;
  isDemo: boolean;
  showEventColumn: boolean;
}

export function BudgetTableRow({
  line,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  canEditBudget,
  canApprove = false,
  isDemo,
  showEventColumn,
}: BudgetTableRowProps) {
  const { amount: varianceAmount, label: varianceLabel } = formatVariance(line.variance);

  return (
    <>
      <tr 
        className="hover:bg-gray-50 cursor-pointer"
        onClick={onToggleExpand}
      >
        {showEventColumn && (
          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
            {line.eventName || DEFAULT_STRINGS.UNKNOWN_EVENT}
          </td>
        )}
        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{line.category}</td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{line.subcategory || BUDGET_EMPTY_STATES.NO_SUBCATEGORY}</td>
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
          ${varianceAmount} {line.variance >= 0 ? BUDGET_VARIANCE_LABELS.UNDER : BUDGET_VARIANCE_LABELS.OVER}
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 rounded-full text-xs border ${getBudgetItemStatusColor(line.status)}`}>
            {line.status}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
          {line.assignedUser || BUDGET_EMPTY_STATES.NO_USER}
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {line.status === BUDGET_ITEM_STATUS.PENDING && canApprove && onApprove && onReject && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(line.id);
                  }}
                  className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                  title="Approve"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(line.id);
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  title="Reject"
                >
                  <X size={16} />
                </button>
              </>
            )}
            {canEditBudget && !isDemo && (
              <>
                <button
                  onClick={() => onEdit(line)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(line.id)}
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
      {isExpanded && (
        <tr>
          <td colSpan={showEventColumn ? 10 : 9} className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-2">{BUDGET_EXPANDED_LABELS.NOTES}</p>
                <p className="text-gray-600">{line.notes || BUDGET_EXPANDED_LABELS.NO_NOTES}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-2">{BUDGET_EXPANDED_LABELS.FILE_ATTACHMENT}</p>
                {line.fileAttachment ? (
                  <a href={line.fileAttachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    <FileText size={14} />
                    {BUDGET_EXPANDED_LABELS.VIEW_ATTACHMENT}
                  </a>
                ) : (
                  <p className="text-gray-500">{BUDGET_EXPANDED_LABELS.NO_ATTACHMENT}</p>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-2">{BUDGET_EXPANDED_LABELS.STRATEGIC_GOAL}</p>
                <p className="text-gray-600">{line.strategicGoalId || BUDGET_EXPANDED_LABELS.NOT_MAPPED}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-2">{BUDGET_EXPANDED_LABELS.VENDOR}</p>
                <p className="text-gray-600">{line.vendor || BUDGET_EMPTY_STATES.NO_USER}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-2">{BUDGET_EXPANDED_LABELS.AUDIT_LOG}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon size={14} />
                  <span>{BUDGET_EXPANDED_LABELS.LAST_EDITED_BY} {line.lastEditedBy || DEFAULT_STRINGS.UNKNOWN}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Clock size={14} />
                  <span>{formatDateTime(line.lastEditedAt)}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}


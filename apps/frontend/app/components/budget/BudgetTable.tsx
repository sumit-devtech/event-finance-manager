/**
 * Budget Table Component
 */

import { Plus } from '../Icons';
import { BUDGET_TABLE_HEADERS, BUDGET_MESSAGES, BUDGET_SUMMARY_LABELS, DEFAULT_BUDGET_FORM_DATA } from '~/constants/budget';
import { BudgetTableRow } from './BudgetTableRow';
import type { BudgetLineItem } from './utils/budgetTransformers';

interface BudgetTableProps {
  budgetLines: BudgetLineItem[];
  event?: { id: string; name: string } | null;
  events: Array<{ id: string; name: string }>;
  expandedRow: string | number | null;
  onToggleExpand: (id: string | number) => void;
  onEdit: (item: BudgetLineItem) => void;
  onDelete: (id: string | number) => void;
  onAddClick: () => void;
  canEditBudget: boolean;
  isDemo: boolean;
  resetForm: () => void;
}

export function BudgetTable({
  budgetLines,
  event,
  events,
  expandedRow,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddClick,
  canEditBudget,
  isDemo,
  resetForm,
}: BudgetTableProps) {
  const showEventColumn = !event && events.length > 0;
  const colSpan = showEventColumn ? 10 : 9;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{BUDGET_SUMMARY_LABELS.BUDGET_LINE_ITEMS}</h3>
        {canEditBudget && !isDemo && event?.id && (
          <button
            onClick={() => {
              resetForm();
              onAddClick();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            {BUDGET_MESSAGES.ADD_LINE_ITEM}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {showEventColumn && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {BUDGET_TABLE_HEADERS.EVENT}
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.CATEGORY}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.SUBCATEGORY}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.DESCRIPTION}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.ESTIMATED}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.ACTUAL}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.VARIANCE}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.STATUS}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.ASSIGNED}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {BUDGET_TABLE_HEADERS.ACTIONS}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {budgetLines.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
                  {BUDGET_MESSAGES.NO_ITEMS} {event?.id ? BUDGET_MESSAGES.NO_ITEMS_WITH_EVENT : BUDGET_MESSAGES.NO_ITEMS_WITHOUT_EVENT}
                </td>
              </tr>
            ) : (
              budgetLines.map((line) => (
                <BudgetTableRow
                  key={line.id}
                  line={line}
                  isExpanded={expandedRow === line.id}
                  onToggleExpand={() => onToggleExpand(line.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  canEditBudget={canEditBudget}
                  isDemo={isDemo}
                  showEventColumn={showEventColumn}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


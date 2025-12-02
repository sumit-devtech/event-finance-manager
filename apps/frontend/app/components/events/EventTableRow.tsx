import { TrendingUp } from '../Icons';
import { ProgressBar, EditButton, DeleteButton } from '../shared';
import { getEventStatusColor } from "~/lib/utils";
import { getBudgetHealth } from './utils/eventHelpers';
import type { EventWithDetails } from "~/types";

interface EventTableRowProps {
  event: EventWithDetails;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  showCheckbox: boolean;
}

export function EventTableRow({
  event,
  isSelected,
  onSelect,
  onClick,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  showCheckbox,
}: EventTableRowProps) {
  const budgetPercentage = ((event.spent || 0) / (event.budget || 1)) * 100;
  const budgetHealth = getBudgetHealth(event);

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      {showCheckbox && (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </td>
      )}
      <td className="px-4 py-3">
        <button
          onClick={onClick}
          className="text-blue-600 hover:text-blue-800 text-sm text-left"
        >
          {event.name}
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{event.type || event.eventType || 'Event'}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{event.owner || event.organizer || event.createdBy || 'Unassigned'}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{event.region || (event.location ? event.location.split(',')[1]?.trim() : '-')}</td>
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {(event.date || event.startDate) ? new Date(event.date || event.startDate!).toLocaleDateString() : 'TBD'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-16">
            <ProgressBar
              value={budgetPercentage}
              variant={budgetHealth === 'critical' ? 'danger' : budgetHealth === 'caution' ? 'warning' : budgetHealth === 'warning' ? 'warning' : 'safe'}
              height="sm"
            />
          </div>
          <span className="text-sm text-gray-700">{budgetPercentage.toFixed(0)}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
          {event.roiPercent || event.roi ? `${event.roiPercent || event.roi}%` : 'N/A'}
          {(event.roiPercent || event.roi) && <TrendingUp size={12} />}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getEventStatusColor(event.status || 'planning')}`}>
          {event.status || 'planning'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {canEdit && (
            <EditButton
              onClick={onEdit}
              size={16}
            />
          )}
          {canDelete && (
            <DeleteButton
              onClick={onDelete}
              size={16}
              requireConfirm={true}
              confirmMessage="Are you sure you want to delete this event? This action cannot be undone."
            />
          )}
          {!canEdit && !canDelete && (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      </td>
    </tr>
  );
}


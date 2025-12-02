import { EventTableRow } from './EventTableRow';
import type { EventWithDetails } from "~/types";

interface EventsTableViewProps {
  events: EventWithDetails[];
  selectedEvents: Set<string>;
  onSelectEvent: (eventId: string) => void;
  onSelectAll: () => void;
  onEventClick: (event: EventWithDetails) => void;
  onEdit: (event: EventWithDetails) => void;
  onDelete: (event: EventWithDetails) => void;
  canEdit: (event: EventWithDetails) => boolean;
  canDelete: boolean;
  canPerformBulkActions: boolean;
}

export function EventsTableView({
  events,
  selectedEvents,
  onSelectEvent,
  onSelectAll,
  onEventClick,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  canPerformBulkActions,
}: EventsTableViewProps) {
  const isAllSelected = events.length > 0 && selectedEvents.size === events.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {canPerformBulkActions && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm text-gray-700">Event Name</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Owner</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Region</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Budget Utilized</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">ROI %</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => (
              <EventTableRow
                key={event.id}
                event={event}
                isSelected={selectedEvents.has(event.id)}
                onSelect={() => onSelectEvent(event.id)}
                onClick={() => onEventClick(event)}
                onEdit={() => onEdit(event)}
                onDelete={() => onDelete(event)}
                canEdit={canEdit(event)}
                canDelete={canDelete}
                showCheckbox={canPerformBulkActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


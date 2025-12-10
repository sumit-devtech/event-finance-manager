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
    <div className="bg-white rounded-[6px] border border-[#E2E2E2] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[#ECECF1]">
            <tr>
              {canPerformBulkActions && (
                <th className="px-4 h-9 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-[#672AFA] border-[#E2E2E2] rounded focus:ring-2 focus:ring-[#672AFA] cursor-pointer"
                  />
                </th>
              )}
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Event Name</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Type</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Owner</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Region</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Date</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Budget Utilized</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">ROI %</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Status</th>
              <th className="px-4 h-9 text-left text-sm font-medium text-[#1A1A1A]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECF1]">
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


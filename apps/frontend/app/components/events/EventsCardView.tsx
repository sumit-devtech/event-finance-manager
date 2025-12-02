import { EventCard } from './EventCard';
import type { EventWithDetails } from "~/types";

interface EventsCardViewProps {
  events: EventWithDetails[];
  onEventClick: (event: EventWithDetails) => void;
  onEdit: (event: EventWithDetails) => void;
  onDelete: (event: EventWithDetails) => void;
  canEdit: (event: EventWithDetails) => boolean;
  canDelete: boolean;
}

export function EventsCardView({
  events,
  onEventClick,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: EventsCardViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => onEventClick(event)}
          onEdit={canEdit(event) ? () => onEdit(event) : undefined}
          onDelete={canDelete ? () => onDelete(event) : undefined}
          canEdit={canEdit(event)}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}


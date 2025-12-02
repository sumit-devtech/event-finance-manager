import { Calendar, MapPin, Users } from '../Icons';
import { DataCard } from '../shared';
import type { CardMetadata, CardStat, ActionButtonConfig } from "~/types";
import type { EventWithDetails } from "~/types";
import { getEventStatusColor } from "~/lib/utils";
import { getBudgetHealth, getBudgetHealthColor } from './utils/eventHelpers';

interface EventCardProps {
  event: EventWithDetails;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function EventCard({ event, onClick, onEdit, onDelete, canEdit, canDelete }: EventCardProps) {
  const budgetPercentage = ((event.spent || 0) / (event.budget || 1)) * 100;
  const budgetHealth = getBudgetHealth(event);

  const metadata: CardMetadata[] = [
    {
      icon: <Calendar size={16} />,
      label: 'Date',
      value: (event.date || event.startDate) ? new Date(event.date || event.startDate!).toLocaleDateString() : 'TBD',
    },
    {
      icon: <MapPin size={16} />,
      label: 'Location',
      value: event.location || 'TBD',
    },
    {
      icon: <Users size={16} />,
      label: 'Attendees',
      value: `${(event.attendees || 0).toLocaleString()} attendees`,
    },
  ];

  const stats: CardStat[] = [
    {
      label: 'Budget Utilized',
      value: `${budgetPercentage.toFixed(0)}%`,
    },
    {
      label: 'ROI',
      value: event.roiPercent || event.roi ? `${event.roiPercent || event.roi}%` : 'N/A',
      color: 'text-green-600',
    },
  ];

  const actions: ActionButtonConfig[] = [
    {
      label: 'View Details',
      onClick,
      variant: 'primary',
    },
  ];

  if (canEdit) {
    actions.push({
      label: 'Edit',
      onClick: onEdit || (() => {}),
      variant: 'secondary',
    });
  }

  if (canDelete) {
    actions.push({
      label: 'Delete',
      onClick: onDelete || (() => {}),
      variant: 'danger',
      requireConfirm: true,
      confirmMessage: 'Are you sure you want to delete this event?',
    });
  }

  return (
    <DataCard
      title={event.name}
      badge={{
        label: event.type || event.eventType || 'Event',
        color: 'blue',
      }}
      icon={
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getEventStatusColor(event.status || 'planning')}`}>
            {event.status || 'planning'}
          </span>
          <div className={`w-3 h-3 rounded-full ${getBudgetHealthColor(budgetHealth)}`} title={budgetHealth}></div>
        </div>
      }
      metadata={metadata}
      stats={stats}
      actions={actions}
    />
  );
}


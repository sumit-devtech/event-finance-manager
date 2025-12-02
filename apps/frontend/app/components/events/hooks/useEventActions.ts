/**
 * Hook for event actions (bulk operations, CRUD)
 */

import { useFetcher } from "@remix-run/react";
import toast from "react-hot-toast";
import type { EventWithDetails } from "~/types";
import type { User } from "~/lib/auth";

interface UseEventActionsProps {
  events: EventWithDetails[];
  selectedEvents: Set<string>;
  fetcher?: ReturnType<typeof useFetcher>;
  isDemo: boolean;
  user: User | null;
  onRefresh?: () => void;
}

export function useEventActions({
  events,
  selectedEvents,
  fetcher,
  isDemo,
  user,
  onRefresh,
}: UseEventActionsProps) {
  const handleBulkArchive = () => {
    if (selectedEvents.size === 0) return;
    
    if (isDemo) {
      toast.success(`Archiving ${selectedEvents.size} event(s)`);
    } else if (fetcher) {
      const formData = new FormData();
      formData.append('intent', 'bulkArchive');
      formData.append('eventIds', JSON.stringify(Array.from(selectedEvents)));
      fetcher.submit(formData, { method: 'post' });
      toast.success(`Archiving ${selectedEvents.size} event(s)`);
    }
  };

  const handleBulkDuplicate = () => {
    if (selectedEvents.size === 0) return;
    
    if (isDemo) {
      toast.success(`Duplicating ${selectedEvents.size} event(s)`);
    } else if (fetcher) {
      const formData = new FormData();
      formData.append('intent', 'bulkDuplicate');
      formData.append('eventIds', JSON.stringify(Array.from(selectedEvents)));
      fetcher.submit(formData, { method: 'post' });
      toast.success(`Duplicating ${selectedEvents.size} event(s)`);
    }
  };

  const handleBulkExport = () => {
    if (selectedEvents.size === 0) return;
    
    const selectedEventsData = events.filter(e => selectedEvents.has(e.id));
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Name,Type,Date,Location,Budget,Spent,Status,ROI%\n' +
      selectedEventsData.map(e => 
        `${e.name},${e.type || e.eventType},${e.date || e.startDate},${e.location},${e.budget || 0},${e.spent || 0},${e.status},${e.roiPercent || e.roi || 0}`
      ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'events_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${selectedEvents.size} event(s)`);
  };

  const handleDelete = (eventId: string) => {
    if (isDemo) {
      toast.success('Event deleted successfully');
      if (onRefresh) {
        onRefresh();
      }
    } else if (fetcher) {
      const formData = new FormData();
      formData.append('intent', 'deleteEvent');
      formData.append('eventId', eventId);
      fetcher.submit(formData, { method: 'post' });
      toast.success('Event deleted successfully');
    }
  };

  const handleEdit = (event: EventWithDetails) => {
    // This is handled by the parent component
    return event;
  };

  return {
    handleBulkArchive,
    handleBulkDuplicate,
    handleBulkExport,
    handleDelete,
    handleEdit,
  };
}


import { useState, useEffect, useRef } from 'react';
import { Calendar } from '../Icons';
import { useFetcher, useActionData } from '@remix-run/react';
import type { User } from "~/lib/auth";
import type { EventWithDetails, VendorWithStats } from "~/types";
import { EmptyState } from "../shared";
import toast from "react-hot-toast";
import { useRoleAccess } from "~/hooks/useRoleAccess";
import { validateEventLimit } from "./utils/eventValidators";
import { getRegions, getEventTypes } from "./utils/eventHelpers";
import { EventsListHeader } from "./EventsListHeader";
import { EventsSearchBar } from "./EventsSearchBar";
import { EventsFilters } from "./EventsFilters";
import { EventsBulkActions } from "./EventsBulkActions";
import { EventsCardView } from "./EventsCardView";
import { EventsTableView } from "./EventsTableView";
import { EventForm } from "./EventForm";
import { EventDetailsModal } from "./EventDetailsModal";
import { useEventFilters } from "./hooks/useEventFilters";
import { useEventViewMode } from "./hooks/useEventViewMode";
import { useEventSelection } from "./hooks/useEventSelection";
import { useEventActions } from "./hooks/useEventActions";

interface EventsListProps {
  user: User | null;
  organization?: { name?: string; industry?: string } | null;
  isDemo: boolean;
  events: EventWithDetails[];
  vendors?: VendorWithStats[];
  onRefresh?: () => void;
}

interface FetcherResponse {
  success: boolean;
  message?: string;
}

interface ActionDataResponse {
  success: boolean;
  message?: string;
}

export function EventsList({ user, organization, isDemo, events: initialEvents, vendors = [], onRefresh }: EventsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<EventWithDetails[]>(initialEvents || []);
  const fetcher = useFetcher();
  const actionData = useActionData();
  const lastProcessedFetcherData = useRef<unknown>(null);

  // Role-based access control
  const {
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,
    canPerformBulkActions,
  } = useRoleAccess(user, isDemo);

  // Custom hooks
  const { searchQuery, setSearchQuery, filters, updateFilter, filteredEvents } = useEventFilters(events);
  const { viewMode, setViewMode } = useEventViewMode();
  const { selectedEvents, toggleSelection, selectAll, clearSelection, selectedCount } = useEventSelection(filteredEvents);
  const { handleBulkArchive, handleBulkDuplicate, handleBulkExport, handleDelete } = useEventActions({
    events: filteredEvents,
    selectedEvents,
    fetcher,
    isDemo,
    user,
    onRefresh,
  });

  // Sync events with initialEvents
  useEffect(() => {
    setEvents(initialEvents || []);
  }, [initialEvents]);
  
  // Update selectedEvent when events are refreshed (to get latest budgetItems, etc.)
  useEffect(() => {
    if (selectedEvent && events.length > 0) {
      const updatedEvent = events.find(e => e.id === selectedEvent.id);
      if (updatedEvent) {
        // Only update if the updated event has more data (more budgetItems or strategicGoals)
        const hasMoreData = 
          (updatedEvent.budgetItems?.length || 0) > (selectedEvent.budgetItems?.length || 0) ||
          (updatedEvent.strategicGoals?.length || 0) > (selectedEvent.strategicGoals?.length || 0);
        
        if (hasMoreData || updatedEvent.budgetItems?.length !== selectedEvent.budgetItems?.length) {
          setSelectedEvent(updatedEvent);
        }
      }
    }
  }, [events, selectedEvent?.id]);

  // Handle fetcher responses for bulk actions and delete
  useEffect(() => {
    const data = fetcher.data as FetcherResponse | undefined;
    if (data && data.success && data !== lastProcessedFetcherData.current) {
      lastProcessedFetcherData.current = data;

      if (onRefresh) {
        onRefresh();
      }
      clearSelection();
      if (data.message?.includes('deleted')) {
        setSelectedEvent(null);
        setShowForm(false);
      }
    }
  }, [fetcher.data, onRefresh, clearSelection]);

  // Track when form was opened to prevent premature closing
  const formOpenedAt = useRef<number | null>(null);
  
  // Handle actionData from route action (for create/update events)
  useEffect(() => {
    const data = actionData as ActionDataResponse | undefined;
    if (data?.success && showForm) {
      // Only close if form was open for at least 1 second (to prevent immediate closing)
      const formOpenDuration = formOpenedAt.current ? Date.now() - formOpenedAt.current : Infinity;
      if (formOpenDuration > 1000) {
        const timer = setTimeout(() => {
          if (onRefresh) {
            onRefresh();
          }
          setShowForm(false);
          setSelectedEvent(null);
          formOpenedAt.current = null;
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [actionData, onRefresh, showForm]);
  
  // Track when form opens
  useEffect(() => {
    if (showForm && !formOpenedAt.current) {
      formOpenedAt.current = Date.now();
    } else if (!showForm) {
      formOpenedAt.current = null;
    }
  }, [showForm]);

  const handleEditEvent = (event: EventWithDetails) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEvent(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCreateEvent = () => {
    const validation = validateEventLimit(user, isDemo);
    if (!validation.canCreate) {
      toast.error(validation.message || 'Cannot create event');
      return;
    }
    setShowForm(true);
  };

  const handleEventClick = (event: EventWithDetails) => {
    setSelectedEvent(event);
  };

  const handleDeleteEvent = (event: EventWithDetails) => {
    if (isDemo) {
      setEvents(events.filter(e => e.id !== event.id));
      toast.success('Event deleted successfully');
    } else {
      handleDelete(event.id);
    }
  };

  const availableTypes = getEventTypes(events);
  const availableRegions = getRegions(events);

  // Show form if needed
  if (showForm) {
    return (
      <EventForm
        event={selectedEvent}
        onClose={handleCloseForm}
        user={user || {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'EventManager',
        } as User}
        organization={organization}
        actionData={actionData}
        isDemo={isDemo}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EventsListHeader
        user={user}
        canCreateEvent={canCreateEvent}
        onCreateEvent={handleCreateEvent}
        isDemo={isDemo}
      />

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-4">
          <EventsSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <EventsFilters
            filters={filters}
            onFilterChange={updateFilter}
            availableTypes={availableTypes}
            availableRegions={availableRegions}
            showFilters={showFilters}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      <EventsBulkActions
        selectedCount={selectedCount}
        onArchive={handleBulkArchive}
        onDuplicate={handleBulkDuplicate}
        onExport={handleBulkExport}
        onClear={clearSelection}
        canPerformBulkActions={canPerformBulkActions}
      />

      {/* Card View */}
      {viewMode === 'card' && (
        <EventsCardView
          events={filteredEvents}
          onEventClick={handleEventClick}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          canEdit={canEditEvent}
          canDelete={canDeleteEvent}
        />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <EventsTableView
          events={filteredEvents}
          selectedEvents={selectedEvents}
          onSelectEvent={toggleSelection}
          onSelectAll={selectAll}
          onEventClick={handleEventClick}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          canEdit={canEditEvent}
          canDelete={canDeleteEvent}
          canPerformBulkActions={canPerformBulkActions}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && !showForm && (
        <EventDetailsModal
          event={selectedEvent}
          organization={organization}
          onClose={() => setSelectedEvent(null)}
          onUpdate={async (data) => {
            setSelectedEvent({ ...selectedEvent, ...data });
            if (onRefresh) {
              onRefresh();
            }
          }}
          isDemo={isDemo}
          user={user}
          vendors={vendors}
          actionData={actionData}
        />
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <EmptyState
          icon={<Calendar size={48} className="text-gray-400" />}
          title="No events found"
          description={
            searchQuery || filters.status !== 'all' || filters.type !== 'all' || filters.budgetHealth !== 'all' || filters.region !== 'all'
              ? 'Try adjusting your filters or search'
              : 'Get started by creating your first event'
          }
          actionLabel={canCreateEvent ? "Create Event" : undefined}
          onAction={canCreateEvent ? handleCreateEvent : undefined}
        />
      )}
    </div>
  );
}


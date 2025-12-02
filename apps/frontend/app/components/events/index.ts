/**
 * Events module exports
 */

// Main components
export { EventsList } from './EventsList';
export { EventsListHeader } from './EventsListHeader';
export { EventsSearchBar } from './EventsSearchBar';
export { EventsFilters } from './EventsFilters';
export { EventsBulkActions } from './EventsBulkActions';
export { EventsCardView } from './EventsCardView';
export { EventsTableView } from './EventsTableView';
export { EventCard } from './EventCard';
export { EventTableRow } from './EventTableRow';
export { EventForm } from './EventForm';
export { EventDetailsModal } from './EventDetailsModal';
export { EventDocuments } from './EventDocuments';
export { EventNotes } from './EventNotes';

// Hooks
export { useEventFilters } from './hooks/useEventFilters';
export { useEventViewMode } from './hooks/useEventViewMode';
export { useEventSelection } from './hooks/useEventSelection';
export { useEventActions } from './hooks/useEventActions';
export { useEventTransform } from './hooks/useEventTransform';

// Utilities
export * from './utils/eventHelpers';
export * from './utils/eventTransformers';
export * from './utils/eventValidators';

// Types
export type { ViewMode } from './hooks/useEventViewMode';
export type { TransformedEvent } from './utils/eventTransformers';


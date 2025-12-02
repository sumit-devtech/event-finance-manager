/**
 * Main Components Barrel Export
 * 
 * This file exports all components from the components directory.
 * Use this for convenient imports: import { ComponentName } from '~/components'
 */

// Feature Modules
export * from './events';
export * from './expenses';
export * from './budget';
export * from './shared';

// Standalone Components
export { Analytics } from './Analytics';
export { AuthPage } from './AuthPage';
export { Dashboard } from './Dashboard';
export { ErrorBoundary } from './ErrorBoundary';
export { EventsList } from './EventsList';
export { LandingPage } from './LandingPage';
export { Layout } from './Layout';
export { Navigation } from './Navigation';
export { OrganizationSetup } from './OrganizationSetup';
export { Sidebar } from './Sidebar';
export { StakeholderManager } from './StakeholderManager';
export { StrategicGoals } from './StrategicGoals';
export { SubscriptionPage } from './SubscriptionPage';
export { TeamAssignments } from './TeamAssignments';
export { TeamManagement } from './TeamManagement';
export { UserProfile } from './UserProfile';
export { VendorManager } from './VendorManager';

// Backward compatibility re-exports (deprecated - use module exports instead)
/** @deprecated Use EventsList from ~/components/events instead */
export { EventsList as EventsListNew } from './events';
/** @deprecated Use EventDetailsModal from ~/components/events instead */
export { EventDetailsModal as EventDetailsExpanded } from './events';
/** @deprecated Use EventForm from ~/components/events instead */
export { EventForm } from './events';
/** @deprecated Use EventDocuments from ~/components/events instead */
export { EventDocuments } from './events';
/** @deprecated Use EventNotes from ~/components/events instead */
export { EventNotes } from './events';
/** @deprecated Use ExpenseTracker from ~/components/expenses instead */
export { ExpenseTracker } from './expenses';
/** @deprecated Use BudgetManager from ~/components/budget instead */
export { BudgetManager } from './budget';


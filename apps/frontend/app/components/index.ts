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
export { Dashboard } from './dashboard';
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
export { VendorManager } from './vendor';


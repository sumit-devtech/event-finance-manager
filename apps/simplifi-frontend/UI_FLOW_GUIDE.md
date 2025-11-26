# Simplifi Frontend - UI Flow Guide

## Entry Points

### Landing Page (`/`)
- **Purpose**: First point of entry for users
- **Features**:
  - Hero section with value proposition
  - Three action buttons: Demo, Sign Up, Sign In
  - Feature highlights
  - Call-to-action for signup
- **File**: `app/routes/_index.tsx`
- **Flow**: 
  - If user is logged in → Redirects to `/dashboard`
  - If not logged in → Shows landing page

### Demo Mode (`/demo`)
- **Purpose**: Allow users to try the app without signing up
- **Features**:
  - Explains what's available in demo mode
  - Warning that data is temporary
  - Options to start demo or sign up
- **File**: `app/routes/demo.tsx`
- **Flow**: 
  - If user is logged in → Redirects to `/dashboard`
  - If not → Shows demo page with option to start demo

### Sign Up (`/signup`)
- **Purpose**: Create new organization account
- **Features**:
  - Plan selection (Premium vs Enterprise)
  - Organization details form
  - Admin user creation
- **File**: `app/routes/signup.tsx`
- **Flow**: 
  - User selects plan (Premium: 1 free event, Enterprise: Unlimited)
  - Fills organization and admin details
  - Creates account and redirects to `/dashboard`

### Sign In (`/login`)
- **Purpose**: Authenticate existing users
- **File**: `app/routes/login.tsx`
- **Flow**: 
  - User enters email/password
  - On success → Redirects to `/dashboard`

## Main User Journey

### Dashboard (`/dashboard`)
- **Purpose**: Overview of events and statistics
- **Features**:
  - Quick stats cards (Total Events, Active, Completed, Planning)
  - Charts (Bar chart for events overview, Pie chart for status distribution)
  - Upcoming events list
  - Recent events list
  - Quick actions (New Event, View Events, Reports, Expenses)
- **File**: `app/routes/_protected.dashboard.tsx`
- **Uses**: `useFetcher` for background data refreshes

### Create Event (`/events/new`)
- **Purpose**: Create a new event
- **Features**:
  - Event form (name, description, dates, status)
  - **EventLimitGuard** component checks subscription limits:
    - Premium: Shows upgrade prompt if 1 event already created
    - Enterprise: No limits
  - Shows remaining free events for Premium users
- **File**: `app/routes/_protected.events.new.tsx`
- **Component**: `app/components/EventLimitGuard.tsx`

### Event Detail (`/events/:id`)
- **Purpose**: View and manage a single event
- **Features**:
  - Event overview with tabs:
    - Overview (default)
    - Budget Planning (`/events/:id/budget`)
    - Expenses (`/events/:id/expenses`)
    - ROI Analytics (`/events/:id/roi`)
    - Insights (`/events/:id/insights`)
    - CRM Sync (`/events/:id/crm-sync`)
    - Stakeholders (`/events/:id/stakeholders`)
  - Clone Event button
  - Edit Event button
- **File**: `app/routes/_protected.events.$id.tsx`

### Budget Planning (`/events/:id/budget`)
- **Purpose**: Manage budget versions and line items
- **Features**:
  - List of budget versions
  - Current final budget display
  - Budget line items table
  - Create new budget version
  - Clone budget version
- **File**: `app/routes/_protected.events.$id.budget.tsx`
- **Uses**: `useFetcher` for clone actions

### Expense Tracking (`/expenses`)
- **Purpose**: View all expenses across events
- **Features**:
  - List of all expenses
  - Filter by status
  - Link to expense detail
- **File**: `app/routes/_protected.expenses.tsx`

### Approvals (`/approvals`)
- **Purpose**: Review and approve pending expenses
- **Features**:
  - List of expenses pending approval
  - Approve/Reject buttons
  - Expense details (amount, vendor, event)
- **File**: `app/routes/_protected.approvals.tsx`
- **Uses**: `useFetcher` for approval actions

### ROI Analytics (`/events/:id/roi`)
- **Purpose**: View ROI metrics for an event
- **Features**:
  - ROI percentage
  - Total revenue
  - Total costs
  - Calculate ROI button
- **File**: `app/routes/_protected.events.$id.roi.tsx`
- **Uses**: `useFetcher` for calculate action

### Insights (`/insights`)
- **Purpose**: View AI-powered insights across all events
- **Features**:
  - Insights grouped by event
  - Link to event-specific insights
  - Generate insights action
- **File**: `app/routes/_protected.insights.tsx`

### Portfolio Dashboard (`/portfolio`)
- **Purpose**: Overview of all events in a portfolio view
- **Features**:
  - Portfolio metrics (Total, Active, Completed events)
  - Grid view of all events
  - Quick access to event details
- **File**: `app/routes/_protected.portfolio.tsx`

### Subscription (`/subscription`)
- **Purpose**: Manage subscription plan
- **Features**:
  - Current plan display
  - Plan comparison (Premium vs Enterprise)
  - Upgrade/downgrade options
  - Event count for Premium users
- **File**: `app/routes/_protected.subscription.tsx`
- **Uses**: `useFetcher` for plan changes

### Stakeholders (`/events/:id/stakeholders`)
- **Purpose**: Manage event stakeholders
- **Features**:
  - List of stakeholders
  - Add stakeholder form
  - Remove stakeholder action
- **File**: `app/routes/_protected.events.$id.stakeholders.tsx`
- **Uses**: `useFetcher` for add/remove actions

## Subscription Flow

### Premium User Flow:
1. **First Event**: 
   - Can create event freely
   - Shows "1 free event remaining" message
   - EventLimitGuard allows creation

2. **Second Event**:
   - EventLimitGuard blocks creation
   - Shows upgrade prompt with link to `/subscription`
   - Must upgrade to Enterprise to create more events

### Enterprise User Flow:
- Unlimited events
- No limits shown
- All features available

## Key Components

### EventLimitGuard (`app/components/EventLimitGuard.tsx`)
- **Purpose**: Enforce subscription limits
- **Usage**: Wraps event creation form
- **Behavior**:
  - Premium + 0 events: Allow creation
  - Premium + 1+ events: Show upgrade prompt
  - Enterprise: Always allow

### UpgradePrompt (`app/components/UpgradePrompt.tsx`)
- **Purpose**: Display upgrade prompts throughout app
- **Usage**: Can be used anywhere to prompt upgrades
- **Features**: Customizable message and feature name

## Navigation Structure

The navigation menu (`app/components/Navigation.tsx`) includes:
- Dashboard
- Events
- Portfolio
- Approvals
- Expenses
- Vendors
- Reports
- ROI Analytics
- Insights
- Notifications
- Users (admin only)
- Organizations (admin only)
- Subscriptions (admin only)

## Data Fetching Patterns

### Using useFetcher for:
1. **Form Submissions**: Create/update/delete actions
2. **Background Refreshes**: Notifications, data updates
3. **Optimistic Updates**: Immediate UI feedback
4. **Approval Actions**: Approve/reject expenses
5. **Calculate Actions**: ROI calculation, insights generation

### Example Patterns:
```typescript
// Form submission
const fetcher = useFetcher();
fetcher.submit(formData, { 
  method: "post", 
  action: "/actions/expenses/create" 
});

// Background data load
fetcher.load("/loaders/notifications/fetch");

// Optimistic update
if (fetcher.state === "submitting") {
  // Show optimistic UI
}
```

## Route Structure

### Public Routes:
- `/` - Landing page
- `/demo` - Demo mode
- `/signup` - Sign up
- `/login` - Sign in
- `/unauthorized` - Unauthorized access

### Protected Routes (require authentication):
- `/dashboard` - Main dashboard
- `/events` - Events list
- `/events/new` - Create event (with limit guard)
- `/events/:id` - Event detail
- `/events/:id/edit` - Edit event
- `/events/:id/budget` - Budget planning
- `/events/:id/expenses` - Event expenses
- `/events/:id/roi` - ROI analytics
- `/events/:id/insights` - Event insights
- `/events/:id/crm-sync` - CRM sync
- `/events/:id/stakeholders` - Stakeholders
- `/expenses` - All expenses
- `/approvals` - Approval queue
- `/vendors` - Vendors list
- `/reports` - Reports
- `/portfolio` - Portfolio dashboard
- `/insights` - Global insights
- `/notifications` - Notifications
- `/users` - User management (admin)
- `/organizations/:id` - Organization settings
- `/subscription` - Subscription management

### Action Routes (fetcher-only):
- `/actions/logout` - Logout action
- `/actions/events/clone` - Clone event

## File Structure Reference

```
apps/simplifi-frontend/
├── app/
│   ├── components/
│   │   ├── EventLimitGuard.tsx    # Subscription limit enforcement
│   │   ├── UpgradePrompt.tsx      # Upgrade prompts
│   │   ├── Layout.tsx             # Main layout
│   │   ├── Navigation.tsx         # Sidebar navigation
│   │   ├── UserProfile.tsx        # User dropdown
│   │   └── ErrorBoundary.tsx      # Error handling
│   ├── lib/
│   │   ├── api.ts                 # API client (backend-simplifi)
│   │   ├── auth.ts                # Auth utilities
│   │   ├── auth.server.ts         # Server-side auth
│   │   ├── session.ts             # Session management
│   │   └── env.ts                 # Environment variables
│   ├── routes/
│   │   ├── _index.tsx             # Landing page
│   │   ├── demo.tsx               # Demo mode
│   │   ├── signup.tsx             # Sign up
│   │   ├── login.tsx              # Sign in
│   │   ├── _actions.logout.tsx    # Logout action
│   │   ├── unauthorized.tsx       # Unauthorized page
│   │   ├── _protected.tsx        # Protected layout
│   │   ├── _protected.dashboard.tsx
│   │   ├── _protected.events.tsx
│   │   ├── _protected.events.new.tsx
│   │   ├── _protected.events.$id.tsx
│   │   ├── _protected.events.$id.edit.tsx
│   │   ├── _protected.events.$id.budget.tsx
│   │   ├── _protected.events.$id.expenses.tsx
│   │   ├── _protected.events.$id.roi.tsx
│   │   ├── _protected.events.$id.insights.tsx
│   │   ├── _protected.events.$id.crm-sync.tsx
│   │   ├── _protected.events.$id.stakeholders.tsx
│   │   ├── _protected.expenses.tsx
│   │   ├── _protected.approvals.tsx
│   │   ├── _protected.vendors.tsx
│   │   ├── _protected.reports.tsx
│   │   ├── _protected.portfolio.tsx
│   │   ├── _protected.insights.tsx
│   │   ├── _protected.notifications.tsx
│   │   ├── _protected.users.tsx
│   │   └── _protected.subscription.tsx
│   ├── styles/
│   │   └── tailwind.css           # Tailwind styles
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   └── root.tsx
├── server.mjs                     # Express server
├── vite.config.ts                 # Vite config
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cd apps/simplifi-frontend
   # Create .env file with:
   # API_BASE_URL=http://localhost:3334/api/v1
   # SESSION_SECRET=your-secret-key
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Access the app**:
   - Landing page: http://localhost:5173
   - Demo mode: http://localhost:5173/demo
   - Sign up: http://localhost:5173/signup

## Requirements Implementation Status

✅ Landing page with demo/signup/login options
✅ Demo mode route
✅ Signup with Premium/Enterprise selection
✅ Event creation with subscription limit guard
✅ Upgrade prompts component
✅ Budget planning route
✅ Expense tracking
✅ Approvals route
✅ ROI dashboard
✅ Stakeholders management
✅ Clone event functionality
✅ Portfolio dashboard
✅ Global insights
✅ Subscription management
✅ Navigation with all routes

All requirements from the UI flow overview have been implemented!


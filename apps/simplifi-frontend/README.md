# Simplifi Frontend

Remix frontend application for the Simplifi Event Finance Manager system.

## Overview

This is a Remix application that connects to the `backend-simplifi` API (running on port 3334). It provides a modern, responsive UI for managing events, budgets, expenses, vendors, and generating reports.

## Features

- **Authentication**: JWT-based authentication with session management
- **Events Management**: Create, view, edit, and manage events
- **Budget Planning**: Track budgets and budget versions
- **Expense Tracking**: Manage expenses with approval workflows
- **Vendor Management**: Maintain vendor relationships
- **Reports**: Generate and view financial reports
- **ROI Analytics**: Calculate and view ROI metrics
- **Insights**: AI-powered insights for events
- **CRM Integration**: Sync events with CRM systems
- **Notifications**: Real-time notifications using fetchers

## Tech Stack

- **Remix**: Full-stack React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library for data visualization

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Backend-simplifi running on port 3334

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Or install dependencies for this app specifically
cd apps/simplifi-frontend
pnpm install
```

### Environment Variables

Create a `.env` file in `apps/simplifi-frontend/`:

```env
API_BASE_URL=http://localhost:3334/api/v1
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=5173
```

### Development

```bash
# From monorepo root
pnpm --filter @event-finance-manager/simplifi-frontend dev

# Or from app directory
cd apps/simplifi-frontend
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## Project Structure

```
apps/simplifi-frontend/
├── app/
│   ├── components/       # Reusable React components
│   ├── lib/             # Utility functions and API client
│   ├── routes/          # Remix routes
│   ├── styles/          # CSS files
│   ├── entry.client.tsx # Client entry point
│   ├── entry.server.tsx # Server entry point
│   └── root.tsx         # Root component
├── remix.config.js      # Remix configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Routes

### Public Routes
- `/login` - Login page
- `/unauthorized` - Unauthorized access page

### Protected Routes (require authentication)
- `/dashboard` - Dashboard with stats and charts
- `/events` - Events list
- `/events/new` - Create new event
- `/events/:id` - Event detail
- `/events/:id/edit` - Edit event
- `/events/:id/budgets` - Event budgets
- `/events/:id/expenses` - Event expenses
- `/events/:id/roi` - ROI analytics
- `/events/:id/insights` - AI insights
- `/events/:id/crm-sync` - CRM sync status
- `/expenses` - All expenses
- `/vendors` - Vendors list
- `/reports` - Reports list
- `/notifications` - Notifications
- `/users` - User management (admin only)

## Data Fetching

This application uses Remix's `useFetcher` hook for:
- Form submissions (create/update/delete)
- Optimistic UI updates
- Background data refreshes
- Approval actions
- Status updates

Example:
```typescript
const fetcher = useFetcher();
fetcher.submit(formData, { 
  method: "post", 
  action: "/actions/expenses/create" 
});
```

## API Integration

All API calls go through the `app/lib/api.ts` client which:
- Points to `backend-simplifi` API (port 3334)
- Handles JWT authentication
- Provides error handling
- Supports GET, POST, PUT, DELETE, PATCH methods

## Styling

The app uses Tailwind CSS with custom CSS variables for theming. Styles are defined in `app/styles/tailwind.css`.

## License

Private - Event Finance Manager


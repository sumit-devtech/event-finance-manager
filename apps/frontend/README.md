# Event Finance Manager - Frontend

Remix frontend application for Event Finance Manager.

## Architecture

All data access follows this pattern:
**Remix Loaders/Actions → NestJS API → Database**

No direct database client usage in the frontend.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Install Tailwind CSS (if not already installed)

```bash
pnpm add -D tailwindcss postcss autoprefixer
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `API_BASE_URL` - Backend API base URL (default: `http://localhost:3334/api` for backend-simplifi)
- `SESSION_SECRET` - Secret for session encryption (change in production!)

### 4. Development

```bash
pnpm dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

## Project Structure

```
app/
├── components/          # React components
│   └── ErrorBoundary.tsx
├── lib/                 # Utilities and helpers
│   ├── api.ts          # API client for NestJS backend
│   ├── auth.ts         # Authentication utilities
│   ├── env.ts          # Environment variables
│   └── session.ts      # Session management
├── routes/             # Remix routes
│   ├── example.action.ts  # Example action pattern
│   ├── example.loader.ts  # Example loader pattern
│   └── _index.tsx      # Home page
├── root.tsx            # Root component
└── tailwind.css        # Tailwind CSS imports
```

## Key Features

### API Client (`app/lib/api.ts`)

Centralized API client for making requests to the NestJS backend:

```typescript
import { api } from "~/lib/api";

// GET request
const events = await api.get("/events", { token });

// POST request
const newEvent = await api.post("/events", data, { token });

// File upload
const file = await api.upload("/files/upload", file, { eventId: "123" }, { token });
```

### Authentication (`app/lib/auth.ts`)

Utilities for handling authentication:

```typescript
import { requireAuth, requireRole } from "~/lib/auth";

// In a loader
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  // or
  const admin = await requireRole(request, ["Admin"]);
  // ...
}
```

### Loaders and Actions

**Loaders** - Fetch data on the server:

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const token = getAuthTokenFromRequest(request);
  const data = await api.get("/events", { token });
  return json({ data });
}
```

**Actions** - Handle form submissions and mutations:

```typescript
export async function action({ request }: ActionFunctionArgs) {
  const token = getAuthTokenFromRequest(request);
  const formData = await request.formData();
  const result = await api.post("/events", Object.fromEntries(formData), { token });
  return json({ success: true, data: result });
}
```

### Error Boundaries

Error boundaries are set up in `app/components/ErrorBoundary.tsx` and exported from `root.tsx`. They handle:
- Route errors (404, etc.)
- API client errors
- Generic errors

## Styling

Tailwind CSS is configured and ready to use:

```tsx
<div className="bg-gray-50 p-4 rounded-lg">
  <h1 className="text-2xl font-bold">Hello World</h1>
</div>
```

## Notes

- All API calls are authenticated using Bearer tokens from session cookies
- Environment variables are accessed through `app/lib/env.ts`
- Error handling is centralized in the API client
- Session management uses Remix's cookie session storage


# ⚡ Remix Quick Reference Card

## 🚀 Common Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)

# Building
npm run build                  # Build for production
npm start                      # Start production server

# Type checking
npm run typecheck             # Check TypeScript errors
```

---

## 📁 File Structure Quick Guide

```
app/routes/
  _index.tsx                  → /
  auth.tsx                    → /auth
  dashboard.tsx               → /dashboard
  events._index.tsx           → /events
  events.new.tsx              → /events/new
  events.$id.tsx              → /events/:id
  api.events.tsx              → /api/events (API endpoint)
```

---

## 🎯 Routing Patterns

| File Path | URL | Example |
|-----------|-----|---------|
| `_index.tsx` | `/` | Landing page |
| `about.tsx` | `/about` | About page |
| `posts._index.tsx` | `/posts` | Posts list |
| `posts.$id.tsx` | `/posts/:id` | `/posts/123` |
| `posts.$id.edit.tsx` | `/posts/:id/edit` | `/posts/123/edit` |
| `api.events.tsx` | `/api/events` | API endpoint |

---

## 📤 Data Loading (Server → Client)

```typescript
// Loader: Fetch data on server
export const loader = async ({ request, params }) => {
  const data = await fetchData();
  return json({ data });
};

// Component: Use data
export default function Page() {
  const { data } = useLoaderData<typeof loader>();
  return <div>{data}</div>;
}
```

---

## 📥 Form Submissions (Client → Server)

```typescript
// Action: Handle form on server
export const action = async ({ request }) => {
  const formData = await request.formData();
  const result = await saveData(formData);
  return redirect('/success');
};

// Component: Submit form
export default function Page() {
  return (
    <Form method="post">
      <input name="title" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

---

## 🔐 Authentication Patterns

### **Require Auth (Redirects if not logged in)**
```typescript
import { requireAuth } from '~/lib/supabase.server';

export const loader = async ({ request }) => {
  const { session } = await requireAuth(request);
  // User is guaranteed to be authenticated here
  return json({ user: session.user });
};
```

### **Optional Auth (Doesn't redirect)**
```typescript
import { getAuthSession } from '~/lib/supabase.server';

export const loader = async ({ request }) => {
  const { session } = await getAuthSession(request);
  return json({ user: session?.user || null });
};
```

---

## 📡 API Client Usage

```typescript
import { eventsAPI } from '~/lib/api-client';

// List
const events = await eventsAPI.list(organizationId);

// Create
const newEvent = await eventsAPI.create(data);

// Update
const updated = await eventsAPI.update(id, data);

// Delete
await eventsAPI.delete(id);
```

### **All Available APIs**
```typescript
import {
  eventsAPI,           // Event management
  expensesAPI,         // Expense tracking + approval
  organizationsAPI,    // Organization CRUD
  usersAPI,            // User management
  vendorsAPI,          // Vendor directory
  budgetsAPI,          // Budget + versions
  notificationsAPI,    // Notifications
  analyticsAPI,        // Analytics + ROI
  filesAPI,            // File upload/download
  activityAPI,         // Activity logging
  stakeholdersAPI,     // Stakeholder management
} from '~/lib/api-client';
```

---

## 🎨 Import Patterns

```typescript
// Components
import Component from '~/components/Component';

// Utils
import { helper } from '~/utils/helpers';

// API Client
import { eventsAPI } from '~/lib/api-client';

// Server-only utilities (only in loaders/actions)
import { requireAuth } from '~/lib/supabase.server';
```

---

## 🔄 Navigation

```typescript
import { Link, useNavigate } from '@remix-run/react';

// Link component
<Link to="/dashboard">Dashboard</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate('/dashboard');
```

---

## 📝 Form States

```typescript
import { useNavigation, useActionData } from '@remix-run/react';

export default function Page() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  return (
    <Form method="post">
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
      {actionData?.error && <p>{actionData.error}</p>}
    </Form>
  );
}
```

---

## 🎯 Meta Tags (SEO)

```typescript
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Page Title" },
    { name: "description", content: "Page description" },
    { property: "og:title", content: "Social Title" },
    { property: "og:image", content: "/image.jpg" },
  ];
};
```

---

## ⚠️ Error Handling

### **Error Boundary (Per Route)**
```typescript
export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div>
      <h1>Error!</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

### **Throw Errors from Loader/Action**
```typescript
export const loader = async ({ params }) => {
  const data = await fetchData(params.id);
  
  if (!data) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json({ data });
};
```

---

## 🔄 Revalidation

```typescript
import { useRevalidator } from '@remix-run/react';

export default function Page() {
  const revalidator = useRevalidator();
  
  const handleRefresh = () => {
    revalidator.revalidate(); // Re-runs loader
  };
  
  return <button onClick={handleRefresh}>Refresh</button>;
}
```

---

## 📤 File Uploads

```typescript
// Action
export const action = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  // Upload to Supabase Storage or your backend
  const result = await filesAPI.upload(file, { eventId: 'xxx' });
  
  return json({ success: true });
};

// Component
<Form method="post" encType="multipart/form-data">
  <input type="file" name="file" />
  <button type="submit">Upload</button>
</Form>
```

---

## 🎨 Styling

```typescript
// Tailwind classes (already configured)
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// CSS Modules (optional)
import styles from './component.module.css';
<div className={styles.container}>Content</div>
```

---

## 🔍 Search Params

```typescript
// Read params
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("q");
  const page = url.searchParams.get("page") || "1";
  
  return json({ search, page });
};

// Update params
const [searchParams, setSearchParams] = useSearchParams();
setSearchParams({ q: "search term", page: "2" });
```

---

## 🔐 Environment Variables

```typescript
// Server-side only (loaders/actions)
const apiKey = process.env.API_KEY;

// Client-side (expose via loader)
export const loader = async () => {
  return json({
    publicKey: process.env.PUBLIC_KEY, // Only expose what's safe!
  });
};
```

---

## 🎯 Common Patterns

### **Authenticated Route**
```typescript
export const loader = async ({ request }) => {
  const { session } = await requireAuth(request);
  const data = await fetchUserData(session.user.id);
  return json({ data });
};

export default function ProtectedPage() {
  const { data } = useLoaderData<typeof loader>();
  return <div>{data}</div>;
}
```

### **API Endpoint**
```typescript
export const loader = async ({ request }) => {
  const data = await fetchData();
  return json({ data });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "create") {
    const result = await createItem(formData);
    return json(result);
  }
  
  return json({ error: "Invalid intent" }, { status: 400 });
};
```

### **List + Detail Pattern**
```typescript
// app/routes/events._index.tsx
export const loader = async () => {
  const events = await fetchEvents();
  return json({ events });
};

// app/routes/events.$id.tsx
export const loader = async ({ params }) => {
  const event = await fetchEvent(params.id);
  return json({ event });
};
```

---

## 🐛 Debugging

```typescript
// Server-side logging (visible in terminal)
console.log('Server:', data);

// Client-side logging (visible in browser console)
useEffect(() => {
  console.log('Client:', data);
}, [data]);

// Loader timing
export const loader = async () => {
  console.time('fetch');
  const data = await fetchData();
  console.timeEnd('fetch');
  return json({ data });
};
```

---

## 🚀 Performance Tips

1. **Use loaders** - Faster than client-side fetching
2. **Parallel data loading** - Multiple loaders run in parallel
3. **Prefetching** - `<Link prefetch="intent">` prefetches on hover
4. **Caching** - Use HTTP caching headers in loaders
5. **Defer non-critical data** - Use `defer()` for slow queries

---

## 📚 Helpful Links

| Resource | URL |
|----------|-----|
| Remix Docs | https://remix.run/docs |
| Supabase Docs | https://supabase.com/docs |
| Tailwind Docs | https://tailwindcss.com/docs |
| TypeScript Docs | https://www.typescriptlang.org/docs |

---

## 🎉 Quick Wins

```bash
# Create a new route page
touch app/routes/my-page.tsx

# Create a new API endpoint
touch app/routes/api.my-endpoint.tsx

# Create a new component
touch components/MyComponent.tsx

# Test locally
npm run dev

# Deploy to Vercel
vercel --prod
```

---

**Keep this reference handy! 📌**

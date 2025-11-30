# React Quick Start Guide

## ✅ Remix Structure Removed

All Remix-specific files have been removed. This is now a **standard React application** using Vite.

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
event-budget-planner/
├── index.html                 # HTML entry point
├── src/
│   └── main.tsx              # React entry point
├── App.tsx                   # Main App component
├── components/               # All React components (33 total)
│   ├── MainApp.tsx          # Main authenticated app
│   ├── LandingPage.tsx      # Landing page
│   ├── AuthPage.tsx         # Authentication
│   ├── Dashboard*.tsx       # Dashboard components
│   └── ...                  # Other components
├── utils/
│   ├── api.ts               # API client for backend
│   ├── demoData.ts          # Demo mode data
│   └── supabase/
│       ├── client.ts        # Supabase client
│       └── info.tsx         # Supabase config
├── styles/
│   └── globals.css          # Global Tailwind styles
├── supabase/functions/server/
│   ├── index.tsx            # Backend server (Deno)
│   └── kv_store.tsx         # KV store (protected)
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## 🎯 Key Changes from Remix

### Before (Remix)
- Used `app/routes/` for routing
- Server-side rendering (SSR)
- Loaders and Actions
- FormData-based mutations
- `@remix-run/*` packages

### After (Pure React)
- Client-side routing with state
- Single-page application (SPA)
- Direct API calls with `fetch`
- JSON-based API
- Vite + React only

## 📦 Dependencies

### Production Dependencies
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "latest",      // Icons only
  "recharts": "^2.10.3",         // Charts only
  "motion": "latest"             // Animations only
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "typescript": "^5.1.6",
  "vite": "^5.1.0",
  "tailwindcss": "^4.0.0"
}
```

## 🔌 API Integration

### Frontend API Client (`/utils/api.ts`)

All API calls go through the centralized client:

```typescript
import { eventsAPI, expensesAPI, vendorsAPI } from './utils/api';

// List events
const events = await eventsAPI.list(organizationId);

// Create event
const newEvent = await eventsAPI.create({
  name: 'Conference 2024',
  date: '2024-12-01',
  location: 'San Francisco',
  organizationId: 'org-123',
});

// Update event
await eventsAPI.update(eventId, { name: 'Updated Name' });

// Delete event
await eventsAPI.delete(eventId);
```

### Backend Server (`/supabase/functions/server/index.tsx`)

Deno Edge Function using Hono framework:

```typescript
// All routes are prefixed with /make-server-3dd0a4ac
app.get('/make-server-3dd0a4ac/events', async (c) => {
  // Handler code
});
```

## 🔐 Authentication Flow

### 1. Demo Mode
```typescript
// In App.tsx
const handleDemoMode = () => {
  setIsDemo(true);
  localStorage.setItem('eventbudget_demo', 'true');
  setCurrentView('app');
};
```

### 2. Sign Up
```typescript
// Use Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### 3. Sign In
```typescript
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Set access token for API calls
setAccessToken(session.access_token);
```

### 4. Session Check
```typescript
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setAccessToken(session.access_token);
      // Fetch user profile
    }
  };
  checkSession();
}, []);
```

## 🎨 Component Architecture

### Main Application Flow

```
App.tsx
  ├─ LandingPage
  │    ├─ Try Demo → MainApp (demo mode)
  │    └─ Get Started → AuthPage
  │
  ├─ AuthPage
  │    ├─ Login → MainApp
  │    └─ Register → OrganizationSetup
  │
  ├─ OrganizationSetup → SubscriptionPage
  │
  ├─ SubscriptionPage → MainApp
  │
  └─ MainApp
       ├─ Dashboard
       ├─ EventsList
       ├─ BudgetManager
       ├─ ExpenseTracker
       ├─ VendorManager
       ├─ Analytics
       ├─ TeamManagement
       └─ AdvancedFeaturesDemo
```

### State Management

Uses React's built-in state management:

```typescript
// App.tsx
const [user, setUser] = useState<any>(null);
const [organization, setOrganization] = useState<any>(null);
const [isDemo, setIsDemo] = useState(false);
const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app'>('landing');
```

## 📱 Responsive Design

All components are mobile-responsive using Tailwind CSS:

```tsx
<div className="
  min-h-screen 
  px-4 sm:px-6 lg:px-8        // Responsive padding
  py-4 sm:py-6 lg:py-8        // Responsive vertical spacing
">
  <div className="
    grid 
    grid-cols-1                 // Mobile: 1 column
    md:grid-cols-2              // Tablet: 2 columns
    lg:grid-cols-3              // Desktop: 3 columns
    gap-4 sm:gap-6              // Responsive gap
  ">
    {/* Content */}
  </div>
</div>
```

## 🛠️ Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR - changes appear immediately without full page reload.

### Type Checking
```bash
npm run typecheck
```

### Build Optimization
```bash
npm run build
# Output: dist/ directory
```

### Environment Variables
Access in code with `import.meta.env`:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 🚨 Important Notes

### 1. No Third-Party UI Libraries
The `components/ui/` directory contains components that use third-party libraries (Radix UI, class-variance-authority). These are **NOT USED** by the main application components.

The main 33 components are pure React + Tailwind CSS.

### 2. Backend Limitations
- Only one KV table available
- Cannot create new tables or migrations
- Use the existing KV store for all data

### 3. API Routes
All backend routes are prefixed with `/make-server-3dd0a4ac/` for security.

## 📝 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Set up environment variables
3. ✅ Start development server (`npm run dev`)
4. ✅ Try demo mode to explore features
5. ✅ Create an account to test full flow
6. ✅ Build for production when ready

## 🆘 Troubleshooting

### Issue: "Cannot find module"
**Solution:** Run `npm install` to ensure all dependencies are installed.

### Issue: "Supabase client error"
**Solution:** Check your `.env` file and ensure Supabase credentials are correct.

### Issue: "Build fails"
**Solution:** Run `npm run typecheck` to identify TypeScript errors.

### Issue: "API calls fail"
**Solution:** Ensure backend server is deployed and accessible.

---

**You're now running a pure React SPA! 🎉**

No more Remix! Just React, TypeScript, and Vite.

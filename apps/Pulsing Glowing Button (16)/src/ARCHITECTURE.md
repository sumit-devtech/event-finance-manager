# Application Architecture

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     React Application                       │ │
│  │                      (Single Page App)                      │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │  App.tsx     │  │ Components/  │  │  utils/api.ts   │ │ │
│  │  │ (Routing &   │→ │  (33 files)  │→ │ (API Client)    │ │ │
│  │  │  State)      │  │              │  │                 │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │                                              ↓             │ │
│  └──────────────────────────────────────────────────────────── │
└────────────────────────────────────────┼──────────────────────┘
                                         │
                              HTTPS Fetch API
                                         │
                                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase (Backend)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Edge Functions (Deno + Hono)                │  │
│  │        /supabase/functions/server/index.tsx              │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │  │
│  │  │   Auth      │  │   Events    │  │    Expenses    │  │  │
│  │  │  Routes     │  │   Routes    │  │     Routes     │  │  │
│  │  └─────────────┘  └─────────────┘  └────────────────┘  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │  │
│  │  │   Vendors   │  │   Budgets   │  │  Organizations │  │  │
│  │  │   Routes    │  │   Routes    │  │     Routes     │  │  │
│  │  └─────────────┘  └─────────────┘  └────────────────┘  │  │
│  │                           ↓                              │  │
│  └───────────────────────────────────────────────────────────  │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    KV Store (Database)                    │ │
│  │              /supabase/functions/server/kv_store.tsx       │ │
│  │                                                            │ │
│  │  Key Pattern: "org:123", "event:456", "expense:789"       │ │
│  │  Storage: PostgreSQL table (kv_store_3dd0a4ac)            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   Supabase Services                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │    Auth     │  │   Storage   │  │   Realtime      │  │ │
│  │  │ (JWT-based) │  │  (Buckets)  │  │ (WebSockets)    │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Application Flow

### 1. Initial Load
```
Browser → index.html → src/main.tsx → App.tsx → Landing Page
```

### 2. Demo Mode Flow
```
Landing Page 
  → Click "Try Demo"
  → Set localStorage("eventbudget_demo", "true")
  → Load MainApp with demo data
  → All data stored in localStorage
```

### 3. Registration Flow
```
Landing Page
  → Click "Get Started"
  → AuthPage (Register)
  → POST /make-server-3dd0a4ac/signup
  → Supabase Auth creates user
  → OrganizationSetup
  → POST /make-server-3dd0a4ac/organizations
  → SubscriptionPage (optional)
  → MainApp
```

### 4. Login Flow
```
Landing Page
  → Click "Sign In"
  → AuthPage (Login)
  → Supabase Auth signInWithPassword()
  → Get access token
  → Fetch user profile (GET /make-server-3dd0a4ac/profile)
  → MainApp
```

### 5. API Call Flow
```
Component
  → import { eventsAPI } from './utils/api'
  → eventsAPI.create(data)
  → fetch(API_BASE_URL + '/events', { headers: { Authorization: Bearer token } })
  → Edge Function receives request
  → Validates auth token
  → Reads/writes to KV store
  → Returns JSON response
  → Component updates state
  → UI re-renders
```

---

## 📁 Frontend Architecture

### Component Hierarchy

```
App.tsx (Root)
├── LandingPage
│   ├── Hero section
│   ├── Features grid
│   ├── Pricing cards
│   └── CTA buttons
│
├── AuthPage
│   ├── Login form
│   ├── Register form
│   └── Toggle between views
│
├── OrganizationSetup
│   └── Organization form
│
├── SubscriptionPage
│   └── Plan selection
│
└── MainApp
    ├── Sidebar
    │   ├─��� Navigation menu
    │   └── User profile
    │
    └── Content Area (Tab-based routing)
        ├── Dashboard
        │   ├── Stats cards
        │   ├── Recent events
        │   └── Quick actions
        │
        ├── EventsList
        │   ├── EventForm
        │   ├── EventDetailsExpanded
        │   └── Event cards
        │
        ├── BudgetManager
        │   ├── Budget form
        │   ├── Line items
        │   └── Version history
        │
        ├── ExpenseTracker
        │   ├── Expense form
        │   ├── Approval workflow
        │   └── Receipt upload
        │
        ├── VendorManager
        │   ├── Vendor form
        │   └── Vendor list
        │
        ├── Analytics
        │   ├── ROIDashboard
        │   ├── Charts (Recharts)
        │   └── Metrics
        │
        ├── TeamManagement
        │   ├── UsersManager
        │   ├── TeamAssignments
        │   └── RoleBasedAccess
        │
        └── AdvancedFeaturesDemo
            ├── NotificationCenter
            ├── ActivityLog
            ├── FileUploadManager
            ├── ApprovalWorkflowHistory
            └── StakeholderManagement
```

---

## 🔌 Backend Architecture

### API Routes (Edge Functions)

```
/make-server-3dd0a4ac/
├── /health                    → Health check
├── /profile                   → GET user profile
│
├── /organizations
│   ├── POST                   → Create organization
│   ├── /:id                   → GET organization
│   └── /:id/members           → GET members
│
├── /events
│   ├── GET                    → List events
│   ├── POST                   → Create event
│   ├── /:id                   → GET/PUT/DELETE event
│   ├── /:id/budgets           → GET budgets for event
│   └── /:id/expenses          → GET expenses for event
│
├── /budgets
│   ├── POST                   → Create budget
│   └── /:id/lines             → GET budget lines
│
├── /budget-lines
│   └── POST                   → Create budget line
│
├── /expenses
│   ├── POST                   → Create expense
│   ├── /:id/approve           → PUT approve expense
│   └── /:id/reject            → PUT reject expense
│
└── /vendors
    ├── GET                    → List vendors
    └── POST                   → Create vendor
```

### Middleware Stack

```
Request
  ↓
[CORS Middleware]               → Allow cross-origin requests
  ↓
[Logger Middleware]             → Log all requests
  ↓
[Auth Middleware] (protected)   → Validate JWT token
  ↓
[Route Handler]                 → Business logic
  ↓
[KV Store Operations]           → Database read/write
  ↓
Response (JSON)
```

---

## 💾 Data Architecture

### Key-Value Store Structure

```
Key Pattern                    Value
─────────────────────────────  ─────────────────────────────
org:{orgId}                    → Organization object
user:{userId}                  → User profile object
user:{userId}:org              → Organization ID (reference)

event:{eventId}                → Event object
org:{orgId}:events             → Array of event IDs

budget:{budgetId}              → Budget object
event:{eventId}:budgets        → Array of budget IDs

line:{lineId}                  → Budget line object
budget:{budgetId}:lines        → Array of line IDs

expense:{expenseId}            → Expense object
event:{eventId}:expenses       → Array of expense IDs

vendor:{vendorId}              → Vendor object
org:{orgId}:vendors            → Array of vendor IDs

notification:{notifId}         → Notification object
user:{userId}:notifications    → Array of notification IDs

activity:{activityId}          → Activity log object
event:{eventId}:activities     → Array of activity IDs

file:{fileId}                  → File metadata
expense:{expenseId}:files      → Array of file IDs

stakeholder:{stakeholderId}    → Stakeholder object
event:{eventId}:stakeholders   → Array of stakeholder IDs

assignment:{assignmentId}      → Team assignment object
event:{eventId}:assignments    → Array of assignment IDs
user:{userId}:assignments      → Array of assignment IDs

membership:{membershipId}      → Organization membership
org:{orgId}:member:{userId}    → Membership object
```

### Data Relationships

```
Organization
  ├── has many Users (via memberships)
  ├── has many Events
  └── has many Vendors

User
  ├── belongs to Organization
  ├── has many Events (via assignments)
  └── has many Notifications

Event
  ├── belongs to Organization
  ├── has many Budgets
  ├── has many Expenses
  ├── has many Stakeholders
  ├── has many Assignments
  └── has many ActivityLogs

Budget
  ├── belongs to Event
  ├── has many BudgetLines
  └── has version history

Expense
  ├── belongs to Event
  ├── has Approval workflow
  └── has many Files

Vendor
  └── belongs to Organization
```

---

## 🔐 Authentication Architecture

### JWT Token Flow

```
1. User Login
   → POST /auth/signin (Supabase Auth)
   → Returns: { access_token, refresh_token, user }

2. Store Token
   → setAccessToken(access_token)
   → Store in memory (not localStorage for security)

3. API Requests
   → Every request includes:
     Authorization: Bearer {access_token}

4. Backend Validation
   → Extract token from header
   → Validate with Supabase:
     supabase.auth.getUser(access_token)
   → Returns user object if valid
   → Returns 401 if invalid

5. Token Refresh (automatic)
   → Supabase SDK handles refresh automatically
   → New access_token issued before expiry
```

### Protected Routes

```
Public Routes (No Auth):
  ✅ Landing page
  ✅ Auth page (login/register)

Protected Routes (Require Auth):
  🔒 Organization setup
  🔒 Subscription page
  🔒 Main app (all features)
  🔒 All API endpoints (except /health)
```

---

## 📱 State Management

### Global State (App.tsx)

```typescript
// User state
const [user, setUser] = useState<User | null>(null);

// Organization state
const [organization, setOrganization] = useState<Org | null>(null);

// Demo mode flag
const [isDemo, setIsDemo] = useState<boolean>(false);

// Current view/route
const [currentView, setCurrentView] = useState<View>('landing');

// Loading state
const [loading, setLoading] = useState<boolean>(true);
```

### Component State (Local)

```typescript
// Each component manages its own state
// Example: EventsList component

const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
const [showForm, setShowForm] = useState<boolean>(false);
```

### Demo Mode State (LocalStorage)

```typescript
// Demo mode uses localStorage
localStorage.setItem('eventbudget_demo', 'true');
localStorage.setItem('demo_events', JSON.stringify(events));
localStorage.setItem('demo_expenses', JSON.stringify(expenses));
// etc...
```

---

## 🎨 Styling Architecture

### Tailwind CSS Utility Classes

```
No custom CSS files needed!
All styling done with Tailwind utility classes.

Example:
<div className="
  px-4 py-2                 // Padding
  bg-blue-600               // Background
  text-white                // Text color
  rounded-md                // Border radius
  hover:bg-blue-700         // Hover state
  transition-colors         // Smooth transition
">
  Button
</div>
```

### Responsive Design

```
Mobile First Approach:
<div className="
  w-full                    // Default: 100% width
  md:w-1/2                  // Tablet: 50% width
  lg:w-1/3                  // Desktop: 33% width
  
  px-4                      // Default: 16px padding
  sm:px-6                   // Small: 24px padding
  lg:px-8                   // Large: 32px padding
">
```

---

## 🚀 Build & Deploy

### Development
```
npm run dev
  ↓
Vite Dev Server (Port 3000)
  ↓
Hot Module Replacement (HMR)
  ↓
Instant Updates in Browser
```

### Production Build
```
npm run build
  ↓
TypeScript Compilation (tsc)
  ↓
Vite Build Process
  ├── Bundle JavaScript
  ├── Optimize Assets
  ├── Minify Code
  └── Generate dist/ folder
```

### Deployment
```
dist/ folder
  ↓
Static Hosting (Vercel/Netlify/S3)
  ↓
CDN Distribution
  ↓
Global Availability
```

---

## 📊 Performance Considerations

### Frontend Optimization
✅ Code splitting (automatic with Vite)
✅ Tree shaking (removes unused code)
✅ Minification (production build)
✅ Asset optimization (images, CSS, JS)
✅ Lazy loading (components loaded on demand)
✅ Memoization (React.memo for heavy components)

### Backend Optimization
✅ Edge functions (low latency globally)
✅ KV store (fast key-value lookups)
✅ Connection pooling (Supabase handles this)
✅ Caching (can add Redis if needed)

### Network Optimization
✅ HTTPS (built-in with hosting)
✅ CDN (Vercel/Netlify provide this)
✅ Gzip/Brotli compression
✅ HTTP/2 (modern browsers)

---

## 🔍 Monitoring & Debugging

### Frontend Debugging
```
Browser Console:
  → API call logs
  → Error messages
  → State changes

React DevTools:
  → Component hierarchy
  → Props inspection
  → State inspection
```

### Backend Debugging
```
Supabase Dashboard:
  → Edge function logs
  → Database queries
  → Auth logs

Server Console:
  → Request logs (Hono logger)
  → Error logs (console.error)
  → Custom logs (console.log)
```

---

## ✅ Architecture Benefits

### Simplicity
✅ Single-page application (no complex routing)
✅ State-based navigation (easy to understand)
✅ Direct API calls (no abstraction layers)

### Performance
✅ Fast initial load (Vite optimization)
✅ Instant navigation (no page reloads)
✅ Edge functions (low latency)

### Scalability
✅ Stateless backend (horizontal scaling)
✅ CDN distribution (global reach)
✅ KV store (flexible data model)

### Maintainability
✅ Clean separation of concerns
✅ TypeScript type safety
✅ Minimal dependencies (11 packages)
✅ No complex build configuration

---

**This is a modern, lean, and performant React architecture! 🚀**

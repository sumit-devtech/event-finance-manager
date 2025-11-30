# Event Budget Planner - Simplifi

A comprehensive event budget planning application built with **pure React** (no third-party UI libraries), featuring demo mode, user registration, subscription-based access, and full responsive design.

![Simplifi Logo](https://raw.githubusercontent.com/yourusername/event-budget-planner/main/public/logo.png)

## 🎯 Features

### Core Features
- **Demo Mode** - Try the app without registration
- **User Registration** - One free event creation for new users
- **Subscription Plans** - Free, Professional, and Enterprise tiers
- **Organization Management** - Register organizations first, then create users
- **Event Management** - Create, edit, and delete events
- **Budget Tracking** - Version control for budget changes
- **Expense Approval** - Multi-level approval workflows
- **Vendor Management** - Track and manage event vendors
- **Analytics Dashboard** - ROI metrics and insights
- **Activity Logging** - Track all user actions
- **File Uploads** - Attach documents to events and expenses
- **Notifications** - Real-time notifications for approvals
- **Role-Based Access Control** - Admin, Manager, and Member roles
- **Mobile Responsive** - Works on all devices

## 🏗️ Tech Stack

### Frontend (Pure React - No Third-Party UI Libraries!)
- ✅ **React 18** - Core framework
- ✅ **TypeScript** - Type safety
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ **Vite** - Build tool
- ✅ **Lucide React** - Icons only
- ✅ **Recharts** - Charts only
- ✅ **Motion** - Animations only

### Backend
- ✅ **Supabase** - Authentication, database, and storage
- ✅ **Deno Edge Functions** - Server-side logic
- ✅ **Hono** - Web framework for edge functions
- ✅ **Key-Value Store** - Simple database interface

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your Supabase credentials to .env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Development

```bash
# Start frontend development server
npm run dev

# The app will be available at http://localhost:3000
```

## 🏭 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Database Schema

The application uses a flexible key-value store with 21 entities:

### Core Entities
1. **Organizations** - Company/org information
2. **Users** - User profiles with roles
3. **Events** - Event details and metadata
4. **Budgets** - Event budgets with versioning
5. **Budget Lines** - Individual line items
6. **Expenses** - Actual expenses with receipts
7. **Vendors** - Vendor management

### Advanced Features
8. **Approvals** - Multi-level approval workflows
9. **Notifications** - Real-time notifications
10. **Activity Logs** - Audit trail
11. **File Uploads** - Document management
12. **Stakeholders** - Event stakeholder tracking
13. **Team Assignments** - User-to-event assignments
14. **Analytics** - ROI and performance metrics
15. **Settings** - User and org settings

## 🎨 Components Architecture

### Main Components (33 Total)
- `App.tsx` - Main application entry point
- `MainApp.tsx` - Authenticated app container
- `LandingPage.tsx` - Marketing landing page
- `AuthPage.tsx` - Login/registration
- `DashboardConnected.tsx` - Main dashboard
- `EventsListConnected.tsx` - Event management
- `BudgetManager.tsx` - Budget tracking
- `ExpenseTracker.tsx` - Expense management
- `VendorManager.tsx` - Vendor management
- `Analytics.tsx` - Analytics dashboard
- `ROIDashboard.tsx` - ROI metrics
- `ActivityLog.tsx` - Activity tracking
- `NotificationCenter.tsx` - Notifications
- `FileUploadManager.tsx` - File uploads
- `ApprovalWorkflowHistory.tsx` - Approval flows
- `RoleBasedAccess.tsx` - RBAC implementation
- And 17 more specialized components...

## 🔐 Authentication Flow

1. **Landing Page** → Try Demo or Sign In
2. **Registration** → Create account (free tier)
3. **Organization Setup** → Create organization
4. **Subscription** → Choose plan (optional)
5. **Main App** → Access full features

## 💳 Subscription Tiers

### Free Tier
- 1 event creation
- Basic budget tracking
- Limited features

### Professional Tier ($29/month)
- Unlimited events
- Advanced analytics
- ROI tracking
- Multi-user support

### Enterprise Tier ($99/month)
- Everything in Professional
- Custom integrations
- Priority support
- Advanced RBAC

## 📱 Responsive Design

The application is fully responsive across all devices:
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ Large screens (1440px+)

## 🔧 Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📖 API Documentation

### Events API
```typescript
// List all events
GET /make-server-3dd0a4ac/events?organizationId={id}

// Create event
POST /make-server-3dd0a4ac/events
Body: { name, date, location, organizationId, ... }

// Update event
PUT /make-server-3dd0a4ac/events/{id}

// Delete event
DELETE /make-server-3dd0a4ac/events/{id}
```

### Expenses API
```typescript
// List expenses
GET /make-server-3dd0a4ac/events/{eventId}/expenses

// Create expense
POST /make-server-3dd0a4ac/expenses

// Approve expense
PUT /make-server-3dd0a4ac/expenses/{id}/approve

// Reject expense
PUT /make-server-3dd0a4ac/expenses/{id}/reject
```

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Build test
npm run build
```

## 📝 Project Structure

```
/
├── src/
│   └── main.tsx              # Entry point
├── components/
│   ├── MainApp.tsx           # Main app container
│   ├── Dashboard*.tsx        # Dashboard components
│   ├── Events*.tsx           # Event components
│   ├── Budget*.tsx           # Budget components
│   ├── Expense*.tsx          # Expense components
│   ├── Vendor*.tsx           # Vendor components
│   ├── Analytics*.tsx        # Analytics components
│   └── ...                   # 33 total components
├── utils/
│   ├── api.ts               # API client
│   ├── demoData.ts          # Demo data
│   └── supabase/
│       ├── client.ts        # Supabase client
│       └── info.tsx         # Supabase config
├── supabase/functions/server/
│   ├── index.tsx            # Server routes
│   └── kv_store.tsx         # KV store (protected)
├── styles/
│   └── globals.css          # Global styles
├── App.tsx                  # Root component
├── index.html               # HTML template
└── package.json             # Dependencies
```

## 🚨 Important Notes

### Third-Party Libraries
This application uses **minimal third-party libraries**:
- ✅ React, TypeScript, Vite (framework/build tools)
- ✅ Tailwind CSS (utility CSS - not a React library)
- ✅ Lucide React (icons only)
- ✅ Recharts (charts only)
- ✅ Motion (animations only)
- ✅ Supabase JS SDK (backend client)

**NO third-party UI component libraries** (no Radix, Shadcn, Material-UI, etc.)

### Backend Limitations
- Only one KV table (`kv_store_3dd0a4ac`)
- Cannot create new tables or migrations
- Use KV store for all data storage
- Flexible key-value structure supports all entities

## 🤝 Contributing

This is a prototype application. For production use:
1. Implement proper database schema (Prisma + PostgreSQL)
2. Add comprehensive testing (Jest, React Testing Library)
3. Implement CI/CD pipelines
4. Add monitoring and error tracking (Sentry)
5. Implement proper caching strategies
6. Add rate limiting and security headers

## 📄 License

MIT License - feel free to use for personal and commercial projects.

## 🆘 Support

For issues or questions:
1. Check the documentation guides in root directory
2. Review the schema comparison (`SCHEMA_COMPARISON.md`)
3. Check the mobile responsive guide (`MOBILE_RESPONSIVE_GUIDE.md`)
4. Review the advanced features guide (`ADVANCED_FEATURES_GUIDE.md`)

---

**Built with ❤️ using pure React and modern web technologies**

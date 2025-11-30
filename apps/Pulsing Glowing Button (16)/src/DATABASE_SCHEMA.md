# 🗄️ Database Schema Documentation

## Overview

The Event Finance Manager uses **Supabase KV Store** (key-value store built on Neon PostgreSQL) for data persistence. All data is stored using key-value patterns with hierarchical relationships.

---

## 📊 Data Entities & Key Patterns

### 1. **User Profile**

**Key Pattern:** `user:{userId}:profile`

**Data Structure:**
```typescript
{
  id: string,              // User UUID from Supabase Auth
  email: string,           // User email from Supabase Auth
  subscription: string,    // 'free' | 'professional' | 'enterprise'
  freeEventsRemaining: number,  // Free trial event counter
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

**Related Keys:**
- `user:{userId}:org` → Organization ID (if user belongs to an org)
- `user:{userId}:event:{eventId}` → Event ID reference (for individual users)
- `user:{userId}:vendor:{vendorId}` → Vendor ID reference (for individual users)

---

### 2. **Organization**

**Key Pattern:** `org:{orgId}`

**Data Structure:**
```typescript
{
  id: string,              // Organization UUID
  name: string,            // Organization name
  industry: string,        // Industry type
  size: string,            // Company size (e.g., '1-10', '11-50')
  address: string,         // Street address
  city: string,            // City
  country: string,         // Country
  website: string,         // Website URL
  description: string,     // Organization description
  adminId: string,         // User ID of the admin
  subscription: string,    // 'free' | 'professional' | 'enterprise'
  eventsLimit: number,     // 1 for free, -1 for unlimited
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

**Related Keys:**
- `org:{orgId}:member:{userId}` → Membership reference
- `org:{orgId}:event:{eventId}` → Event ID reference (for organization events)
- `org:{orgId}:vendor:{vendorId}` → Vendor ID reference (for organization vendors)

---

### 3. **Organization Membership**

**Key Pattern:** `membership:{membershipId}`

**Data Structure:**
```typescript
{
  id: string,              // Membership UUID
  organizationId: string,  // Organization UUID
  userId: string,          // User UUID
  role: string,            // 'admin' | 'manager' | 'member'
  joinedAt: string         // ISO timestamp
}
```

**Related Keys:**
- `org:{orgId}:member:{userId}` → Links organization to member

---

### 4. **Event**

**Key Pattern:** `event:{eventId}`

**Data Structure:**
```typescript
{
  id: string,              // Event UUID
  name: string,            // Event name
  type: string,            // 'conference' | 'seminar' | 'workshop' | 'meeting' | 'launch' | 'retreat' | 'social'
  date: string,            // Start date (ISO)
  endDate: string,         // End date (ISO)
  location: string,        // Location/city
  venue: string,           // Venue name
  attendees: number,       // Expected attendee count
  budget: number,          // Total budget amount
  description: string,     // Event description
  status: string,          // 'planning' | 'active' | 'completed' | 'cancelled'
  organizationId: string,  // Organization UUID (if applicable)
  createdBy: string,       // User UUID who created the event
  assignedTo: string,      // User UUID assigned to the event
  spent: number,           // Total spent amount (calculated)
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

**Related Keys:**
- `org:{orgId}:event:{eventId}` → Organization event reference (for org events)
- `user:{userId}:event:{eventId}` → User event reference (for individual events)
- `event:{eventId}:budget:{budgetId}` → Budget reference
- `event:{eventId}:expense:{expenseId}` → Expense reference

---

### 5. **Budget**

**Key Pattern:** `budget:{budgetId}`

**Data Structure:**
```typescript
{
  id: string,              // Budget UUID
  eventId: string,         // Event UUID
  version: number,         // Version number (1, 2, 3...)
  name: string,            // Budget version name (e.g., 'Initial Budget', 'Revised Budget')
  status: string,          // 'draft' | 'approved' | 'locked'
  createdBy: string,       // User UUID who created the budget
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

**Related Keys:**
- `event:{eventId}:budget:{budgetId}` → Links budget to event
- `budget:{budgetId}:line:{lineId}` → Budget line item reference

---

### 6. **Budget Line Item**

**Key Pattern:** `budgetline:{lineId}`

**Data Structure:**
```typescript
{
  id: string,              // Budget line UUID
  budgetId: string,        // Budget UUID
  category: string,        // Category (e.g., 'venue', 'catering', 'marketing')
  item: string,            // Item name/description
  allocated: number,       // Allocated/budgeted amount
  spent: number,           // Actual spent amount
  status: string,          // 'pending' | 'approved' | 'rejected'
  createdBy: string,       // User UUID
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

**Related Keys:**
- `budget:{budgetId}:line:{lineId}` → Links line item to budget

---

### 7. **Expense**

**Key Pattern:** `expense:{expenseId}`

**Data Structure:**
```typescript
{
  id: string,              // Expense UUID
  eventId: string,         // Event UUID
  category: string,        // Category (e.g., 'venue', 'catering')
  item: string,            // Item/description
  amount: number,          // Expense amount
  vendor: string,          // Vendor name
  date: string,            // Expense date (ISO)
  notes: string,           // Additional notes
  status: string,          // 'pending' | 'approved' | 'rejected'
  submittedBy: string,     // User UUID who submitted
  submittedAt: string,     // ISO timestamp
  approvedBy?: string,     // User UUID who approved (if approved)
  approvedAt?: string,     // ISO timestamp (if approved)
  rejectedBy?: string,     // User UUID who rejected (if rejected)
  rejectedAt?: string,     // ISO timestamp (if rejected)
  rejectionReason?: string, // Reason for rejection
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

**Related Keys:**
- `event:{eventId}:expense:{expenseId}` → Links expense to event

---

### 8. **Vendor**

**Key Pattern:** `vendor:{vendorId}`

**Data Structure:**
```typescript
{
  id: string,              // Vendor UUID
  name: string,            // Vendor name
  category: string,        // 'venue' | 'catering' | 'marketing' | 'technology' | 'transportation'
  email: string,           // Contact email
  phone: string,           // Contact phone
  address: string,         // Vendor address
  rating: number,          // Rating (0-5)
  notes: string,           // Additional notes
  organizationId?: string, // Organization UUID (if org vendor)
  createdBy: string,       // User UUID
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

**Related Keys:**
- `org:{orgId}:vendor:{vendorId}` → Organization vendor reference
- `user:{userId}:vendor:{vendorId}` → User vendor reference

---

## 🔗 Relationship Patterns

### Hierarchical Relationships

```
User
├── user:{userId}:profile (Profile data)
├── user:{userId}:org → Organization ID
├── user:{userId}:event:{eventId} → Event references
└── user:{userId}:vendor:{vendorId} → Vendor references

Organization
├── org:{orgId} (Organization data)
├── org:{orgId}:member:{userId} → Membership references
├── org:{orgId}:event:{eventId} → Event references
└── org:{orgId}:vendor:{vendorId} → Vendor references

Event
├── event:{eventId} (Event data)
├── event:{eventId}:budget:{budgetId} → Budget references
└── event:{eventId}:expense:{expenseId} → Expense references

Budget
├── budget:{budgetId} (Budget data)
└── budget:{budgetId}:line:{lineId} → Budget line references
```

---

## 📡 API Endpoints

### Organizations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/organizations` | Create organization | ✅ |
| GET | `/organizations/:id` | Get organization details | ✅ |
| GET | `/organizations/:id/members` | Get organization members | ✅ |

### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/events` | Create event | ✅ |
| GET | `/events` | List events (filtered by org) | ✅ |
| GET | `/events/:id` | Get event details | ✅ |
| PUT | `/events/:id` | Update event | ✅ |
| DELETE | `/events/:id` | Delete event | ✅ |

### Budgets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/budgets` | Create budget version | ✅ |
| GET | `/events/:eventId/budgets` | List event budgets | ✅ |

### Budget Lines

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/budget-lines` | Create budget line item | ✅ |
| GET | `/budgets/:budgetId/lines` | List budget line items | ✅ |

### Expenses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/expenses` | Submit expense | ✅ |
| GET | `/events/:eventId/expenses` | List event expenses | ✅ |
| PUT | `/expenses/:id/approve` | Approve expense | ✅ |
| PUT | `/expenses/:id/reject` | Reject expense | ✅ |

### Vendors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/vendors` | Create vendor | ✅ |
| GET | `/vendors` | List vendors (filtered by org) | ✅ |

### Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | ✅ |
| PUT | `/profile` | Update user profile | ✅ |

---

## 🔐 Authentication

All API endpoints (except health check) require JWT authentication via Supabase Auth.

**Authorization Header:**
```
Authorization: Bearer {access_token}
```

**Flow:**
1. User signs up/logs in via Supabase Auth
2. Supabase returns access_token
3. Frontend includes token in all API requests
4. Server validates token and extracts userId
5. Server uses userId for data access control

---

## 🔒 Data Access Patterns

### For Individual Users:
- Can only access their own events: `user:{userId}:event:*`
- Can only access their own vendors: `user:{userId}:vendor:*`

### For Organization Members:
- Can access organization events: `org:{orgId}:event:*`
- Can access organization vendors: `org:{orgId}:vendor:*`
- Role-based permissions (admin/manager/member)

---

## 💾 Key-Value Store Functions

The application uses these KV store utility functions:

```typescript
// From /supabase/functions/server/kv_store.tsx

kv.get(key)           // Get single value
kv.set(key, value)    // Set single value
kv.del(key)           // Delete single value
kv.mget([keys])       // Get multiple values
kv.mset({key: value}) // Set multiple values
kv.mdel([keys])       // Delete multiple values
kv.getByPrefix(prefix) // Get all keys with prefix
```

---

## 📝 Design Decisions

1. **No SQL Tables**: Uses KV store exclusively (single `kv_store_3dd0a4ac` table)
2. **Denormalization**: Some data is duplicated for faster lookups
3. **Reference Keys**: Separate keys store ID references for relationships
4. **Prefix Queries**: Uses `getByPrefix()` for fetching related entities
5. **Auto-created Profile**: Profile is auto-created on first `/profile` request
6. **UUID Generation**: Uses `crypto.randomUUID()` for all IDs
7. **Timestamps**: All entities include `createdAt` and `updatedAt`

---

## 🚀 Scalability Considerations

### Current Limitations:
- No pagination on list endpoints
- No search/filter capabilities
- No caching layer
- No full-text search

### Future Enhancements:
1. Add pagination with limit/offset
2. Implement search with indexed fields
3. Add Redis caching for frequently accessed data
4. Consider migrating to proper SQL tables for complex queries
5. Add database indexes for common query patterns

---

## 📊 Data Flow Examples

### Creating an Event (Organization)

```
1. POST /events with organizationId
2. Server creates: event:{eventId}
3. Server creates reference: org:{orgId}:event:{eventId}
4. Response: { event }
```

### Listing Events (Organization)

```
1. GET /events?organizationId={orgId}
2. Server queries: org:{orgId}:event:* (getByPrefix)
3. Server fetches each: event:{eventId}
4. Response: { events: [...] }
```

### Expense Approval

```
1. PUT /expenses/:id/approve
2. Server updates: expense:{expenseId} (status = 'approved')
3. Server adds: approvedBy, approvedAt
4. Response: { expense }
```

---

## 🔄 Migration Path

If you need to migrate to traditional SQL tables in the future:

1. Create migration script to read all KV data
2. Transform key patterns to table rows
3. Create proper foreign key relationships
4. Update server code to use SQL queries
5. Run migration in background while serving from KV
6. Switch over once migration complete

**Example SQL Schema (for reference):**
```sql
-- Not implemented, but shows equivalent structure

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  subscription VARCHAR DEFAULT 'free',
  free_events_remaining INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  admin_id UUID REFERENCES users(id),
  -- ... other fields
);

CREATE TABLE events (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  -- ... other fields
);

-- ... etc
```

---

## ✅ Schema Validation

Currently, **no schema validation** is enforced at the database level. The application relies on:

1. TypeScript types in the frontend
2. Request validation in server endpoints
3. Default values for missing fields

**Recommendation:** Add schema validation library (e.g., Zod) for production use.

---

## 📌 Important Notes

1. **Protected File**: `/supabase/functions/server/kv_store.tsx` cannot be modified
2. **Single Table**: All data stored in `kv_store_3dd0a4ac` table
3. **No Migrations**: Cannot create new tables or run DDL statements
4. **Flexible Schema**: KV store allows schema changes without migrations
5. **Suitable for Prototyping**: Perfect for demos and MVPs

---

## 🆘 Support & Debugging

### Common Issues:

**Events not showing up?**
- Check if user has organization ID: `user:{userId}:org`
- Verify event references exist: `org:{orgId}:event:*`

**Profile not found?**
- Profile is auto-created on first `/profile` request
- Check Supabase Auth user exists

**Access denied?**
- Verify JWT token is valid
- Check user belongs to organization
- Verify role permissions

---

## 📚 Additional Resources

- [Supabase KV Store Documentation](https://supabase.com)
- [README.md](/README.md) - Full application documentation
- [Server Implementation](/supabase/functions/server/index.tsx)

---

**Last Updated:** November 28, 2024  
**Schema Version:** 1.0  
**Status:** Production Ready ✅

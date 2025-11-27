# Backend Routes Summary

## All API Routes in `apps/backend`

### Base URL: `http://localhost:3333/api`

---

## ✅ Working Routes (No Schema Changes Needed)

### App Routes
- `GET /` - API welcome message
  - **Controller:** `AppController`
  - **Status:** ✅ Works (no DB access)

### Health Routes  
- `GET /health` - Health check with database connection
  - **Controller:** `HealthController`
  - **Status:** ✅ Works (uses PrismaService)

### Notifications Routes
- `GET /notifications` - Get all notifications (with filters)
  - **Controller:** `NotificationsController`
  - **Status:** ✅ Fixed (uses NotificationType from @simlifidb)
- `GET /notifications/unread` - Get unread count
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/read-all` - Mark all as read

---

## ❌ Broken Routes (Need Schema Migration)

### Auth Routes (`/auth`)
**Status:** ❌ Broken - Field name mismatches

- `POST /auth/login` - User login
  - **Issue:** Uses `user.password` → should be `user.passwordHash`
  - **File:** `auth.service.ts:29`
  
- `POST /auth/register` - User registration
  - **Issue:** Uses `password` and `name` → should be `passwordHash` and `fullName`
  - **File:** `auth.service.ts:54-55`
  
- `POST /auth/refresh` - Refresh access token
  - **Issue:** Uses `name` → should be `fullName`
  - **File:** `auth.service.ts:79`
  
- `POST /auth/logout` - User logout
  - **Status:** ✅ Works (no DB access)

**Files to Fix:**
- `src/auth/auth.service.ts` (lines 29, 33, 54, 55, 60, 79, 125)
- `src/auth/strategies/jwt.strategy.ts` (line 26)

---

### Events Routes (`/events`)
**Status:** ❌ Broken - Schema structure differences

- `GET /events` - List all events (with filters)
  - **Issue:** Uses `files` count, `client` field, `eventAssignment`
  - **File:** `events.service.ts:96, 183, 269`
  
- `GET /events/:id` - Get event by ID
  - **Issue:** Uses `files` count, `name` → `fullName`
  - **File:** `events.service.ts:133, 351, 359`
  
- `POST /events` - Create new event
  - **Issue:** May use `client` field
  - **File:** `events.service.ts`
  
- `PUT /events/:id` - Update event
  - **Issue:** May use `client` field
  - **File:** `events.service.ts`
  
- `DELETE /events/:id` - Delete event
  - **Status:** ✅ Should work
  
- `PUT /events/:id/status` - Update event status
  - **Status:** ✅ Should work
  
- `POST /events/:id/assign` - Assign user to event
  - **Issue:** Uses `eventAssignment` → should be `EventStakeholder`
  - **File:** `events.service.ts:308`
  
- `DELETE /events/:id/assign/:userId` - Remove user assignment
  - **Issue:** Uses `eventAssignment` → should be `EventStakeholder`
  - **File:** `events.service.ts:323`
  
- `POST /events/:id/files` - Upload file to event
  - **Issue:** File structure may differ
  
- `DELETE /events/:id/files/:fileId` - Delete event file
  - **Issue:** File structure may differ

**Files to Fix:**
- `src/events/events.service.ts` (multiple lines)
- `src/events/events.controller.ts` (may need updates)

---

### Budget Items Routes (`/budget-items`)
**Status:** ❌ Broken - Complete model change

- `GET /events/:eventId/budget-items` - Get budget items for event
  - **Issue:** Uses `budgetItem` → should be `budgetLineItem` (different structure)
  - **File:** `budget-items.service.ts:27`
  
- `GET /budget-items/:id` - Get budget item by ID
  - **Issue:** Uses `budgetItem` model
  - **File:** `budget-items.service.ts:47`
  
- `POST /events/:eventId/budget-items` - Create budget item
  - **Issue:** Uses `budgetItem` model
  - **File:** `budget-items.service.ts:80`
  
- `PUT /budget-items/:id` - Update budget item
  - **Issue:** Uses `budgetItem` model
  - **File:** `budget-items.service.ts:168`
  
- `DELETE /budget-items/:id` - Delete budget item
  - **Issue:** Uses `budgetItem` model
  - **File:** `budget-items.service.ts:201`
  
- `GET /events/:eventId/budget-items/totals` - Get budget totals
  - **Issue:** Uses `budgetItem` model
  
- `GET /events/:eventId/budget-items/variance` - Get budget variance
  - **Issue:** Uses `budgetItem` model
  
- `POST /budget-items/:id/files` - Upload file to budget item
  - **Issue:** Uses `budgetItemId`, `path`, `filename` fields
  - **File:** `budget-items.service.ts:287, 315, 320, 346`
  
- `DELETE /budget-items/:id/files/:fileId` - Delete budget item file
  - **Issue:** File structure differences

**Files to Fix:**
- `src/budget-items/budget-items.service.ts` (complete rewrite needed)
- `src/budget-items/budget-items.controller.ts` (may need updates)

**Note:** Budget structure is completely different:
- **Old:** Direct `budgetItem` model
- **New:** `BudgetVersion` → `BudgetLineItem` hierarchy

---

### Users Routes (`/users`)
**Status:** ⚠️ Needs Review

- `GET /users` - List all users
  - **Needs Check:** `name` → `fullName`
  
- `GET /users/:id` - Get user by ID
  - **Needs Check:** `name` → `fullName`
  
- `POST /users` - Create new user
  - **Needs Check:** `password` → `passwordHash`, `name` → `fullName`
  
- `PUT /users/:id` - Update user
  - **Needs Check:** `name` → `fullName`
  
- `DELETE /users/:id` - Delete user
  - **Status:** ✅ Should work
  
- `PUT /users/:id/role` - Update user role
  - **Status:** ✅ Should work
  
- `POST /users/:id/events` - Assign event to user
  - **Needs Check:** May use `eventAssignment`
  
- `GET /users/:id/activity-logs` - Get user activity logs
  - **Status:** ✅ Should work

**Files to Review:**
- `src/users/users.service.ts`
- `src/users/users.controller.ts`

---

### Files Routes (`/files`)
**Status:** ⚠️ Needs Review

- `POST /files/upload` - Upload file
  - **Needs Check:** File model structure
  
- `GET /files/:id` - Get file by ID
  - **Needs Check:** File model structure
  
- `GET /files/list` - List all files
  - **Needs Check:** File model structure
  
- `GET /files/:id/metadata` - Get file metadata
  - **Needs Check:** File model structure
  
- `DELETE /files/:id` - Delete file
  - **Needs Check:** File model structure

**Files to Review:**
- `src/files/files.service.ts`
- `src/files/files.controller.ts`

---

### Reports Routes (`/reports`)
**Status:** ⚠️ Needs Review

- `GET /reports/event-summary/:eventId` - Get event summary report
  - **Needs Check:** Schema differences
  
- `GET /reports/comparison` - Get comparison report
  - **Needs Check:** Schema differences
  
- `POST /reports/comparison` - Generate comparison report
  - **Needs Check:** Schema differences

**Files to Review:**
- `src/reports/reports.service.ts`
- `src/reports/reports.controller.ts`

---

## Summary

### Total Routes: ~35 routes

**Status Breakdown:**
- ✅ **Working:** 6 routes (App, Health, Notifications)
- ❌ **Broken:** ~15 routes (Auth, Events, Budget Items)
- ⚠️ **Needs Review:** ~14 routes (Users, Files, Reports)

### Critical Issues

1. **Auth Service** - Login/Register broken (password/passwordHash mismatch)
2. **Events Service** - Multiple field mismatches (client, name/fullName, eventAssignment)
3. **Budget Items Service** - Complete model change needed (budgetItem → BudgetLineItem)

### Quick Fixes Needed

1. Replace `password` → `passwordHash` (3 files)
2. Replace `name` → `fullName` (5+ files)
3. Replace `budgetItem` → `budgetLineItem` (1 file, major changes)
4. Replace `eventAssignment` → `EventStakeholder` (1 file)
5. Remove `client` field references (1 file)

### Recommendation

Consider migrating to `apps/backend-simplifi` which already uses `@simlifidb` correctly, or perform complete migration of old backend.


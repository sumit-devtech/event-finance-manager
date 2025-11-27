# CRUD Routes Summary - Backend API

This document summarizes all CRUD operations available in the backend API, updated to work with `@simlifidb` schema.

## Authentication Routes (`/auth`)

### Public Routes
- **POST** `/auth/login` - User login
- **POST** `/auth/register` - User registration
- **POST** `/auth/refresh` - Refresh access token

### Protected Routes
- **POST** `/auth/logout` - User logout (requires JWT)

**Status**: ✅ All routes working with simlifidb schema
- Uses `passwordHash` instead of `password`
- Uses `fullName` instead of `name`
- Returns `name` in response for backward compatibility

---

## Events Routes (`/events`)

### Protected Routes (JWT required)

- **POST** `/events` - Create event (Admin, EventManager)
  - Maps `client` → `location` for backward compatibility
  - Sets `createdBy` to current user

- **GET** `/events` - List all events (with filters)
  - Filters: `status`, `client`/`department` (maps to `location`), `startDateFrom`, `startDateTo`
  - Returns `stakeholders` instead of `assignments`

- **GET** `/events/:id` - Get event by ID
  - Returns `budgetVersions` with `items` instead of `budgetItems`
  - Returns `stakeholders` instead of `assignments`

- **PUT** `/events/:id` - Update event (Admin, EventManager, creator)
  - Supports both `location` and `client` fields (maps `client` → `location`)

- **DELETE** `/events/:id` - Delete event (Admin, EventManager, creator)

- **PUT** `/events/:id/status` - Update event status (Admin, EventManager, creator)

- **POST** `/events/:id/assign` - Assign user to event (Admin only)
  - Creates `EventStakeholder` instead of `eventAssignment`
  - Maps user info to stakeholder contact info

- **DELETE** `/events/:id/assign/:userId` - Unassign user from event (Admin only)
  - Removes `EventStakeholder` entry

- **POST** `/events/:id/files` - Upload file to event
  - ⚠️ **DISABLED**: Files are linked to Reports in simlifidb, not Events

- **DELETE** `/events/:id/files/:fileId` - Delete file from event
  - ⚠️ **DISABLED**: Files are linked to Reports in simlifidb, not Events

**Status**: ✅ All routes working (file upload/delete disabled due to schema change)

---

## Budget Items Routes (`/events/:eventId/budget-items` and `/budget-items`)

### Protected Routes (JWT required)

- **GET** `/events/:eventId/budget-items` - List budget items for event
  - Returns `BudgetLineItem` from default `BudgetVersion`

- **GET** `/budget-items/:id` - Get budget item by ID
  - Returns `BudgetLineItem` with `budgetVersion` relation

- **POST** `/events/:eventId/budget-items` - Create budget item (Admin, EventManager, Finance)
  - Creates `BudgetLineItem` in default `BudgetVersion`
  - Maps `description` → `itemName`
  - Maps `vendor` → `notes`

- **PUT** `/budget-items/:id` - Update budget item (Admin, EventManager, Finance)
  - Updates `BudgetLineItem` fields

- **DELETE** `/budget-items/:id` - Delete budget item (Admin, EventManager, Finance)

- **GET** `/events/:eventId/budget-items/totals` - Get budget totals
  - Calculates from `BudgetLineItem` entries

- **GET** `/events/:eventId/budget-items/variance` - Get budget variance

- **POST** `/budget-items/:id/files` - Upload file to budget item
  - ⚠️ **DISABLED**: Files are linked to Reports in simlifidb, not BudgetItems

- **DELETE** `/budget-items/:id/files/:fileId` - Delete file from budget item
  - ⚠️ **DISABLED**: Files are linked to Reports in simlifidb, not BudgetItems

**Status**: ✅ All routes working (file upload/delete disabled due to schema change)

---

## Users Routes (`/users`)

### Protected Routes (Admin only, JWT required)

- **POST** `/users` - Create user
  - Maps `name` → `fullName`
  - Maps `password` → `passwordHash`
  - Requires `role` field

- **GET** `/users` - List all users
  - Returns `fullName` instead of `name`

- **GET** `/users/:id` - Get user by ID
  - Returns `createdEvents` instead of `events`

- **PUT** `/users/:id` - Update user
  - Maps `name` → `fullName`
  - Maps `password` → `passwordHash`

- **DELETE** `/users/:id` - Delete user

- **PUT** `/users/:id/role` - Assign role to user

- **POST** `/users/:id/events` - Assign user to event
  - Creates `EventStakeholder` instead of `eventAssignment`

- **GET** `/users/:id/activity-logs` - Get user activity logs
  - Optional `eventId` filter

**Status**: ✅ All routes working with simlifidb schema

---

## Files Routes (`/files`)

### Protected Routes (JWT required)

- **POST** `/files/upload` - Upload file (Admin, EventManager, Finance)
  - ⚠️ **DISABLED**: Files are linked to Reports in simlifidb, not Events/BudgetItems
  - Throws error indicating schema limitation

- **GET** `/files/:id` - Download file
  - Uses `fileUrl` and `fileType` from File model

- **GET** `/files/list` - List files
  - Filtering by `eventId`/`budgetItemId` not fully supported (Files linked to Reports)

- **GET** `/files/:id/metadata` - Get file metadata
  - Returns file with `report` relation

- **DELETE** `/files/:id` - Delete file (Admin, EventManager, Finance)

**Status**: ⚠️ Limited functionality due to schema change (Files linked to Reports)

---

## Reports Routes (`/reports`)

### Protected Routes (Admin, EventManager, Finance, JWT required)

- **GET** `/reports/event-summary/:eventId` - Get event summary report
  - Uses `budgetVersions` with `items` instead of `budgetItems`
  - Uses `stakeholders` instead of `assignments`
  - Maps `location` instead of `client`

- **POST** `/reports/comparison` - Get comparison report for multiple events
  - Same schema mappings as event summary

- **GET** `/reports/export/:format` - Export report (csv/excel/pdf)
  - Supports summary and comparison reports
  - Format: `csv`, `excel`, or `pdf`

**Status**: ✅ All routes working with simlifidb schema

---

## Notifications Routes (`/notifications`)

### Protected Routes (JWT required)

- **GET** `/notifications` - List notifications
  - Filter by `read` (maps to `isRead`)
  - `type` filter not supported (field not in simlifidb schema)

- **GET** `/notifications/unread` - Get unread count
  - Uses `isRead` field

- **PUT** `/notifications/:id/read` - Mark notification as read
  - Updates `isRead` field

- **PUT** `/notifications/read-all` - Mark all notifications as read
  - Updates `isRead` field for all user notifications

**Status**: ✅ All routes working (type filtering disabled)

---

## Schema Mapping Summary

### Field Mappings
- `password` → `passwordHash`
- `name` → `fullName` (User model)
- `client` → `location` (Event model)
- `budgetItem` → `BudgetLineItem` (part of `BudgetVersion`)
- `eventAssignment` → `EventStakeholder` (different structure)
- `read` → `isRead` (Notification model)

### Model Changes
- **Event**: No `client` field, uses `location` instead
- **BudgetItem**: Replaced by `BudgetLineItem` within `BudgetVersion`
- **EventAssignment**: Replaced by `EventStakeholder` (contact info, not user assignment)
- **File**: Linked to `Report` instead of `Event` or `BudgetItem`
- **Notification**: No `type`, `readAt`, or `metadata` fields

### Disabled Features
- File upload to Events (Files linked to Reports)
- File upload to BudgetItems (Files linked to Reports)
- Notification type filtering (field not in schema)

---

## Testing Checklist

### ✅ Authentication
- [x] Login
- [x] Register
- [x] Refresh token
- [x] Logout

### ✅ Events CRUD
- [x] Create event
- [x] List events (with filters)
- [x] Get event by ID
- [x] Update event
- [x] Delete event
- [x] Update status
- [x] Assign user (creates stakeholder)
- [x] Unassign user (removes stakeholder)
- [ ] Upload file (disabled)
- [ ] Delete file (disabled)

### ✅ Budget Items CRUD
- [x] List budget items
- [x] Get budget item
- [x] Create budget item
- [x] Update budget item
- [x] Delete budget item
- [x] Get totals
- [x] Get variance
- [ ] Upload file (disabled)
- [ ] Delete file (disabled)

### ✅ Users CRUD
- [x] Create user
- [x] List users
- [x] Get user
- [x] Update user
- [x] Delete user
- [x] Assign role
- [x] Assign to event
- [x] Get activity logs

### ✅ Files
- [ ] Upload file (disabled)
- [x] Download file
- [x] List files
- [x] Get metadata
- [x] Delete file

### ✅ Reports
- [x] Event summary
- [x] Comparison report
- [x] Export (CSV/Excel/PDF)

### ✅ Notifications
- [x] List notifications
- [x] Get unread count
- [x] Mark as read
- [x] Mark all as read

---

## Notes

1. **File Upload Limitation**: The simlifidb schema links Files to Reports, not directly to Events or BudgetItems. To upload files, you'll need to:
   - Create a Report first
   - Upload files to that Report
   - This is a significant architectural change from the old schema

2. **Event Assignments**: The old `eventAssignment` model allowed assigning users with roles. The new `EventStakeholder` model stores contact information. User assignment functionality has been adapted but works differently.

3. **Budget Structure**: Budget items are now organized under `BudgetVersion`, which allows versioning. The API automatically creates/uses a default version for backward compatibility.

4. **Backward Compatibility**: The API maintains backward compatibility where possible:
   - `client` field in DTOs maps to `location` in database
   - `name` field in responses maps from `fullName`
   - Old field names accepted but converted internally


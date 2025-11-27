# Schema Migration Guide: @database → @simlifidb

## Overview
The old backend (`apps/backend`) has been updated to use `@simlifidb` instead of `@database`. However, the schemas are different and require code updates.

## Schema Differences

### User Model
- ❌ Old: `password` field
- ✅ New: `passwordHash` field
- ❌ Old: `name` field  
- ✅ New: `fullName` field

### Budget Items
- ❌ Old: `budgetItem` model
- ✅ New: `BudgetLineItem` model (part of `BudgetVersion`)

### Events
- ❌ Old: `client` field
- ✅ New: No `client` field (different structure)
- ❌ Old: `eventAssignment` model
- ✅ New: `EventStakeholder` model
- ❌ Old: `files` count
- ✅ New: Different file structure

## Routes & Controllers

### ✅ Already Fixed
1. **Notifications** (`/notifications`)
   - ✅ Uses `NotificationType` from `@simlifidb`
   - ✅ Should work correctly

### ❌ Needs Fixing

#### 1. Auth Routes (`/auth`)
**Files:**
- `src/auth/auth.service.ts`
- `src/auth/strategies/jwt.strategy.ts`

**Issues:**
- Line 29: `user.password` → should be `user.passwordHash`
- Line 33: `password: _` → should be `passwordHash: _`
- Line 54: `password: hashedPassword` → should be `passwordHash: hashedPassword`
- Line 55: `name: registerDto.name` → should be `fullName: registerDto.name`
- Line 60: `name: true` → should be `fullName: true`
- Line 79: `name: true` → should be `fullName: true`
- Line 125: `name: user.name` → should be `name: user.fullName` (or update DTO)

**Routes:**
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`

#### 2. Budget Items Routes (`/budget-items`)
**Files:**
- `src/budget-items/budget-items.service.ts`
- `src/budget-items/budget-items.controller.ts`

**Issues:**
- Line 27: `budgetItem` → should be `budgetLineItem` (but structure is different)
- Line 47: `budgetItem` → should be `budgetLineItem`
- Line 80: `budgetItem` → should be `budgetLineItem`
- Line 168: `budgetItem` → should be `budgetLineItem`
- Line 201: `budgetItem` → should be `budgetLineItem`
- Line 228: `budgetItem` → should be `budgetLineItem`
- Line 287: `budgetItemId` → different structure in simlifidb
- Line 315: `budgetItemId` → different structure
- Line 320: `path` → different file structure
- Line 346: `filename` → different file structure

**Routes:**
- `GET /budget-items/event/:eventId`
- `GET /budget-items/:id`
- `POST /budget-items/event/:eventId`
- `PUT /budget-items/:id`
- `DELETE /budget-items/:id`
- `POST /budget-items/:id/files`

**Note:** Budget structure is completely different in simlifidb:
- Old: Direct `budgetItem` model
- New: `BudgetVersion` → `BudgetLineItem` hierarchy

#### 3. Events Routes (`/events`)
**Files:**
- `src/events/events.service.ts`
- `src/events/events.controller.ts`

**Issues:**
- Line 96: `files: true` → different count structure
- Line 133: `files: true` → different count structure
- Line 183: `client` field doesn't exist in simlifidb schema
- Line 269: `eventAssignment` → should be `EventStakeholder`
- Line 308: `eventAssignment` → should be `EventStakeholder`
- Line 323: `eventAssignment` → should be `EventStakeholder`
- Line 351: `name: true` → should be `fullName: true`
- Line 359: `name` → should be `fullName`

**Routes:**
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`
- `PUT /events/:id/status`
- `POST /events/:id/assign`
- `DELETE /events/:id/assign/:assignmentId`
- `POST /events/:id/files`

#### 4. Users Routes (`/users`)
**Files:**
- `src/users/users.service.ts`
- `src/users/users.controller.ts`

**Issues:**
- Need to check for `name` → `fullName` references
- Need to check for `password` → `passwordHash` references

**Routes:**
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `PUT /users/:id/role`
- `POST /users/:id/assign-event`

#### 5. Files Routes (`/files`)
**Files:**
- `src/files/files.service.ts`
- `src/files/files.controller.ts`

**Issues:**
- File structure might be different in simlifidb schema
- Need to check file model structure

**Routes:**
- `GET /files`
- `GET /files/:id`
- `POST /files/upload`
- `DELETE /files/:id`
- `GET /files/:id/download`

#### 6. Reports Routes (`/reports`)
**Files:**
- `src/reports/reports.service.ts`
- `src/reports/reports.controller.ts`

**Issues:**
- May need updates based on schema differences
- Check for `name` → `fullName` references

**Routes:**
- `GET /reports/event-summary/:eventId`
- `GET /reports/comparison`
- `POST /reports/comparison`

## Migration Strategy

### Option 1: Quick Fix (Field Name Changes)
Update field names to match simlifidb schema:
- `password` → `passwordHash`
- `name` → `fullName`
- `budgetItem` → `budgetLineItem` (with structural changes)
- `eventAssignment` → `EventStakeholder`

### Option 2: Complete Migration (Recommended)
Rewrite services to match simlifidb schema structure:
- Use `BudgetVersion` and `BudgetLineItem` hierarchy
- Use `EventStakeholder` instead of `eventAssignment`
- Update file handling to match new schema
- Remove `client` field references

### Option 3: Keep Separate (Not Recommended)
Revert changes and keep old backend using `@database`:
- Old backend uses old schema
- New backend (`backend-simplifi`) uses simlifidb schema
- Two separate systems

## Priority Order

1. **High Priority** (Core Functionality):
   - Auth routes (login/register broken)
   - Events routes (main feature)

2. **Medium Priority**:
   - Budget items (structure change needed)
   - Users routes

3. **Low Priority**:
   - Files routes
   - Reports routes

## Testing Checklist

After migration, test:
- [ ] User registration
- [ ] User login
- [ ] Event creation
- [ ] Event listing
- [ ] Budget item creation
- [ ] File uploads
- [ ] User assignments
- [ ] Notifications

## Notes

- The simlifidb schema is more advanced with:
  - Multi-tenant organization support
  - Budget versioning
  - Approval workflows
  - Enhanced reporting
  - CRM integration

- Consider migrating to `apps/backend-simplifi` which already uses simlifidb correctly.


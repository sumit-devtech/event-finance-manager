# Role-Based Permissions Matrix

## Complete Permissions Guide

### 👤 User Management

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **Create User** | ✅ | ❌ | ❌ | ❌ |
| **View Users** | ✅ | ❌ | ❌ | ❌ |
| **Edit User** | ✅ | ❌ | ❌ | ❌ |
| **Delete User** | ✅ | ❌ | ❌ | ❌ |
| **Assign Role** | ✅ | ❌ | ❌ | ❌ |
| **Assign Event to User** | ✅ | ❌ | ❌ | ❌ |

**Controller**: `UsersController` - All endpoints require `Admin` role

---

### 📅 Event Management

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **Create Event** | ✅ | ✅ | ❌ | ❌ |
| **View Events** | ✅ (All) | ✅ (Created/Assigned) | ✅ (Assigned) | ✅ (Assigned) |
| **Edit Event** | ✅ | ✅ (Assigned) | ❌ | ❌ |
| **Delete Event** | ✅ | ❌ | ❌ | ❌ |
| **Update Event Status** | ✅ | ✅ (Assigned) | ❌ | ❌ |
| **Assign Users to Event** | ✅ | ❌ | ❌ | ❌ |
| **Upload Event Files** | ✅ | ✅ (Assigned) | ❌ | ❌ |
| **Delete Event Files** | ✅ | ✅ (Assigned) | ❌ | ❌ |

**Controller**: `EventsController`
- Create: `Admin`, `EventManager`
- Read: All authenticated (filtered by assignments)
- Update/Delete: `Admin`, `EventManager` (with `EventAssignmentGuard`)

---

### 💰 Budget Item Management

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **Create Budget Item** | ✅ | ✅ | ✅ | ❌ |
| **View Budget Items** | ✅ | ✅ | ✅ | ✅ |
| **Edit Budget Item** | ✅ | ✅ | ✅ | ❌ |
| **Delete Budget Item** | ✅ | ✅ | ✅ | ❌ |
| **Upload Budget Item Files** | ✅ | ✅ | ✅ | ❌ |
| **Delete Budget Item Files** | ✅ | ✅ | ✅ | ❌ |
| **View Budget Totals** | ✅ | ✅ | ✅ | ✅ |
| **View Budget Variance** | ✅ | ✅ | ✅ | ✅ |

**Controller**: `BudgetItemsController`
- Create/Update/Delete: `Admin`, `EventManager`, `Finance`
- Read: `Admin`, `EventManager`, `Finance`, `Viewer`

---

### 💸 Expense Management

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **Create Expense** | ✅ | ✅ | ✅ | ❌ |
| **View Expenses** | ✅ (All) | ✅ (Assigned Events) | ✅ (Assigned Events) | ✅ (Assigned Events) |
| **Edit Expense** | ✅ | ✅ (Assigned Events) | ✅ (Assigned Events) | ❌ |
| **Delete Expense** | ✅ | ✅ (Assigned Events) | ❌ | ❌ |
| **Approve Expense** | ✅ | ✅ (Assigned Events) | ❌ | ❌ |
| **Reject Expense** | ✅ | ✅ (Assigned Events) | ❌ | ❌ |
| **Upload Receipt** | ✅ | ✅ | ✅ | ❌ |
| **Delete Receipt** | ✅ | ✅ | ✅ | ❌ |

**Controller**: `ExpensesController`
- Create: `Admin`, `EventManager`, `Finance`
- Read: `Admin`, `EventManager`, `Finance`, `Viewer` (filtered by accessible events)
- Approve/Reject: `Admin`, `EventManager`
- Delete: `Admin`, `EventManager`

**Note**: Expenses are filtered by event assignments:
- Admin sees all expenses
- EventManager sees expenses for events they created OR are assigned to
- Finance/Viewer see expenses only for events they are assigned to

---

### 🎯 Strategic Goals

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **Create Strategic Goal** | ✅ | ✅ | ❌ | ❌ |
| **View Strategic Goals** | ✅ | ✅ | ✅ | ✅ |
| **Edit Strategic Goal** | ✅ | ✅ | ❌ | ❌ |
| **Delete Strategic Goal** | ✅ | ✅ | ❌ | ❌ |

**Controller**: `StrategicGoalsController`
- Create/Update/Delete: `Admin`, `EventManager`
- Read: `Admin`, `EventManager`, `Finance`, `Viewer`

---

### 📄 File Management

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **Upload File** | ✅ | ✅ | ✅ | ❌ |
| **View/Download File** | ✅ | ✅ | ✅ | ✅ |
| **List Files** | ✅ | ✅ | ✅ | ✅ |
| **Get File Metadata** | ✅ | ✅ | ✅ | ✅ |
| **Delete File** | ✅ | ✅ | ✅ | ❌ |

**Controller**: `FilesController`
- Upload/Delete: `Admin`, `EventManager`, `Finance`
- Read/List/Metadata: `Admin`, `EventManager`, `Finance`, `Viewer`

---

### 📊 Reports & Analytics

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **View Reports** | ✅ | ✅ | ✅ | ❌ |
| **Export Reports** | ✅ | ✅ | ✅ | ❌ |
| **View Analytics** | ✅ | ✅ | ✅ | ✅ |
| **View Event Summary** | ✅ | ✅ | ✅ | ❌ |
| **View Comparison Reports** | ✅ | ✅ | ✅ | ❌ |

**Controller**: `ReportsController`
- All endpoints: `Admin`, `EventManager`, `Finance`

**Frontend Route**: `_protected.reports.tsx`
- Requires: `Admin`, `EventManager`, `Finance`

---

### 🔔 Notifications

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **View Notifications** | ✅ (Own) | ✅ (Own) | ✅ (Own) | ✅ (Own) |
| **Mark as Read** | ✅ (Own) | ✅ (Own) | ✅ (Own) | ✅ (Own) |
| **Mark All as Read** | ✅ (Own) | ✅ (Own) | ✅ (Own) | ✅ (Own) |

**Controller**: `NotificationsController`
- All endpoints: User can only access their own notifications (no role restriction, but user-specific)

---

### 👥 Team Management

| Action | Admin | EventManager | Finance | Viewer |
|--------|-------|--------------|---------|--------|
| **View Team** | ✅ | ❌ | ❌ | ❌ |
| **Manage Team** | ✅ | ❌ | ❌ | ❌ |

**Frontend Route**: `_protected.team.tsx`
- Requires: `Admin` only

---

## Quick Reference Summary

### ✅ Full Access (Admin)
- All operations across all modules
- User management
- Event management (all events)
- Budget, Expense, Reports, Analytics

### ✅ Manager Access (EventManager)
- Create/Edit Events (assigned events only)
- Create/Edit Budget Items
- Create/Edit Expenses
- Approve/Reject Expenses (for assigned events)
- View Reports & Analytics
- View assigned events only

### ✅ Finance Access (Finance)
- Create/Edit Budget Items
- Create/Edit Expenses
- View Expenses (assigned events only)
- View Reports & Analytics
- Upload/Delete Files
- Cannot approve expenses
- Cannot create/edit events

### ✅ Read-Only Access (Viewer)
- View Events (assigned events only)
- View Budget Items
- View Expenses (assigned events only)
- View Analytics
- View/Download Files
- Cannot create, edit, or delete anything
- Cannot approve expenses

---

## Important Notes

1. **Event Assignment Filtering**: 
   - EventManager, Finance, and Viewer only see events they are assigned to
   - Admin sees all events
   - This filtering applies to events, expenses, and related data

2. **Approval Workflow**:
   - Only Admin and EventManager can approve/reject expenses
   - Finance can create expenses but cannot approve them

3. **Budget Validation**:
   - Budget items cannot exceed event total budget
   - This validation applies to all roles that can create budget items

4. **File Access**:
   - All authenticated users can view/download files
   - Only Admin, EventManager, Finance can upload/delete files

5. **Reports Access**:
   - Viewer role cannot access reports (read-only for analytics only)
   - Reports require Admin, EventManager, or Finance role



# Quick Test Reference Guide

## 🚀 Quick Start Testing Order

1. **Register Admin** → Verify Email → Login
2. **Create Event** (Admin/EventManager)
3. **Assign Users** to Event (Admin)
4. **Create Vendors** (Admin/EventManager/Finance)
5. **Create Budget Items** (Admin/EventManager/Finance)
6. **Create Expenses** (Admin/EventManager/Finance)
7. **Approve Expenses** (Admin/EventManager)
8. **View Reports** (Admin/EventManager/Finance)

---

## 📊 Database Tables & When They Get Data

| Table | Created During | Key Fields |
|-------|---------------|------------|
| **Organization** | User registration | `id`, `name` |
| **User** | Registration, Admin creates | `id`, `email`, `role`, `organizationId` |
| **Subscription** | User registration | `planName`, `status`, `organizationId` |
| **Event** | Event creation | `id`, `name`, `status`, `budget`, `organizationId` |
| **EventAssignment** | User assigned to event | `userId`, `eventId` |
| **EventStakeholder** | Stakeholder added | `eventId`, `name`, `email` |
| **Vendor** | Vendor creation | `id`, `name`, `serviceType`, `organizationId` |
| **VendorEvent** | Vendor assigned to event | `vendorId`, `eventId` |
| **BudgetItem** | Budget item creation | `id`, `eventId`, `category`, `estimatedCost`, `vendorId` |
| **Expense** | Expense creation | `id`, `eventId`, `amount`, `status`, `budgetItemId` |
| **ApprovalWorkflow** | Expense approved/rejected | `expenseId`, `approverId`, `action` |
| **File** | File uploads | `id`, `eventId`/`budgetItemId`/`expenseId`, `filename` |
| **Notification** | System notifications | `userId`, `type`, `read` |
| **ActivityLog** | All user actions | `userId`, `eventId`, `action` |
| **StrategicGoal** | Goal creation | `id`, `eventId`, `title`, `targetValue` |
| **Report** | Report generation | `id`, `eventId`, `reportType` |
| **ROIMetrics** | Event completion | `eventId`, `totalBudget`, `actualSpend`, `roiPercent` |

---

## 👥 Role Permissions Quick Reference

### Admin
- ✅ **ALL** operations
- ✅ User management
- ✅ Event management (all events)
- ✅ Expense approval
- ✅ Reports & Analytics

### EventManager
- ✅ Create/Edit Events (assigned only)
- ✅ Create/Edit Budget Items
- ✅ Create/Edit Expenses
- ✅ **Approve/Reject Expenses** (assigned events)
- ✅ View Reports
- ❌ User management
- ❌ Delete events

### Finance
- ✅ Create/Edit Budget Items
- ✅ Create/Edit Expenses
- ✅ View Reports
- ❌ Create/Edit Events
- ❌ **Approve/Reject Expenses**
- ❌ User management

### Viewer
- ✅ View Events (assigned only)
- ✅ View Budget Items
- ✅ View Expenses (assigned events)
- ✅ View/Download Files
- ❌ Create/Edit/Delete anything
- ❌ Approve expenses
- ❌ View Reports

---

## 🔄 Complete Workflow Sequence

```
1. User Registration
   └─> Organization, User, Subscription, SubscriptionHistory, ActivityLog

2. Email Verification
   └─> User (update), ActivityLog

3. Event Creation
   └─> Event, ActivityLog

4. User Assignment
   └─> EventAssignment, Notification, ActivityLog

5. Vendor Creation
   └─> Vendor, ActivityLog

6. Vendor Assignment
   └─> VendorEvent, ActivityLog

7. Budget Item Creation
   └─> BudgetItem, ActivityLog

8. Expense Creation
   └─> Expense, ActivityLog

9. Expense Approval
   └─> ApprovalWorkflow, Expense (update), BudgetItem (update), Notification, ActivityLog

10. Event Completion
    └─> Event (update), ROIMetrics, ActivityLog
```

---

## ✅ Essential Test Scenarios

### Must-Test Scenarios

1. **Registration Flow**
   - [ ] Register user
   - [ ] Verify email
   - [ ] Login

2. **Event Management**
   - [ ] Create event
   - [ ] Assign users
   - [ ] Update status

3. **Budget Management**
   - [ ] Create budget items
   - [ ] Link to vendors
   - [ ] Verify totals

4. **Expense Management**
   - [ ] Create expense
   - [ ] Link to budget item
   - [ ] Approve expense
   - [ ] Verify budget updated

5. **Permission Testing**
   - [ ] Test each role's permissions
   - [ ] Verify access restrictions

---

## 🧪 Quick SQL Verification Queries

### Check User Registration
```sql
SELECT email, role, "isActive", "emailVerified", "organizationId"
FROM "User"
WHERE email = 'user@test.com';
```

### Check Event Data
```sql
SELECT e.name, e.status, e.budget,
       COUNT(DISTINCT ea."userId") as users,
       COUNT(DISTINCT bi.id) as budget_items,
       COUNT(DISTINCT exp.id) as expenses
FROM "Event" e
LEFT JOIN "EventAssignment" ea ON ea."eventId" = e.id
LEFT JOIN "BudgetItem" bi ON bi."eventId" = e.id
LEFT JOIN "Expense" exp ON exp."eventId" = e.id
WHERE e.name = 'Event Name'
GROUP BY e.id, e.name, e.status, e.budget;
```

### Check Budget vs Actual
```sql
SELECT 
  SUM(bi."estimatedCost") as estimated,
  SUM(bi."actualCost") as actual,
  SUM(bi."estimatedCost") - SUM(bi."actualCost") as variance
FROM "BudgetItem" bi
JOIN "Event" e ON e.id = bi."eventId"
WHERE e.name = 'Event Name';
```

### Check Expense Approval Status
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'Pending') as pending,
  COUNT(*) FILTER (WHERE status = 'Approved') as approved,
  COUNT(*) FILTER (WHERE status = 'Rejected') as rejected
FROM "Expense"
WHERE "eventId" = (SELECT id FROM "Event" WHERE name = 'Event Name');
```

---

## 🐛 Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| Can't login | Email verified? | Verify email manually |
| Can't see events | Assigned to event? | Admin assigns user |
| Can't approve expense | Role correct? | Must be Admin/EventManager |
| Budget exceeds limit | Check totals | Reduce budget items |
| File not uploading | Permissions? | Check upload directory |

---

## 📝 Test Data Template

### Users to Create
- `admin@test.com` - Admin
- `eventmanager@test.com` - EventManager
- `finance@test.com` - Finance
- `viewer@test.com` - Viewer

### Sample Event
- Name: `Tech Conference 2024`
- Budget: `50000`
- Status: `Planning` → `Active` → `Completed`

### Sample Budget Items
- Catering: `15000`
- Venue: `20000`
- Marketing: `5000`
- Technology: `3000`
- Logistics: `2000`
- Entertainment: `5000`

### Sample Expenses
- Catering Payment: `5000` (Approved)
- Venue Deposit: `5000` (Approved)
- Marketing Campaign: `3000` (Approved)

---

## 🎯 Testing Priorities

### High Priority (Must Test)
1. User registration & authentication
2. Event creation & management
3. Budget item creation
4. Expense creation & approval
5. Role-based permissions

### Medium Priority (Should Test)
1. Vendor management
2. File uploads
3. Reports generation
4. Notifications
5. Strategic goals

### Low Priority (Nice to Have)
1. Activity logs
2. Subscription management
3. ROI metrics
4. AI suggestions (if implemented)

---

## 📋 Quick Checklist

- [ ] Backend running
- [ ] Frontend running
- [ ] Database clean
- [ ] SMTP configured (or manual verification ready)
- [ ] Test users created
- [ ] Test event created
- [ ] Budget items created
- [ ] Expenses created & approved
- [ ] Permissions tested
- [ ] Reports verified

---

**See COMPREHENSIVE_TESTING_GUIDE.md for detailed step-by-step instructions.**


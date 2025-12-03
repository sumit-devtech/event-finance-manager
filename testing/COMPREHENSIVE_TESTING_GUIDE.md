# Comprehensive Testing Guide - Event Finance Manager

## Overview

This guide provides a complete step-by-step testing plan for the entire Event Finance Manager application. Each test scenario includes:
- **Action to perform**
- **Expected result**
- **Database tables affected**
- **Role requirements**

---

## Prerequisites

Before starting:
1. ✅ Database is clean (fresh start)
2. ✅ Backend server running (`cd apps/backend && npm run start:dev`)
3. ✅ Frontend server running (`cd apps/frontend && npm run dev`)
4. ✅ SMTP configured (or use manual verification method from SIGNUP_WORKFLOW.md)

---

## Phase 1: User Registration & Authentication

### Test 1.1: Register First User (Admin)

**Action:**
1. Navigate to `/login`
2. Click "Sign Up" tab
3. Fill registration form:
   - Email: `admin@test.com`
   - Password: `password123`
   - Full Name: `Admin User`
   - Confirm Password: `password123`
4. Submit form

**Expected Result:**
- ✅ Success message: "Registration successful. Please check your email..."
- ✅ Redirected to `/auth/verify-email?email=admin@test.com&pending=true`
- ✅ Verification email sent (if SMTP configured)

**Database Tables Affected:**
| Table | Records Created | Key Fields |
|-------|----------------|------------|
| `Organization` | 1 | `id`, `name` = "Admin User's Organization" |
| `User` | 1 | `id`, `email`, `role` = "Admin", `isActive` = false, `emailVerified` = false |
| `Subscription` | 1 | `planName` = "free", `status` = "Active" |
| `SubscriptionHistory` | 1 | `action` = "create" |
| `ActivityLog` | 1 | `action` = "user.registered" |

**Verification SQL:**
```sql
SELECT o.name, u.email, u.role, u."isActive", u."emailVerified", s."planName"
FROM "Organization" o
JOIN "User" u ON u."organizationId" = o.id
JOIN "Subscription" s ON s."organizationId" = o.id
WHERE u.email = 'admin@test.com';
```

---

### Test 1.2: Verify Email (Admin)

**Action:**
1. Get verification token from database or email
2. Visit: `http://localhost:5173/auth/verify-email?token={TOKEN}`
   OR use API: `GET /api/auth/verify-email?token={TOKEN}`

**Expected Result:**
- ✅ User account activated
- ✅ JWT tokens returned
- ✅ Redirected to dashboard
- ✅ User can now login

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `User` | `emailVerified` = true, `isActive` = true, `emailVerificationToken` = null |
| `ActivityLog` | 1 new record: `action` = "user.email_verified" |

**Verification SQL:**
```sql
SELECT email, "emailVerified", "isActive", "emailVerificationToken"
FROM "User"
WHERE email = 'admin@test.com';
-- Should show: emailVerified=true, isActive=true, token=null
```

---

### Test 1.3: Login (Admin)

**Action:**
1. Navigate to `/login`
2. Enter credentials:
   - Email: `admin@test.com`
   - Password: `password123`
3. Click "Sign In"

**Expected Result:**
- ✅ Successfully logged in
- ✅ Redirected to dashboard
- ✅ JWT token stored in session
- ✅ User info displayed in header

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `ActivityLog` | 1 new record: `action` = "user.logged_in" (if implemented) |

---

### Test 1.4: Register Additional Users (Different Roles)

**Action:** Repeat Test 1.1-1.3 for each role:
- **EventManager**: `eventmanager@test.com` / `password123`
- **Finance**: `finance@test.com` / `password123`
- **Viewer**: `viewer@test.com` / `password123`

**Note:** After registration, Admin must assign these users to the organization and set their roles via:
- API: `PUT /api/users/{userId}/role` with body: `{ "role": "EventManager" }`
- OR Frontend: `/team` page (Admin only)

**Expected Result:**
- ✅ Each user registered successfully
- ✅ Each user can login after email verification
- ✅ Users have correct roles assigned

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `User` | 3 new users (one per role) |
| `Organization` | 0 (users join existing org) |
| `Subscription` | 0 (shared subscription) |

**Verification SQL:**
```sql
SELECT email, role, "organizationId", "isActive", "emailVerified"
FROM "User"
WHERE email IN ('eventmanager@test.com', 'finance@test.com', 'viewer@test.com');
```

---

## Phase 2: Event Management Workflow

### Test 2.1: Create Event (Admin/EventManager)

**User:** Login as `admin@test.com` or `eventmanager@test.com`

**Action:**
1. Navigate to `/events` or dashboard
2. Click "Create New Event"
3. Fill event form:
   - Name: `Tech Conference 2024`
   - Location: `San Francisco, CA`
   - Venue: `Moscone Center`
   - Start Date: `2024-06-15`
   - End Date: `2024-06-17`
   - Event Type: `Conference`
   - Description: `Annual tech conference`
   - Expected Attendees: `500`
   - Total Budget: `50000`
4. Submit

**Expected Result:**
- ✅ Event created successfully
- ✅ Event visible in events list
- ✅ Status = "Planning"
- ✅ Event appears in dashboard

**Database Tables Affected:**
| Table | Records Created | Key Fields |
|-------|----------------|------------|
| `Event` | 1 | `id`, `name`, `status` = "Planning", `budget` = 50000 |
| `ActivityLog` | 1 | `action` = "event.created" |

**Verification SQL:**
```sql
SELECT id, name, status, budget, "createdBy", "organizationId"
FROM "Event"
WHERE name = 'Tech Conference 2024';
```

---

### Test 2.2: Assign Users to Event (Admin Only)

**User:** Login as `admin@test.com`

**Action:**
1. Navigate to event details page
2. Go to "Team" or "Assignments" section
3. Assign users:
   - EventManager: `eventmanager@test.com`
   - Finance: `finance@test.com`
   - Viewer: `viewer@test.com`
4. Save assignments

**Expected Result:**
- ✅ Users assigned to event
- ✅ Users can now see event in their dashboard
- ✅ Notifications sent to assigned users

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `EventAssignment` | 3 records (one per user) |
| `Notification` | 3 records (one per assigned user) |
| `ActivityLog` | 1 record: `action` = "event.user_assigned" |

**Verification SQL:**
```sql
SELECT u.email, ea.role, e.name as event_name
FROM "EventAssignment" ea
JOIN "User" u ON u.id = ea."userId"
JOIN "Event" e ON e.id = ea."eventId"
WHERE e.name = 'Tech Conference 2024';
```

---

### Test 2.3: Add Event Stakeholders (Admin/EventManager)

**User:** Login as `admin@test.com` or `eventmanager@test.com`

**Action:**
1. Navigate to event details
2. Go to "Stakeholders" section
3. Add stakeholder:
   - Name: `John Client`
   - Role: `Client`
   - Email: `john.client@example.com`
   - Phone: `+1-555-0100`
4. Save

**Expected Result:**
- ✅ Stakeholder added
- ✅ Visible in stakeholders list

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `EventStakeholder` | 1 record |

**Verification SQL:**
```sql
SELECT es.name, es.role, es.email, e.name as event_name
FROM "EventStakeholder" es
JOIN "Event" e ON e.id = es."eventId"
WHERE e.name = 'Tech Conference 2024';
```

---

### Test 2.4: Upload Event File (Admin/EventManager)

**User:** Login as `admin@test.com` or `eventmanager@test.com`

**Action:**
1. Navigate to event details
2. Go to "Files" section
3. Click "Upload File"
4. Select a file (PDF, image, etc.)
5. Upload

**Expected Result:**
- ✅ File uploaded successfully
- ✅ File visible in files list
- ✅ File downloadable

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `File` | 1 record with `eventId` set |

**Verification SQL:**
```sql
SELECT f.filename, f."mimeType", f.size, e.name as event_name
FROM "File" f
JOIN "Event" e ON e.id = f."eventId"
WHERE e.name = 'Tech Conference 2024';
```

---

### Test 2.5: Update Event Status (Admin/EventManager)

**User:** Login as `admin@test.com` or `eventmanager@test.com`

**Action:**
1. Navigate to event details
2. Change status from "Planning" → "Active"
3. Save

**Expected Result:**
- ✅ Status updated
- ✅ Event now shows as "Active"

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `Event` | `status` = "Active" |
| `ActivityLog` | 1 record: `action` = "event.status_updated" |

---

### Test 2.6: View Event (All Roles - Permission Test)

**Test as each role:**

1. **Admin** (`admin@test.com`):
   - ✅ Can see ALL events (even if not assigned)

2. **EventManager** (`eventmanager@test.com`):
   - ✅ Can see events they created OR are assigned to
   - ❌ Cannot see events they're not assigned to

3. **Finance** (`finance@test.com`):
   - ✅ Can see events they are assigned to
   - ❌ Cannot see events they're not assigned to

4. **Viewer** (`viewer@test.com`):
   - ✅ Can see events they are assigned to
   - ❌ Cannot see events they're not assigned to

**Verification:**
- Login as each role
- Navigate to `/events`
- Verify only appropriate events are visible

---

## Phase 3: Vendor Management Workflow

### Test 3.1: Create Vendor (Admin/EventManager/Finance)

**User:** Login as `admin@test.com`, `eventmanager@test.com`, or `finance@test.com`

**Action:**
1. Navigate to `/vendors`
2. Click "Add Vendor"
3. Fill vendor form:
   - Name: `ABC Catering Services`
   - Service Type: `Catering`
   - Contact Person: `Jane Smith`
   - Email: `jane@abccatering.com`
   - Phone: `+1-555-0200`
   - GST Number: `GST123456`
   - Rating: `4.5`
4. Save

**Expected Result:**
- ✅ Vendor created
- ✅ Visible in vendors list
- ✅ Can be linked to events

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `Vendor` | 1 record |

**Verification SQL:**
```sql
SELECT name, "serviceType", email, rating, "organizationId"
FROM "Vendor"
WHERE name = 'ABC Catering Services';
```

---

### Test 3.2: Assign Vendor to Event (Admin/EventManager/Finance)

**User:** Login as `admin@test.com` or `eventmanager@test.com`

**Action:**
1. Navigate to event details
2. Go to "Vendors" section
3. Click "Assign Vendor"
4. Select `ABC Catering Services`
5. Save

**Expected Result:**
- ✅ Vendor assigned to event
- ✅ Vendor visible in event's vendor list

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `VendorEvent` | 1 record linking vendor to event |

**Verification SQL:**
```sql
SELECT v.name as vendor_name, e.name as event_name
FROM "VendorEvent" ve
JOIN "Vendor" v ON v.id = ve."vendorId"
JOIN "Event" e ON e.id = ve."eventId"
WHERE e.name = 'Tech Conference 2024';
```

---

### Test 3.3: View Vendors (Permission Test)

**Test as each role:**

1. **Admin/EventManager/Finance**: ✅ Can view all vendors
2. **Viewer**: ✅ Can view all vendors (read-only)

**Action:**
- Navigate to `/vendors`
- Verify vendors are visible

---

## Phase 4: Budget Item Management Workflow

### Test 4.1: Create Budget Item (Admin/EventManager/Finance)

**User:** Login as `admin@test.com`, `eventmanager@test.com`, or `finance@test.com`

**Action:**
1. Navigate to event details
2. Go to "Budget" section
3. Click "Add Budget Item"
4. Fill budget item form:
   - Category: `Catering`
   - Subcategory: `Meals`
   - Description: `Breakfast and lunch for 500 attendees`
   - Vendor: `ABC Catering Services` (select from dropdown)
   - Estimated Cost: `15000`
   - Notes: `Includes vegetarian options`
5. Save

**Expected Result:**
- ✅ Budget item created
- ✅ Visible in budget list
- ✅ Total budget updated
- ✅ Budget item linked to vendor

**Database Tables Affected:**
| Table | Records Created | Key Fields |
|-------|----------------|------------|
| `BudgetItem` | 1 | `category` = "Catering", `estimatedCost` = 15000, `vendorId` linked |
| `ActivityLog` | 1 | `action` = "budget_item.created" |

**Verification SQL:**
```sql
SELECT bi.description, bi.category, bi."estimatedCost", v.name as vendor_name, e.name as event_name
FROM "BudgetItem" bi
JOIN "Event" e ON e.id = bi."eventId"
LEFT JOIN "Vendor" v ON v.id = bi."vendorId"
WHERE e.name = 'Tech Conference 2024';
```

---

### Test 4.2: Create Multiple Budget Items

**Action:** Create additional budget items:
1. **Venue**: `Moscone Center Rental` - $20000
2. **Marketing**: `Social Media Campaign` - $5000
3. **Technology**: `AV Equipment` - $3000
4. **Logistics**: `Transportation` - $2000
5. **Entertainment**: `Keynote Speaker` - $5000

**Expected Result:**
- ✅ All budget items created
- ✅ Total estimated cost = $50000 (matches event budget)
- ✅ Budget variance shows $0

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `BudgetItem` | 5 additional records |

**Verification SQL:**
```sql
SELECT 
  category,
  COUNT(*) as item_count,
  SUM("estimatedCost") as total_estimated
FROM "BudgetItem"
WHERE "eventId" = (SELECT id FROM "Event" WHERE name = 'Tech Conference 2024')
GROUP BY category;
```

---

### Test 4.3: Update Budget Item (Admin/EventManager/Finance)

**User:** Login as `admin@test.com`, `eventmanager@test.com`, or `finance@test.com`

**Action:**
1. Navigate to budget item
2. Edit estimated cost: `15000` → `18000`
3. Save

**Expected Result:**
- ✅ Budget item updated
- ✅ Budget variance recalculated

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `BudgetItem` | `estimatedCost` = 18000, `lastEditedBy` set, `lastEditedAt` set |
| `ActivityLog` | 1 record: `action` = "budget_item.updated" |

---

### Test 4.4: Assign Budget Item to User (Admin/EventManager/Finance)

**Action:**
1. Navigate to budget item
2. Assign to user: `finance@test.com`
3. Save

**Expected Result:**
- ✅ Budget item assigned
- ✅ User receives notification (if implemented)

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `BudgetItem` | `assignedUserId` set |
| `Notification` | 1 record (if implemented) |

---

### Test 4.5: Upload Budget Item File (Admin/EventManager/Finance)

**Action:**
1. Navigate to budget item
2. Upload file (e.g., vendor quote PDF)
3. Save

**Expected Result:**
- ✅ File uploaded
- ✅ Linked to budget item

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `File` | 1 record with `budgetItemId` set |

---

### Test 4.6: View Budget Items (Permission Test)

**Test as each role:**

1. **Admin/EventManager/Finance**: ✅ Can view all budget items
2. **Viewer**: ✅ Can view budget items (read-only)
3. **Viewer**: ❌ Cannot create/edit/delete

---

## Phase 5: Strategic Goals Workflow

### Test 5.1: Create Strategic Goal (Admin/EventManager)

**User:** Login as `admin@test.com` or `eventmanager@test.com`

**Action:**
1. Navigate to event details
2. Go to "Strategic Goals" section
3. Click "Add Goal"
4. Fill form:
   - Title: `Generate 200 Qualified Leads`
   - Description: `Target 200 qualified leads from the conference`
   - Target Value: `200`
   - Current Value: `0`
   - Unit: `leads`
   - Deadline: `2024-06-17`
   - Priority: `High`
   - Status: `not-started`
5. Save

**Expected Result:**
- ✅ Strategic goal created
- ✅ Visible in goals list

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `StrategicGoal` | 1 record |

**Verification SQL:**
```sql
SELECT sg.title, sg."targetValue", sg.status, e.name as event_name
FROM "StrategicGoal" sg
JOIN "Event" e ON e.id = sg."eventId"
WHERE e.name = 'Tech Conference 2024';
```

---

### Test 5.2: Link Budget Item to Strategic Goal

**Action:**
1. Navigate to budget item
2. Link to strategic goal: `Generate 200 Qualified Leads`
3. Save

**Expected Result:**
- ✅ Budget item linked to goal
- ✅ Goal progress can be tracked

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `BudgetItem` | `strategicGoalId` set |

---

### Test 5.3: Update Goal Progress (Admin/EventManager)

**Action:**
1. Navigate to strategic goal
2. Update current value: `0` → `150`
3. Update status: `not-started` → `in-progress`
4. Save

**Expected Result:**
- ✅ Goal progress updated
- ✅ Progress percentage calculated

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `StrategicGoal` | `currentValue` = 150, `status` = "in-progress" |

---

## Phase 6: Expense Management & Approval Workflow

### Test 6.1: Create Expense (Admin/EventManager/Finance)

**User:** Login as `admin@test.com`, `eventmanager@test.com`, or `finance@test.com`

**Action:**
1. Navigate to event details
2. Go to "Expenses" section
3. Click "Add Expense"
4. Fill expense form:
   - Title: `Catering Payment - Breakfast`
   - Category: `Catering`
   - Budget Item: `Breakfast and lunch for 500 attendees` (link to existing)
   - Vendor: `ABC Catering Services`
   - Amount: `5000`
   - Description: `First payment for catering services`
   - Status: `Pending`
5. Save

**Expected Result:**
- ✅ Expense created
- ✅ Status = "Pending"
- ✅ Linked to budget item
- ✅ Linked to vendor

**Database Tables Affected:**
| Table | Records Created | Key Fields |
|-------|----------------|------------|
| `Expense` | 1 | `status` = "Pending", `amount` = 5000, `budgetItemId` linked |
| `ActivityLog` | 1 | `action` = "expense.created" |

**Verification SQL:**
```sql
SELECT e.title, e.amount, e.status, bi.description as budget_item, v.name as vendor
FROM "Expense" e
JOIN "Event" ev ON ev.id = e."eventId"
LEFT JOIN "BudgetItem" bi ON bi.id = e."budgetItemId"
LEFT JOIN "Vendor" v ON v.id = e."vendorId"
WHERE ev.name = 'Tech Conference 2024';
```

---

### Test 6.2: Upload Receipt (Admin/EventManager/Finance)

**Action:**
1. Navigate to expense
2. Upload receipt file (PDF/image)
3. Save

**Expected Result:**
- ✅ Receipt uploaded
- ✅ Linked to expense

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `File` | 1 record with `expenseId` set |

---

### Test 6.3: Approve Expense (Admin/EventManager Only)

**User:** Login as `admin@test.com` or `eventmanager@test.com`

**Action:**
1. Navigate to expense
2. Click "Approve"
3. Add optional comment: `Approved - within budget`
4. Submit

**Expected Result:**
- ✅ Expense status = "Approved"
- ✅ Approval workflow record created
- ✅ Budget item actual cost updated
- ✅ Event total expenses updated
- ✅ Notification sent to expense creator

**Database Tables Affected:**
| Table | Records Created/Updated |
|-------|------------------------|
| `Expense` | `status` = "Approved" |
| `ApprovalWorkflow` | 1 record: `action` = "approved" |
| `BudgetItem` | `actualCost` updated (if linked) |
| `ActivityLog` | 1 record: `action` = "expense.approved" |
| `Notification` | 1 record (to expense creator) |

**Verification SQL:**
```sql
SELECT 
  e.title,
  e.status,
  aw.action as approval_action,
  aw.comments,
  bi."actualCost" as budget_item_actual_cost
FROM "Expense" e
LEFT JOIN "ApprovalWorkflow" aw ON aw."expenseId" = e.id
LEFT JOIN "BudgetItem" bi ON bi.id = e."budgetItemId"
WHERE e.title = 'Catering Payment - Breakfast';
```

---

### Test 6.4: Reject Expense (Admin/EventManager Only)

**Action:**
1. Create another expense: `Invalid Expense` - $1000
2. Navigate to expense
3. Click "Reject"
4. Add comment: `Rejected - insufficient documentation`
5. Submit

**Expected Result:**
- ✅ Expense status = "Rejected"
- ✅ Approval workflow record created
- ✅ Notification sent

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `Expense` | `status` = "Rejected" |
| `ApprovalWorkflow` | 1 record: `action` = "rejected" |

---

### Test 6.5: Create Multiple Expenses

**Action:** Create additional expenses:
1. `Venue Deposit` - $5000 (Catering category, link to venue budget item)
2. `Marketing Campaign` - $3000 (Marketing category)
3. `AV Equipment Rental` - $2500 (Technology category)

**Then approve all expenses**

**Expected Result:**
- ✅ All expenses created
- ✅ All expenses approved
- ✅ Total actual spend calculated
- ✅ Budget variance calculated

**Verification SQL:**
```sql
SELECT 
  category,
  COUNT(*) as expense_count,
  SUM(amount) as total_amount,
  COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count
FROM "Expense"
WHERE "eventId" = (SELECT id FROM "Event" WHERE name = 'Tech Conference 2024')
GROUP BY category;
```

---

### Test 6.6: Expense Permission Test

**Test as each role:**

1. **Admin**: ✅ Can create, view, approve, reject, delete all expenses
2. **EventManager**: ✅ Can create, view, approve, reject expenses for assigned events
3. **Finance**: ✅ Can create, view expenses for assigned events
   - ❌ Cannot approve/reject expenses
4. **Viewer**: ✅ Can view expenses for assigned events
   - ❌ Cannot create, edit, delete, or approve

---

## Phase 7: Reports & Analytics

### Test 7.1: View Event Summary Report (Admin/EventManager/Finance)

**User:** Login as `admin@test.com`, `eventmanager@test.com`, or `finance@test.com`

**Action:**
1. Navigate to `/reports`
2. Select event: `Tech Conference 2024`
3. View "Event Summary" report

**Expected Result:**
- ✅ Report generated
- ✅ Shows budget vs actual
- ✅ Shows expense breakdown by category
- ✅ Shows budget variance

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `Report` | 1 record (if report generation creates DB entry) |

---

### Test 7.2: View Budget Variance Report

**Action:**
1. Navigate to event details
2. Go to "Reports" section
3. View "Budget Variance" report

**Expected Result:**
- ✅ Variance calculated correctly
- ✅ Shows over/under budget items
- ✅ Visual charts displayed

---

### Test 7.3: View ROI Metrics (After Event Completion)

**Action:**
1. Update event status to "Completed"
2. Navigate to event details
3. View "ROI Metrics" section

**Expected Result:**
- ✅ ROI metrics calculated
- ✅ Shows total budget vs actual spend
- ✅ Shows ROI percentage

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `ROIMetrics` | 1 record (if auto-generated on completion) |

**Verification SQL:**
```sql
SELECT 
  e.name as event_name,
  rm."totalBudget",
  rm."actualSpend",
  rm."roiPercent"
FROM "ROIMetrics" rm
JOIN "Event" e ON e.id = rm."eventId"
WHERE e.name = 'Tech Conference 2024';
```

---

### Test 7.4: Reports Permission Test

**Test as each role:**

1. **Admin/EventManager/Finance**: ✅ Can view all reports
2. **Viewer**: ❌ Cannot access reports (read-only for analytics only)

---

## Phase 8: Notifications

### Test 8.1: View Notifications (All Roles)

**Action:**
1. Login as any user
2. Check notifications icon/bell
3. View notification list

**Expected Result:**
- ✅ User sees only their own notifications
- ✅ Unread count displayed
- ✅ Notifications sorted by date

**Database Tables Affected:**
| Table | Queries |
|-------|---------|
| `Notification` | SELECT filtered by `userId` |

---

### Test 8.2: Mark Notification as Read

**Action:**
1. Click on a notification
2. Mark as read

**Expected Result:**
- ✅ Notification marked as read
- ✅ Unread count updated

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `Notification` | `read` = true, `readAt` set |

---

### Test 8.3: Mark All Notifications as Read

**Action:**
1. Click "Mark All as Read"

**Expected Result:**
- ✅ All notifications marked as read
- ✅ Unread count = 0

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `Notification` | All user's notifications: `read` = true |

---

## Phase 9: File Management

### Test 9.1: Upload File to Event (Admin/EventManager)

**Action:**
1. Navigate to event details
2. Upload file
3. Verify file appears in list

**Expected Result:**
- ✅ File uploaded
- ✅ File metadata stored
- ✅ File downloadable

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `File` | 1 record with `eventId` |

---

### Test 9.2: Delete File (Admin/EventManager/Finance)

**Action:**
1. Navigate to file
2. Delete file

**Expected Result:**
- ✅ File deleted from database
- ✅ File removed from storage (if implemented)

**Database Tables Affected:**
| Table | Records Deleted |
|-------|----------------|
| `File` | 1 record deleted |

---

### Test 9.3: View File (All Roles)

**Action:**
1. Navigate to file
2. Download/view file

**Expected Result:**
- ✅ File accessible
- ✅ File content correct

---

## Phase 10: User Management (Admin Only)

### Test 10.1: Create User (Admin)

**User:** Login as `admin@test.com`

**Action:**
1. Navigate to `/team`
2. Click "Add User"
3. Fill form:
   - Email: `newuser@test.com`
   - Full Name: `New User`
   - Role: `EventManager`
4. Save

**Expected Result:**
- ✅ User created
- ✅ User receives invitation email (if implemented)
- ✅ User visible in team list

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `User` | 1 record |
| `ActivityLog` | 1 record: `action` = "user.created" |

---

### Test 10.2: Update User Role (Admin)

**Action:**
1. Navigate to user in team list
2. Change role: `EventManager` → `Finance`
3. Save

**Expected Result:**
- ✅ Role updated
- ✅ User permissions updated

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `User` | `role` = "Finance" |
| `ActivityLog` | 1 record: `action` = "user.role_updated" |

---

### Test 10.3: Assign Event to User (Admin)

**Action:**
1. Navigate to user
2. Assign event: `Tech Conference 2024`
3. Save

**Expected Result:**
- ✅ Event assigned
- ✅ User can now see event

**Database Tables Affected:**
| Table | Records Created |
|-------|----------------|
| `EventAssignment` | 1 record |

---

### Test 10.4: Delete User (Admin)

**Action:**
1. Navigate to user
2. Delete user

**Expected Result:**
- ✅ User deleted (or deactivated)
- ✅ User removed from team list

**Database Tables Affected:**
| Table | Changes |
|-------|---------|
| `User` | `isActive` = false (soft delete) OR record deleted |

---

## Phase 11: Subscription Management

### Test 11.1: View Subscription (Admin)

**User:** Login as `admin@test.com`

**Action:**
1. Navigate to subscription settings
2. View current subscription

**Expected Result:**
- ✅ Subscription details displayed
- ✅ Plan name, billing cycle, status shown

**Database Tables Affected:**
| Table | Queries |
|-------|---------|
| `Subscription` | SELECT for organization |
| `SubscriptionHistory` | SELECT history records |

---

### Test 11.2: Upgrade Subscription (If Implemented)

**Action:**
1. Navigate to subscription
2. Upgrade plan (e.g., Free → Pro)
3. Confirm upgrade

**Expected Result:**
- ✅ Subscription updated
- ✅ History record created
- ✅ New limits applied

**Database Tables Affected:**
| Table | Records Created/Updated |
|-------|------------------------|
| `Subscription` | `planName` updated |
| `SubscriptionHistory` | 1 record: `action` = "upgrade" |

---

## Phase 12: Activity Logging

### Test 12.1: View Activity Logs (Admin)

**User:** Login as `admin@test.com`

**Action:**
1. Navigate to activity logs (if available)
2. View logs

**Expected Result:**
- ✅ All activity logs visible
- ✅ Logs show user, action, timestamp
- ✅ Logs filtered by organization

**Database Tables Affected:**
| Table | Queries |
|-------|---------|
| `ActivityLog` | SELECT filtered by `organizationId` |

**Verification SQL:**
```sql
SELECT 
  al.action,
  al."createdAt",
  u.email as user_email,
  e.name as event_name
FROM "ActivityLog" al
JOIN "User" u ON u.id = al."userId"
LEFT JOIN "Event" e ON e.id = al."eventId"
WHERE al."organizationId" = (SELECT "organizationId" FROM "User" WHERE email = 'admin@test.com')
ORDER BY al."createdAt" DESC
LIMIT 20;
```

---

## Phase 13: Complete Workflow Integration Test

### Test 13.1: End-to-End Event Lifecycle

**Complete workflow from start to finish:**

1. **Setup:**
   - ✅ Admin creates organization
   - ✅ Admin creates users (EventManager, Finance, Viewer)
   - ✅ Admin assigns users to organization

2. **Event Planning:**
   - ✅ EventManager creates event
   - ✅ Admin assigns team members
   - ✅ EventManager adds stakeholders
   - ✅ Finance creates budget items
   - ✅ EventManager assigns vendors
   - ✅ Finance links vendors to budget items

3. **Event Execution:**
   - ✅ EventManager changes status to "Active"
   - ✅ Finance creates expenses
   - ✅ EventManager approves expenses
   - ✅ Actual costs update budget items
   - ✅ Budget variance calculated

4. **Event Completion:**
   - ✅ EventManager changes status to "Completed"
   - ✅ ROI metrics calculated
   - ✅ Reports generated
   - ✅ Final summary available

**Expected Result:**
- ✅ All workflows complete successfully
- ✅ All data relationships maintained
- ✅ All permissions enforced correctly
- ✅ All notifications sent
- ✅ All activity logs created

---

## Database Tables Summary

### Tables That Get Data During Testing

| Table | When Data is Created | Test Phase |
|-------|---------------------|------------|
| `Organization` | User registration | Phase 1 |
| `User` | User registration, user creation | Phase 1, 10 |
| `Subscription` | User registration | Phase 1 |
| `SubscriptionHistory` | User registration, subscription changes | Phase 1, 11 |
| `Event` | Event creation | Phase 2 |
| `EventAssignment` | User assignment to event | Phase 2, 10 |
| `EventStakeholder` | Stakeholder addition | Phase 2 |
| `Vendor` | Vendor creation | Phase 3 |
| `VendorEvent` | Vendor assignment to event | Phase 3 |
| `BudgetItem` | Budget item creation | Phase 4 |
| `StrategicGoal` | Strategic goal creation | Phase 5 |
| `Expense` | Expense creation | Phase 6 |
| `ApprovalWorkflow` | Expense approval/rejection | Phase 6 |
| `File` | File uploads | Phase 2, 4, 6, 9 |
| `Notification` | System notifications | Phase 2, 6, 8 |
| `ActivityLog` | All user actions | All phases |
| `Report` | Report generation | Phase 7 |
| `ROIMetrics` | Event completion | Phase 7 |
| `Insight` | Automatic insights | Phase 7 (if implemented) |
| `AiBudgetSuggestion` | AI suggestions (if implemented) | Phase 4 (if implemented) |
| `CRMSync` | CRM integration (if implemented) | Phase 2 (if implemented) |

---

## Testing Checklist

### ✅ Pre-Testing Setup
- [ ] Database is clean
- [ ] Backend server running
- [ ] Frontend server running
- [ ] SMTP configured (or manual verification ready)

### ✅ Phase 1: Authentication
- [ ] Register Admin user
- [ ] Verify email
- [ ] Login as Admin
- [ ] Register EventManager user
- [ ] Register Finance user
- [ ] Register Viewer user
- [ ] Assign users to organization (Admin)

### ✅ Phase 2: Events
- [ ] Create event (Admin/EventManager)
- [ ] Assign users to event (Admin)
- [ ] Add stakeholders
- [ ] Upload event files
- [ ] Update event status
- [ ] Test event visibility by role

### ✅ Phase 3: Vendors
- [ ] Create vendor
- [ ] Assign vendor to event
- [ ] Test vendor visibility by role

### ✅ Phase 4: Budget Items
- [ ] Create budget items
- [ ] Link budget items to vendors
- [ ] Update budget items
- [ ] Assign budget items to users
- [ ] Upload budget item files
- [ ] Test budget item permissions by role

### ✅ Phase 5: Strategic Goals
- [ ] Create strategic goals
- [ ] Link budget items to goals
- [ ] Update goal progress

### ✅ Phase 6: Expenses
- [ ] Create expenses
- [ ] Link expenses to budget items
- [ ] Upload receipts
- [ ] Approve expenses (Admin/EventManager)
- [ ] Reject expenses (Admin/EventManager)
- [ ] Test expense permissions by role

### ✅ Phase 7: Reports
- [ ] View event summary report
- [ ] View budget variance report
- [ ] View ROI metrics
- [ ] Test report permissions by role

### ✅ Phase 8: Notifications
- [ ] View notifications
- [ ] Mark notification as read
- [ ] Mark all as read

### ✅ Phase 9: Files
- [ ] Upload files
- [ ] Delete files
- [ ] View/download files

### ✅ Phase 10: User Management
- [ ] Create user (Admin)
- [ ] Update user role (Admin)
- [ ] Assign event to user (Admin)
- [ ] Delete user (Admin)

### ✅ Phase 11: Subscriptions
- [ ] View subscription (Admin)
- [ ] Upgrade subscription (if implemented)

### ✅ Phase 12: Activity Logs
- [ ] View activity logs (Admin)

### ✅ Phase 13: Integration
- [ ] Complete end-to-end workflow
- [ ] Verify all data relationships
- [ ] Verify all permissions

---

## Common Issues & Troubleshooting

### Issue: User cannot login after registration
**Solution:**
- Check if email is verified: `SELECT "emailVerified" FROM "User" WHERE email = 'user@test.com';`
- If not verified, verify manually or use verification token

### Issue: User cannot see events
**Solution:**
- Check event assignments: `SELECT * FROM "EventAssignment" WHERE "userId" = 'USER_ID';`
- Admin should see all events regardless of assignments

### Issue: Expense approval not working
**Solution:**
- Verify user role: Only Admin and EventManager can approve
- Check if user is assigned to the event

### Issue: Budget items not linking to expenses
**Solution:**
- Verify `budgetItemId` is set in expense record
- Check that budget item exists and belongs to same event

### Issue: Files not uploading
**Solution:**
- Check file upload directory permissions
- Verify file size limits
- Check MIME type restrictions

---

## SQL Queries for Verification

### Check All Data Created
```sql
-- Count records per table
SELECT 'Organization' as table_name, COUNT(*) as count FROM "Organization"
UNION ALL
SELECT 'User', COUNT(*) FROM "User"
UNION ALL
SELECT 'Event', COUNT(*) FROM "Event"
UNION ALL
SELECT 'EventAssignment', COUNT(*) FROM "EventAssignment"
UNION ALL
SELECT 'Vendor', COUNT(*) FROM "Vendor"
UNION ALL
SELECT 'BudgetItem', COUNT(*) FROM "BudgetItem"
UNION ALL
SELECT 'Expense', COUNT(*) FROM "Expense"
UNION ALL
SELECT 'File', COUNT(*) FROM "File"
UNION ALL
SELECT 'Notification', COUNT(*) FROM "Notification"
UNION ALL
SELECT 'ActivityLog', COUNT(*) FROM "ActivityLog";
```

### Check Event Complete Data
```sql
SELECT 
  e.name as event_name,
  e.status,
  e.budget,
  COUNT(DISTINCT ea."userId") as assigned_users,
  COUNT(DISTINCT es.id) as stakeholders,
  COUNT(DISTINCT bi.id) as budget_items,
  COUNT(DISTINCT exp.id) as expenses,
  SUM(exp.amount) FILTER (WHERE exp.status = 'Approved') as total_approved_expenses
FROM "Event" e
LEFT JOIN "EventAssignment" ea ON ea."eventId" = e.id
LEFT JOIN "EventStakeholder" es ON es."eventId" = e.id
LEFT JOIN "BudgetItem" bi ON bi."eventId" = e.id
LEFT JOIN "Expense" exp ON exp."eventId" = e.id
WHERE e.name = 'Tech Conference 2024'
GROUP BY e.id, e.name, e.status, e.budget;
```

### Check Budget vs Actual
```sql
SELECT 
  bi.category,
  SUM(bi."estimatedCost") as estimated_total,
  SUM(bi."actualCost") as actual_total,
  SUM(bi."estimatedCost") - SUM(bi."actualCost") as variance
FROM "BudgetItem" bi
JOIN "Event" e ON e.id = bi."eventId"
WHERE e.name = 'Tech Conference 2024'
GROUP BY bi.category;
```

---

## Notes

1. **Role Testing**: Always test each action with different roles to verify permissions
2. **Data Relationships**: Verify foreign key relationships are maintained
3. **Notifications**: Check that notifications are sent for important actions
4. **Activity Logs**: Verify all actions are logged
5. **Budget Validation**: Ensure budget items don't exceed event total budget
6. **Expense Approval**: Only Admin and EventManager can approve expenses
7. **Event Visibility**: Non-admin users only see assigned events

---

## Next Steps After Testing

1. **Review Test Results**: Document any issues found
2. **Fix Bugs**: Address any failures
3. **Re-test**: Re-run failed tests after fixes
4. **Performance Testing**: Test with larger datasets
5. **Security Testing**: Test authorization and data access
6. **User Acceptance Testing**: Have real users test the workflows

---

**Last Updated:** 2024-12-15
**Version:** 1.0


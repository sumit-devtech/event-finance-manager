# Event Budget Planner Workflow - Testing Guide

This guide walks you through testing the complete Event Budget Planner workflow from event creation to expense approval.

## Prerequisites

1. **Database Setup**
   ```bash
   cd packages/database
   pnpm db:generate  # Generate Prisma Client with new schema
   pnpm db:push      # Push schema changes to database
   pnpm db:seed      # Seed test users and data
   ```

2. **Start Services**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   pnpm dev

   # Terminal 2 - Frontend
   cd apps/frontend
   pnpm dev
   ```

3. **Test Users** (created by seed script)
   - **Admin**: `admin@demo.com` / `password123`
   - **Event Manager**: `manager@demo.com` / `password123`
   - **Finance/Staff**: `finance@demo.com` / `password123`
   - **Viewer**: `viewer@demo.com` / `password123`

---

## Complete Workflow Testing Steps

### STEP 1: Admin Creates Event & Assigns Manager

**Login as Admin** (`admin@demo.com`)

1. Navigate to **Events** page
2. Click **"Create New Event"**
3. Fill in event details:
   - **Name**: "Annual Tech Conference 2024"
   - **Location**: "San Francisco Convention Center"
   - **Start Date**: Select a future date
   - **End Date**: Select a future date
   - **Total Budget**: `130000` (this is the event budget limit)
   - **Status**: "Planning"
4. **Optional**: Set Manager during creation
   - If you have manager user ID, add `managerId` field
5. Click **"Create Event"**

**Verify**:
- Event appears in events list
- Event shows "Planning" status
- Budget is set to $130,000

**Assign Manager** (if not done during creation):
1. Open the event detail page
2. Go to **"Assignments"** section
3. Select a user with **EventManager** role
4. Set role as **"Manager"**
5. Click **"Assign"**

**Verify**:
- Manager appears in event assignments
- Manager role is shown as "Manager"

---

### STEP 2: Manager Creates Budget Categories

**Login as Event Manager** (`manager@demo.com`)

1. Navigate to the event you created
2. Go to **"Budget"** tab
3. Click **"Add Budget Item"**
4. Create budget categories (total must ≤ $130,000):

   **Category 1: Venue**
   - Category: **Venue**
   - Description: "Conference Hall Rental"
   - Estimated Cost: `40000`
   - Click **"Add"**

   **Category 2: Catering**
   - Category: **Catering**
   - Description: "Lunch & Coffee Service"
   - Estimated Cost: `60000`
   - Click **"Add"**

   **Category 3: Marketing**
   - Category: **Marketing**
   - Description: "Social Media Campaign"
   - Estimated Cost: `10000`
   - Click **"Add"**

   **Category 4: Decoration**
   - Category: **Miscellaneous** (or create new category)
   - Description: "Event Decoration"
   - Estimated Cost: `20000`
   - Click **"Add"**

**Verify**:
- Total estimated budget = $130,000 (matches event budget)
- All categories appear in budget list
- Budget summary shows:
  - Total Estimated: $130,000
  - Total Actual: $0
  - Remaining: $130,000

**Test Budget Validation**:
- Try adding another budget item with $1,000
- Should **FAIL** with error: "Total budget items exceeds event budget"
- This validates the budget constraint

---

### STEP 3: Staff/Finance Creates Expense Requests

**Login as Finance/Staff** (`finance@demo.com`)

1. Navigate to **"Expenses"** page (or from event detail page)
2. Click **"Add Expense"** button
3. Fill in expense details:

   **Expense 1: Venue Deposit**
   - **Event**: Select "Annual Tech Conference 2024"
   - **Category**: **Venue**
   - **Title**: "Conference Hall Deposit"
   - **Amount**: `15000`
   - **Vendor**: "Grand Convention Center"
   - **Description**: "50% deposit for 3-day rental"
   - Click **"Submit"**

   **Expense 2: Catering Service**
   - **Event**: Select "Annual Tech Conference 2024"
   - **Category**: **Catering**
   - **Title**: "Lunch Catering - Day 1"
   - **Amount**: `8500`
   - **Vendor**: "Gourmet Catering Co"
   - **Description**: "500 attendees x $17 per person"
   - Click **"Submit"**

   **Expense 3: Marketing Campaign**
   - **Event**: Select "Annual Tech Conference 2024"
   - **Category**: **Marketing**
   - **Title**: "Social Media Ads"
   - **Amount**: `5000`
   - **Vendor**: "AdTech Solutions"
   - Click **"Submit"**

**Verify**:
- All expenses appear in expenses list
- Status shows as **"Pending"**
- Expenses are linked to correct event and category
- You can see who submitted each expense

**Optional: Upload Receipt**
- Click on an expense
- Click **"Upload Receipt"**
- Select an image/file
- File should upload successfully

---

### STEP 4: Manager Reviews & Approves Expenses

**Login as Event Manager** (`manager@demo.com`)

1. Navigate to **"Expenses"** page
2. You should see all pending expenses
3. For each expense:

   **Approve Expense 1 (Venue Deposit)**:
   - Click **"Approve"** button (✓ icon)
   - Add optional comment: "Approved - standard deposit"
   - Click **"Confirm"**

   **Verify**:
   - Expense status changes to **"Pending"** (waiting for Admin)
   - Approval workflow shows Manager approval
   - Notification sent to expense creator
   - Notification sent to Admin for final approval

   **Approve Expense 2 (Catering)**:
   - Click **"Approve"** button
   - Click **"Confirm"**

   **Reject Expense 3 (Marketing)**:
   - Click **"Reject"** button (✗ icon)
   - Add comment: "Budget exceeded for this category"
   - Click **"Confirm"**

   **Verify**:
   - Expense 3 status changes to **"Rejected"**
   - Rejection reason is recorded
   - Notification sent to expense creator

---

### STEP 5: Admin Final Approval

**Login as Admin** (`admin@demo.com`)

1. Navigate to **"Expenses"** page
2. Filter by **"Pending"** status
3. You should see expenses approved by Manager (still pending final approval)

**Approve Expense 1 (Venue Deposit)**:
- Click **"Approve"** button
- Add comment: "Final approval - proceed with payment"
- Click **"Confirm"**

**Verify**:
- Expense status changes to **"Approved"**
- Budget item "Venue" actualCost updates to $15,000
- Event budget tracking updates:
  - Total Approved Expenses: $15,000
  - Remaining Budget: $115,000
- Notification sent to expense creator
- Budget category shows:
  - Planned: $40,000
  - Used: $15,000
  - Remaining: $25,000

**Approve Expense 2 (Catering)**:
- Click **"Approve"** button
- Click **"Confirm"**

**Verify**:
- Expense status changes to **"Approved"**
- Budget item "Catering" actualCost updates to $8,500
- Total Approved Expenses: $23,500
- Remaining Budget: $106,500

---

### STEP 6: View Budget Tracking & Reports

**Login as Admin or Manager**

1. Navigate to the **Event Detail** page
2. Go to **"Budget"** tab
3. View **Budget Summary**:

   **Expected Display**:
   ```
   Total Budget: $130,000
   Total Approved Expenses: $23,500
   Remaining Budget: $106,500
   
   Category Breakdown:
   - Venue: $40,000 planned / $15,000 used / $25,000 remaining (37.5% utilized)
   - Catering: $60,000 planned / $8,500 used / $51,500 remaining (14.2% utilized)
   - Marketing: $10,000 planned / $0 used / $10,000 remaining (0% utilized)
   - Decoration: $20,000 planned / $0 used / $20,000 remaining (0% utilized)
   ```

4. Check **Category Utilization**:
   - Each category shows percentage used
   - Visual indicators for over-budget scenarios

5. View **Expense History**:
   - All expenses listed with approval status
   - Approval workflow shows Manager → Admin chain
   - Rejected expenses show rejection reason

---

### STEP 7: Test Edge Cases & Validations

#### Test 1: Budget Validation
**As Manager**:
- Try to create budget items totaling more than event budget
- **Expected**: Error message preventing creation

#### Test 2: Expense Category Validation
**As Finance**:
- Create expense with category that doesn't match budget item
- **Expected**: System validates category consistency

#### Test 3: Approval Workflow
**As Manager**:
- Try to approve expense that's already approved
- **Expected**: Error message

**As Admin**:
- Try to approve expense without Manager approval
- **Expected**: Error: "Manager must approve before Admin can give final approval"

#### Test 4: Role Permissions
**As Viewer**:
- Try to create expense
- **Expected**: Access denied (Viewer can only view)

**As Finance**:
- Try to approve expense
- **Expected**: Access denied (only Manager/Admin can approve)

#### Test 5: Over-Budget Alert
**As Manager**:
- Create expense that exceeds category remaining budget
- Approve it (should still work but generate warning)
- **Expected**: System allows but logs warning

---

## API Testing (Using Postman/curl)

### 1. Create Expense
```bash
POST http://localhost:3333/api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "<event-id>",
  "category": "Venue",
  "title": "Conference Hall Deposit",
  "amount": 15000,
  "vendor": "Grand Convention Center",
  "description": "50% deposit"
}
```

### 2. Approve Expense (Manager)
```bash
POST http://localhost:3333/api/expenses/<expense-id>/approve
Authorization: Bearer <manager-token>
Content-Type: application/json

{
  "action": "approve",
  "comments": "Approved by manager"
}
```

### 3. Final Approval (Admin)
```bash
POST http://localhost:3333/api/expenses/<expense-id>/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "action": "approve",
  "comments": "Final approval"
}
```

### 4. Get Category Totals
```bash
GET http://localhost:3333/api/events/<event-id>/budget-items/category-totals
Authorization: Bearer <token>
```

### 5. Get Event Expenses
```bash
GET http://localhost:3333/api/events/<event-id>/expenses
Authorization: Bearer <token>
```

---

## Verification Checklist

After completing the workflow, verify:

- [ ] Admin can create events with budget
- [ ] Manager can be assigned to events
- [ ] Manager can create budget categories
- [ ] Budget validation prevents exceeding event budget
- [ ] Staff/Finance can create expenses
- [ ] Expenses are linked to categories
- [ ] Manager can approve expenses (first level)
- [ ] Admin can give final approval (second level)
- [ ] Approved expenses update budget actualCost
- [ ] Budget tracking shows category utilization
- [ ] Notifications are sent on approval/rejection
- [ ] Approval workflow history is recorded
- [ ] Rejected expenses can be viewed with reason
- [ ] Reports show accurate expense data

---

## Troubleshooting

### Issue: "Can only approve pending expenses"
**Solution**: Check expense status. Only expenses with "Pending" status can be approved.

### Issue: "Manager must approve before Admin"
**Solution**: Ensure Manager has approved first. Check approval workflow history.

### Issue: "Total budget items exceeds event budget"
**Solution**: Reduce budget item amounts or increase event budget.

### Issue: Expenses not updating budget
**Solution**: Ensure expense is fully approved (both Manager and Admin). Check expense status is "Approved".

### Issue: Notifications not appearing
**Solution**: Check notification service is running. Verify user has notifications enabled.

---

## Next Steps

After testing the basic workflow:

1. **Test with multiple events** - Create several events and manage expenses across them
2. **Test file uploads** - Upload receipts/bills for expenses
3. **Test reports** - Generate expense and budget reports
4. **Test notifications** - Verify all notification triggers work
5. **Test role permissions** - Verify each role can only perform allowed actions

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify database schema is up to date (`pnpm db:push`)
4. Verify Prisma client is generated (`pnpm db:generate`)
5. Check environment variables are set correctly


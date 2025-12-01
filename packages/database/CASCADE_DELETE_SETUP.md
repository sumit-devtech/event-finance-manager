# Cascade Delete Setup

## ✅ Safe Cascade Deletes Applied

We've added cascade deletes **only** for dependent/sub-records, **NOT** for transactional or audit data.

### Cascade Delete Relationships

1. **Event → EventAssignment** (EventTeamMembers)
   - When an Event is deleted, all EventAssignment records are automatically deleted
   - Safe: These are operational records, not audit data

2. **Event → BudgetItem** (BudgetCategory)
   - When an Event is deleted, all BudgetItem records are automatically deleted
   - Safe: Budget items are dependent on the event

3. **BudgetItem → Expense**
   - When a BudgetItem is deleted, all linked Expense records are automatically deleted
   - Safe: Expenses linked to a budget category should be removed with it

4. **Expense → File** (ExpenseAttachment)
   - When an Expense is deleted, all File records linked via `expenseId` are automatically deleted
   - Safe: Receipts/attachments are dependent on the expense

### ❌ NOT Cascaded (Preserved)

These records are **NOT** cascade deleted to preserve important data:

- **ActivityLog** - Audit trail (preserved)
- **Notification** - Transactional data (preserved)
- **Report** - Important reports (preserved)
- **SubscriptionHistory** - Audit data (preserved)
- **ROIMetrics** - Analytics data (preserved)
- **CRMSync** - Integration data (preserved)
- **Insight** - Analytics data (preserved)
- **AiBudgetSuggestion** - Historical suggestions (preserved)
- **StrategicGoal** - Strategic planning data (preserved)
- **EventStakeholder** - External participant data (preserved)
- **VendorEvent** - Vendor relationship data (preserved)

## Benefits

✅ **Event deletion now works** - No more foreign key constraint errors
✅ **Data integrity** - Dependent records are automatically cleaned up
✅ **Audit trail preserved** - Important historical data remains intact
✅ **No manual cleanup needed** - Database handles it automatically

## Migration

To apply these changes to your database:

```bash
cd packages/database
pnpm db:push
```

Or create a migration:

```bash
pnpm db:migrate
```

## What Happens Now

When you delete an Event:

1. ✅ EventAssignment records are automatically deleted
2. ✅ BudgetItem records are automatically deleted
3. ✅ Expenses linked to those BudgetItems are automatically deleted
4. ✅ Files (receipts) linked to those Expenses are automatically deleted
5. ✅ ActivityLog, Notifications, Reports, etc. remain intact (as they should)

## Code Changes

The `EventsService.remove()` method can now be simplified since cascade deletes handle the cleanup automatically. However, we're keeping it simple for now to avoid breaking changes.


# Database Indexing Strategy

This document outlines the comprehensive indexing strategy applied to the Prisma schema for optimal query performance across all modules.

## Index Categories

### 1. Foreign Key Indexes
All foreign key relationships are indexed to speed up JOIN operations and lookups.

### 2. Single Column Indexes
Fields frequently used in WHERE clauses, ORDER BY, and filtering operations.

### 3. Composite Indexes
Multi-column indexes for common query patterns that filter/sort by multiple fields.

## Index Summary by Model

### Organization
- `id` (Primary Key - automatically indexed)

### User
- `organizationId` - Filter users by organization
- `email` - Unique lookup and authentication
- `organizationId, isActive` - Composite: Active users per organization

### Subscription
- `organizationId, status` - Composite: Active subscriptions per organization

### SubscriptionHistory
- `subscriptionId` - History lookup by subscription
- `changedBy` - User-specific history
- `action` - Filter by action type
- `changedAt` - Order by change date
- `subscriptionId, changedAt` - Composite: Chronological history

### Event
- `organizationId` - Filter events by organization
- `organizationId, status` - Composite: Events by status per organization
- `createdBy` - Events created by user
- `organizationId, status, startDate` - Composite: Filtered and sorted events
- `startDate` - Date range queries
- `endDate` - Date range queries
- `createdAt` - Chronological ordering
- `status` - Filter by status
- `organizationId, startDate` - Composite: Events by date per organization
- `organizationId, createdAt` - Composite: Recent events per organization

### EventAssignment
- `userId` - User's event assignments
- `eventId` - Event's assigned users
- `eventId, role` - Composite: Users by role per event
- `userId, eventId` (Unique) - Prevent duplicate assignments

### EventStakeholder
- `eventId` - Stakeholders per event
- `email` - Lookup by email
- `eventId, email` - Composite: Email lookup per event

### Vendor
- `organizationId` - Vendors per organization
- `name` - Name search
- `email` - Email lookup
- `organizationId, name` - Composite: Name search per organization

### VendorEvent
- `vendorId` - Events per vendor
- `eventId` - Vendors per event
- `assignedAt` - Chronological ordering
- `vendorId, eventId` (Unique) - Prevent duplicate assignments

### StrategicGoal
- `eventId` - Goals per event
- `status` - Filter by status
- `priority` - Filter by priority
- `deadline` - Sort by deadline
- `eventId, status` - Composite: Goals by status per event
- `eventId, priority` - Composite: Goals by priority per event

### BudgetItem
- `eventId` - Budget items per event
- `category` - Filter by category
- `vendorId` - Items per vendor
- `eventId, category` - Composite: Category items per event
- `status` - Filter by status
- `assignedUserId` - Items assigned to user
- `strategicGoalId` - Items linked to goal
- `createdAt` - Chronological ordering
- `eventId, status` - Composite: Items by status per event
- `eventId, category, status` - Composite: Category items by status per event

### Expense
- `organizationId` - Expenses per organization
- `eventId, status` - Composite: Expenses by status per event
- `eventId, status, createdAt` - Composite: Filtered and sorted expenses
- `category` - Filter by category
- `budgetItemId` - Expenses linked to budget item
- `eventId, category` - Composite: Category expenses per event
- `createdBy` - Expenses created by user
- `createdAt` - Chronological ordering
- `vendorId` - Expenses per vendor
- `organizationId, status` - Composite: Expenses by status per organization
- `organizationId, eventId, status` - Composite: Multi-level filtering
- `eventId, createdAt` - Composite: Recent expenses per event

### ApprovalWorkflow
- `expenseId` - Workflow history per expense
- `approverId` - Approvals by user
- `action` - Filter by action (approved/rejected)
- `actionAt` - Chronological ordering
- `expenseId, actionAt` - Composite: Chronological workflow per expense
- `approverId, actionAt` - Composite: User's approval history

### Insight
- `eventId` - Insights per event
- `insightType` - Filter by insight type

### ROIMetrics
- `eventId` (Unique) - One-to-one with event

### CRMSync
- `eventId` (Unique) - One-to-one with event

### Report
- `eventId` - Reports per event
- `createdBy` - Reports created by user
- `reportType` - Filter by report type
- `createdAt` - Chronological ordering
- `eventId, reportType` - Composite: Reports by type per event
- `eventId, createdAt` - Composite: Recent reports per event

### File
- `eventId` - Files per event
- `budgetItemId` - Files per budget item
- `expenseId` - Receipt files per expense
- `reportId` - Files per report
- `uploadedAt` - Chronological ordering
- `mimeType` - Filter by file type
- `eventId, uploadedAt` - Composite: Recent files per event
- `expenseId, uploadedAt` - Composite: Recent receipts per expense

### Notification
- `organizationId` - Notifications per organization
- `userId` - User's notifications
- `read` - Filter unread notifications
- `organizationId, read` - Composite: Unread per organization
- `type` - Filter by notification type
- `createdAt` - Chronological ordering
- `userId, read` - Composite: User's unread notifications
- `userId, read, createdAt` - Composite: Unread notifications sorted
- `organizationId, read, createdAt` - Composite: Unread per organization sorted
- `userId, type` - Composite: Notifications by type per user

### ActivityLog
- `organizationId` - Logs per organization
- `userId` - User's activity logs
- `eventId` - Activity logs per event
- `createdAt` - Chronological ordering
- `action` - Filter by action type
- `organizationId, createdAt` - Composite: Recent logs per organization
- `organizationId, userId` - Composite: User logs per organization
- `organizationId, userId, createdAt` - Composite: User logs sorted
- `eventId, createdAt` - Composite: Event logs sorted
- `userId, createdAt` - Composite: User logs sorted
- `organizationId, eventId, createdAt` - Composite: Event logs per organization

### AiBudgetSuggestion
- `eventId` - Suggestions per event
- `accepted` - Filter accepted suggestions
- `category` - Filter by category
- `createdAt` - Chronological ordering
- `eventId, accepted` - Composite: Accepted suggestions per event
- `eventId, category` - Composite: Suggestions by category per event

## Query Performance Benefits

### Common Query Patterns Optimized

1. **Event Filtering**
   - Organization + Status + Date Range: `organizationId, status, startDate`
   - Recent Events: `organizationId, createdAt`

2. **Expense Management**
   - Event Expenses by Status: `eventId, status, createdAt`
   - Category Filtering: `eventId, category`
   - User Expenses: `createdBy`

3. **Budget Tracking**
   - Category Analysis: `eventId, category, status`
   - Assigned Items: `assignedUserId`

4. **Notifications**
   - Unread Notifications: `userId, read, createdAt`
   - Type Filtering: `userId, type`

5. **Activity Logging**
   - Recent Activity: `organizationId, createdAt`
   - User Activity: `userId, createdAt`
   - Event Activity: `eventId, createdAt`

6. **Approval Workflows**
   - Expense Approvals: `expenseId, actionAt`
   - User Approvals: `approverId, actionAt`

## Index Maintenance

- Indexes are automatically maintained by PostgreSQL
- Monitor index usage with `pg_stat_user_indexes`
- Consider periodic `VACUUM ANALYZE` for optimal performance
- Review index bloat with `pg_stat_user_tables`

## Migration Notes

When applying these indexes to an existing database:

1. **Non-blocking**: Most indexes can be created with `CREATE INDEX CONCURRENTLY`
2. **Size Impact**: Indexes increase storage requirements (typically 10-30% of table size)
3. **Write Performance**: More indexes slightly slow down INSERT/UPDATE operations
4. **Query Performance**: Significantly faster SELECT operations

## Best Practices Applied

✅ All foreign keys indexed
✅ Frequently filtered columns indexed
✅ Composite indexes for multi-column queries
✅ Date/time fields used in sorting indexed
✅ Status/enum fields used in filtering indexed
✅ Unique constraints automatically create indexes
✅ Composite indexes ordered by selectivity (most selective first)

## Future Considerations

- Monitor slow queries and add indexes as needed
- Consider partial indexes for filtered subsets (e.g., `WHERE status = 'Active'`)
- Evaluate covering indexes for frequently accessed columns
- Review index usage statistics quarterly


# Force Index Creation

Since Prisma says "already in sync" but we added many new indexes, let's verify and force creation if needed.

## Step 1: Verify Current Indexes

Run this SQL query in Neon dashboard SQL editor or Prisma Studio:

```sql
-- Count indexes per table
SELECT 
    tablename,
    COUNT(indexname) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected counts (approximate):**
- Event: ~9 indexes
- Expense: ~12 indexes  
- BudgetItem: ~10 indexes
- Notification: ~10 indexes
- ActivityLog: ~10 indexes

## Step 2: Force Prisma to Detect Changes

If indexes are missing, try:

```bash
cd packages/database

# Option 1: Reset and push (CAREFUL - only if you can recreate data)
# pnpm prisma migrate reset  # DON'T RUN THIS IF YOU HAVE IMPORTANT DATA

# Option 2: Mark migration as applied (if indexes already exist manually)
# pnpm prisma migrate resolve --applied [migration-name]

# Option 3: Force push with --accept-data-loss (CAREFUL)
# pnpm db:push --accept-data-loss  # Only if safe

# Option 4: Create migration manually
pnpm prisma migrate dev --create-only --name add_indexes
# Then review the migration file and apply it
```

## Step 3: Check What Prisma Sees

```bash
# See what Prisma thinks needs to be changed
pnpm prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script
```

This will show SQL for what Prisma thinks is different.

## Step 4: Manual Index Creation (If Needed)

If Prisma won't create them, you can create indexes manually via SQL:

```sql
-- Event indexes
CREATE INDEX IF NOT EXISTS "Event_startDate_idx" ON "Event"("startDate");
CREATE INDEX IF NOT EXISTS "Event_endDate_idx" ON "Event"("endDate");
CREATE INDEX IF NOT EXISTS "Event_createdAt_idx" ON "Event"("createdAt");
CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status");
CREATE INDEX IF NOT EXISTS "Event_organizationId_startDate_idx" ON "Event"("organizationId", "startDate");
CREATE INDEX IF NOT EXISTS "Event_organizationId_createdAt_idx" ON "Event"("organizationId", "createdAt");

-- Expense indexes  
CREATE INDEX IF NOT EXISTS "Expense_createdBy_idx" ON "Expense"("createdBy");
CREATE INDEX IF NOT EXISTS "Expense_createdAt_idx" ON "Expense"("createdAt");
CREATE INDEX IF NOT EXISTS "Expense_vendorId_idx" ON "Expense"("vendorId");
CREATE INDEX IF NOT EXISTS "Expense_organizationId_status_idx" ON "Expense"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "Expense_organizationId_eventId_status_idx" ON "Expense"("organizationId", "eventId", "status");
CREATE INDEX IF NOT EXISTS "Expense_eventId_createdAt_idx" ON "Expense"("eventId", "createdAt");

-- And more... (see INDEXING_STRATEGY.md for full list)
```

## Recommended: Check First

Before forcing anything, verify what's actually in your database using the SQL queries in `verify_indexes.sql`.


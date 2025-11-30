# Safe Migration Guide: Adding Indexes

## ✅ Data Safety Guarantee

**Adding indexes does NOT delete or modify any existing data.** Indexes are separate database structures that only improve query performance. Your data remains completely intact.

## What Changed?

We only added `@@index()` directives to the Prisma schema. This means:
- ✅ No fields were removed
- ✅ No models were deleted
- ✅ No data types were changed
- ✅ Only new indexes were added

## Safe Migration Options

### Option 1: Create Migration (Recommended for Production)

This creates a migration file you can review before applying:

```bash
cd packages/database
pnpm db:migrate
```

**What happens:**
1. Prisma creates a migration file in `prisma/migrations/`
2. You can review the SQL before applying
3. Migration is applied to your database
4. All data remains intact

**Review the migration file:**
```bash
# Check the latest migration
ls -la prisma/migrations/
cat prisma/migrations/[latest-migration]/migration.sql
```

You'll see SQL like:
```sql
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");
CREATE INDEX "Event_organizationId_status_startDate_idx" ON "Event"("organizationId", "status", "startDate");
-- etc.
```

### Option 2: Direct Push (Faster, but less reviewable)

This directly applies changes without creating a migration file:

```bash
cd packages/database
pnpm db:push
```

**What happens:**
1. Prisma compares schema to database
2. Creates indexes directly
3. No migration file is created
4. All data remains intact

**Use this when:**
- You're in development
- You want quick changes
- You don't need migration history

## Verification Steps

After applying indexes, verify your data is intact:

### 1. Check Data Counts
```bash
# Using Prisma Studio
pnpm db:studio
```

Or using SQL:
```sql
SELECT COUNT(*) FROM "Event";
SELECT COUNT(*) FROM "Expense";
SELECT COUNT(*) FROM "User";
-- etc. - all counts should match your expectations
```

### 2. Verify Indexes Were Created

```sql
-- Check indexes on Event table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'Event';

-- Check all indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 3. Test Query Performance

Try a query that should benefit from indexes:

```typescript
// This should be faster now with the index
const events = await prisma.event.findMany({
  where: {
    organizationId: 'your-org-id',
    status: 'Active',
  },
  orderBy: {
    startDate: 'asc',
  },
});
```

## What If Something Goes Wrong?

### Rollback Migration

If you used `db:migrate`, you can rollback:

```bash
# Rollback last migration
pnpm prisma migrate resolve --rolled-back [migration-name]
```

### Remove Indexes Manually

If needed, you can remove indexes manually via SQL:

```sql
-- Example: Remove an index
DROP INDEX IF EXISTS "Event_startDate_idx";
```

**Note:** Removing indexes won't affect your data, only query performance.

## Production Best Practices

1. **Backup First** (always recommended):
   ```bash
   pg_dump your_database > backup_before_indexes.sql
   ```

2. **Test in Development First**:
   - Apply indexes to dev/staging database
   - Verify everything works
   - Then apply to production

3. **Monitor Performance**:
   - Check query performance after indexes
   - Monitor database size (indexes use storage)
   - Review slow query logs

4. **Use Migration Files**:
   - Always use `db:migrate` in production
   - Review migration SQL before applying
   - Keep migration history for rollback

## Expected Behavior

After applying indexes:

✅ **Data**: All your data remains exactly as it was
✅ **Queries**: Should be faster, especially filtered/sorted queries
✅ **Storage**: Database size will increase slightly (indexes use space)
✅ **Writes**: INSERT/UPDATE might be slightly slower (negligible)
✅ **Reads**: SELECT queries will be significantly faster

## Index Creation Time

Index creation time depends on:
- Table size (more rows = longer)
- Database load
- Index complexity

**Typical times:**
- Small tables (< 10K rows): < 1 second
- Medium tables (10K-100K rows): 1-10 seconds
- Large tables (> 100K rows): 10-60 seconds

**Note:** PostgreSQL creates indexes with `CREATE INDEX CONCURRENTLY` when possible, which doesn't lock tables.

## Summary

- ✅ **No data loss** - indexes don't touch your data
- ✅ **Safe to apply** - only performance improvements
- ✅ **Reversible** - can remove indexes if needed
- ✅ **Recommended** - use `db:migrate` for production

Your data is completely safe! 🛡️


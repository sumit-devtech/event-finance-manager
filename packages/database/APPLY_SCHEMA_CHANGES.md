# How to Apply Schema Changes (Indexes) to Your Database

## Quick Guide

You have two options to apply the new indexes to your database:

### Option 1: Create Migration (Recommended for Production)

This creates a migration file you can review and track:

```bash
cd packages/database
pnpm db:migrate
```

**What happens:**
1. Prisma will prompt you to name the migration (e.g., "add_indexes")
2. Creates a migration file in `prisma/migrations/`
3. Applies the migration to your database
4. All indexes are created

**If you get a timeout error:**
- Try using the direct connection URL (not pooler) from Neon dashboard
- Or use Option 2 below

### Option 2: Direct Push (Faster, No Migration History)

This directly applies changes without creating a migration file:

```bash
cd packages/database
pnpm db:push
```

**What happens:**
1. Prisma compares your schema to the database
2. Creates all missing indexes directly
3. No migration file is created
4. Faster, but no history tracking

## Step-by-Step Instructions

### Step 1: Navigate to Database Package

```bash
cd packages/database
```

### Step 2: Verify Your Environment Variable

Make sure your `.env` file has `DATABASE_URL` set:

```bash
# Check if DATABASE_URL is set
cat .env | grep DATABASE_URL
```

Your `.env` should contain:
```
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```

### Step 3: Choose Your Method

**For Production/Staging (with migration history):**
```bash
pnpm db:migrate
```

**For Quick Development (no migration history):**
```bash
pnpm db:push
```

### Step 4: Verify Indexes Were Created

After applying, verify the indexes:

**Using Prisma Studio:**
```bash
pnpm db:studio
```

**Or using SQL:**
```sql
-- Check indexes on Event table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'Event'
ORDER BY indexname;

-- Check all indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Troubleshooting

### Error: "Timed out trying to acquire a postgres advisory lock"

**Solution 1: Use Direct Connection (Not Pooler)**
- In Neon dashboard, get the **direct connection** URL (not pooler)
- Update your `DATABASE_URL` in `.env`
- Try again

**Solution 2: Wait and Retry**
- Another process might be using the database
- Wait 30 seconds and try again

**Solution 3: Use db:push Instead**
```bash
pnpm db:push
```
This doesn't require advisory locks.

### Error: "Connection refused" or "Cannot connect"

**Check:**
1. Your `DATABASE_URL` is correct
2. Your Neon database is running (check Neon dashboard)
3. Connection string includes SSL: `?sslmode=require`
4. No firewall blocking the connection

### Error: "Relation already exists"

This means some indexes already exist. This is fine - Prisma will skip creating duplicates.

## What Gets Created

The migration will create indexes on:

- **Event**: 9 indexes (startDate, endDate, createdAt, status, composites)
- **Expense**: 12 indexes (createdBy, vendorId, createdAt, composites)
- **BudgetItem**: 10 indexes (createdAt, status, composites)
- **ApprovalWorkflow**: 6 indexes (action, actionAt, composites)
- **Notification**: 10 indexes (type, createdAt, composites)
- **ActivityLog**: 10 indexes (action, createdAt, composites)
- **And more** on other tables

## Expected Output

**Successful migration:**
```
✔ Generated Prisma Client
✔ Applied migration `20241201_add_indexes` to database `neondb`
```

**Successful push:**
```
✔ Generated Prisma Client
✔ Pushed schema to database
```

## After Applying

1. **Test your application** - everything should work the same
2. **Monitor performance** - queries should be faster
3. **Check database size** - indexes use some storage space

## Important Notes

✅ **No data loss** - indexes don't modify your data
✅ **Reversible** - you can drop indexes if needed
✅ **Safe** - can be applied to production databases
✅ **Performance** - queries will be significantly faster

## Need Help?

If you encounter issues:
1. Check your `DATABASE_URL` is correct
2. Verify your Neon database is accessible
3. Try `db:push` instead of `db:migrate`
4. Check Neon dashboard for connection limits


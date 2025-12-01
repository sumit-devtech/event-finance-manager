# Quick Start Guide

## 🚀 How to Run the Application

### Step 1: Apply Database Changes (if needed)

```bash
cd packages/database
pnpm db:push
```

**Status**: ✅ Already applied - database is in sync

### Step 2: Start Backend

```bash
cd apps/backend
pnpm dev
```

**Backend runs on**: `http://localhost:3333/api`

**Note**: If backend is already running, **restart it** to pick up the new Prisma client with cascade deletes.

### Step 3: Start Frontend (in a new terminal)

```bash
cd apps/frontend
pnpm dev
```

**Frontend runs on**: `http://localhost:5173`

### Step 4: Login

1. Open browser: `http://localhost:5173`
2. Login with:
   - **Email**: `admin@test.com`
   - **Password**: `password123`

## ✅ What's Working

- ✅ Backend API (54 endpoints)
- ✅ Database with optimized indexes
- ✅ Cascade deletes for event deletion
- ✅ Complete event budget workflow
- ✅ Expense tracking and approval
- ✅ Real-time budget tracking

## 🧪 Test Event Deletion

After logging in, try deleting an event. It should now work without errors because:

- ✅ EventAssignment → automatically deleted
- ✅ EventStakeholder → automatically deleted  
- ✅ BudgetItem → automatically deleted
- ✅ Expense → automatically deleted
- ✅ File (receipts) → automatically deleted
- ✅ ActivityLog, Notifications, Reports → preserved (as they should be)

## 📝 Quick Commands

```bash
# Build everything
turbo build

# Start backend
cd apps/backend && pnpm dev

# Start frontend
cd apps/frontend && pnpm dev

# Database operations
cd packages/database
pnpm db:push      # Apply schema changes
pnpm db:studio    # Open Prisma Studio
pnpm db:generate  # Regenerate Prisma client
```

## 🎯 Next Steps

1. **Test the complete workflow** (see `TESTING_GUIDE.md`)
2. **Create events** with budgets
3. **Add budget categories**
4. **Submit expenses**
5. **Test approval workflow**
6. **Try deleting an event** - should work now! ✅


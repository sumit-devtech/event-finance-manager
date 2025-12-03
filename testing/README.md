# Testing Documentation

Welcome to the testing documentation folder! This folder contains all testing guides and resources for the Event Finance Manager application.

## 📚 Available Documents

### 1. [COMPREHENSIVE_TESTING_GUIDE.md](./COMPREHENSIVE_TESTING_GUIDE.md)
**Complete step-by-step testing guide**

- ✅ 13 comprehensive testing phases
- ✅ Detailed instructions for each test scenario
- ✅ Database tables affected for each action
- ✅ Role-based permission testing
- ✅ SQL verification queries
- ✅ Troubleshooting section
- ✅ Complete workflow integration tests

**Use this when:**
- You want detailed step-by-step instructions
- You're doing a complete system test
- You need to understand which tables are affected
- You're testing role-based permissions

---

### 2. [QUICK_TEST_REFERENCE.md](./QUICK_TEST_REFERENCE.md)
**Quick reference guide for fast testing**

- ⚡ Quick start testing order
- 📊 Database tables reference
- 👥 Role permissions summary
- 🔄 Complete workflow sequence
- 🧪 Quick SQL verification queries
- 🐛 Common issues & fixes
- 📝 Test data templates

**Use this when:**
- You need a quick lookup during testing
- You want to see the testing order at a glance
- You need SQL queries quickly
- You're troubleshooting common issues

---

## 🚀 Quick Start

### First Time Testing?

1. **Start here:** Read [QUICK_TEST_REFERENCE.md](./QUICK_TEST_REFERENCE.md) for the overview
2. **Then follow:** [COMPREHENSIVE_TESTING_GUIDE.md](./COMPREHENSIVE_TESTING_GUIDE.md) for detailed steps
3. **Use the checklist:** Follow the testing checklist in the comprehensive guide

### Quick Testing Order

1. Register Admin user → Verify Email → Login
2. Create Event (Admin/EventManager)
3. Assign Users to Event (Admin)
4. Create Vendors (Admin/EventManager/Finance)
5. Create Budget Items (Admin/EventManager/Finance)
6. Create Expenses (Admin/EventManager/Finance)
7. Approve Expenses (Admin/EventManager)
8. View Reports (Admin/EventManager/Finance)

---

## 📋 Testing Phases Overview

| Phase | Description | Key Tables |
|-------|-------------|------------|
| **Phase 1** | User Registration & Authentication | Organization, User, Subscription |
| **Phase 2** | Event Management | Event, EventAssignment, EventStakeholder |
| **Phase 3** | Vendor Management | Vendor, VendorEvent |
| **Phase 4** | Budget Item Management | BudgetItem |
| **Phase 5** | Strategic Goals | StrategicGoal |
| **Phase 6** | Expense Management & Approval | Expense, ApprovalWorkflow |
| **Phase 7** | Reports & Analytics | Report, ROIMetrics |
| **Phase 8** | Notifications | Notification |
| **Phase 9** | File Management | File |
| **Phase 10** | User Management (Admin) | User, EventAssignment |
| **Phase 11** | Subscription Management | Subscription, SubscriptionHistory |
| **Phase 12** | Activity Logging | ActivityLog |
| **Phase 13** | Complete Workflow Integration | All tables |

---

## 👥 Role-Based Testing

The testing guides cover all four user roles:

- **Admin** - Full access to all features
- **EventManager** - Can create/manage events, approve expenses
- **Finance** - Can manage budgets and expenses (but cannot approve)
- **Viewer** - Read-only access

Each test scenario includes role-specific permission testing.

---

## 🧪 SQL Verification Queries

Both guides include SQL queries to verify:
- User registration data
- Event data and relationships
- Budget vs actual costs
- Expense approval status
- Complete data counts

---

## 🐛 Troubleshooting

Common issues and solutions are covered in both guides:
- Email verification problems
- Event visibility issues
- Expense approval failures
- Budget linking problems
- File upload issues

---

## 📝 Test Data Templates

Use these sample data templates for consistent testing:

### Users
- `admin@test.com` - Admin
- `eventmanager@test.com` - EventManager
- `finance@test.com` - Finance
- `viewer@test.com` - Viewer

### Sample Event
- Name: `Tech Conference 2024`
- Budget: `$50,000`
- Status: `Planning` → `Active` → `Completed`

---

## 📖 Related Documentation

For additional context, see:
- [PERMISSIONS_MATRIX.md](../PERMISSIONS_MATRIX.md) - Complete permissions reference
- [SIGNUP_WORKFLOW.md](../docs/SIGNUP_WORKFLOW.md) - User registration workflow
- [ROUTES_SUMMARY.md](../apps/backend/ROUTES_SUMMARY.md) - API routes reference

---

## ✅ Testing Checklist

Before starting, ensure:
- [ ] Database is clean
- [ ] Backend server running (`cd apps/backend && npm run start:dev`)
- [ ] Frontend server running (`cd apps/frontend && npm run dev`)
- [ ] SMTP configured (or manual verification ready)

---

## 📞 Need Help?

If you encounter issues during testing:
1. Check the troubleshooting section in the comprehensive guide
2. Verify your database state using the SQL queries
3. Check role permissions in PERMISSIONS_MATRIX.md
4. Review the workflow diagrams in the docs folder

---

**Last Updated:** 2024-12-15  
**Version:** 1.0


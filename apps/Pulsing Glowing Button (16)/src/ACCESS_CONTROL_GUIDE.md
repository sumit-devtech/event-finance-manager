# 🔐 EventBudget Pro - Access Control System

## Overview

EventBudget Pro implements a **comprehensive 4-tier access control system** that combines subscription tiers, role-based permissions, organization-level isolation, and feature-level restrictions.

---

## 🎯 The 4 Tiers of Access Control

### **Tier 1: Subscription-Based Access** 💳

Controls which advanced features users can access based on their subscription plan.

| Subscription | Monthly Cost | Features Unlocked |
|-------------|--------------|-------------------|
| **Free** | $0 | • 1 event creation<br/>• Basic budgets & expenses<br/>• ROI Analytics (view only)<br/>• Notifications<br/>• Overview dashboard |
| **Pro** | $49/mo | **Everything in Free, plus:**<br/>• Unlimited events<br/>• File uploads & attachments<br/>• Activity logging & audit trails<br/>• Multi-user assignments<br/>• Approval workflows<br/>• Report generation (PDF/Excel/CSV) |
| **Enterprise** | Custom | **Everything in Pro, plus:**<br/>• AI-powered budget suggestions<br/>• Stakeholder management<br/>• Priority support<br/>• Dedicated account manager<br/>• Custom integrations & API access |
| **Demo** | N/A | Full access to all features (read-only, no saves) |

---

### **Tier 2: Role-Based Access Control (RBAC)** 👥

Controls what actions users can perform within their organization.

#### 4 Role Types

##### 🔴 **Admin** - Full Control
**Who:** Organization owner, IT administrators

**Permissions:**
- ✅ All permissions (*)
- ✅ Create, edit, delete events
- ✅ Manage budgets and expenses
- ✅ Approve/reject expenses
- ✅ Manage organization users
- ✅ Assign roles to users
- ✅ Access all advanced features
- ✅ Generate reports
- ✅ View activity logs

**Use Case:** Organization owners who need complete control over all aspects of the system.

---

##### 🔵 **EventManager** - Event Operations
**Who:** Event planners, project managers

**Permissions:**
- ✅ Create, edit, delete events
- ✅ Create and modify budgets
- ✅ Submit and approve expenses
- ✅ Assign team members to events
- ✅ Upload files and documents
- ✅ Generate reports for their events
- ✅ Access ROI analytics
- ✅ Manage stakeholders (Enterprise plan)
- ✅ Use AI budget suggestions (Enterprise plan)
- ❌ Cannot manage organization users
- ❌ Cannot change user roles

**Use Case:** Event managers who run events from planning to execution.

---

##### 🟢 **Finance** - Financial Oversight
**Who:** Accounting team, finance managers, auditors

**Permissions:**
- ✅ View all events and budgets
- ✅ Approve/reject expenses
- ✅ Generate financial reports
- ✅ View activity logs
- ✅ Access ROI analytics
- ✅ View approval workflows
- ❌ Cannot create or edit events
- ❌ Cannot delete budgets
- ❌ Cannot assign team members

**Use Case:** Finance team members who need to review and approve expenses but not manage events.

---

##### ⚪ **Viewer** - Read-Only Access
**Who:** Stakeholders, executives, observers

**Permissions:**
- ✅ View events, budgets, expenses
- ✅ View ROI analytics (read-only)
- ✅ Receive notifications
- ❌ Cannot create, edit, or delete anything
- ❌ Cannot approve expenses
- ❌ Cannot upload files
- ❌ Cannot generate reports

**Use Case:** Stakeholders who need visibility but should not modify data.

---

### **Tier 3: Organization-Level Isolation** 🏢

Controls data access at the organization level (multi-tenancy).

#### How It Works

```
Organization A (Acme Corp)
├── Users: John (Admin), Sarah (EventManager), Mike (Finance)
├── Events: Annual Conference 2024, Product Launch
├── Budgets: $100,000 total
└── Data: Completely isolated from other organizations

Organization B (TechCon Inc)  
├── Users: Jane (Admin), Bob (Viewer)
├── Events: Tech Summit 2025
├── Budgets: $50,000 total
└── Data: Completely isolated from Organization A
```

#### Key Points

- ✅ Users belong to **one organization only**
- ✅ Cannot view other organizations' data
- ✅ Subscriptions are **per organization**, not per user
- ✅ Each organization has its own user roster
- ✅ Complete data isolation for security and compliance

#### Data Scope Examples

**Scenario 1: Admin at Acme Corp**
```
Can Access:
✅ All events created by Acme Corp users
✅ All budgets for Acme Corp events
✅ All expenses for Acme Corp events
✅ All Acme Corp users and their assignments

Cannot Access:
❌ TechCon Inc's events
❌ Any data from other organizations
```

**Scenario 2: Viewer at TechCon Inc**
```
Can Access:
✅ View TechCon Inc events (read-only)
✅ View TechCon Inc budgets (read-only)
✅ View TechCon Inc expenses (read-only)

Cannot Access:
❌ Acme Corp's data
❌ Create, edit, or delete anything
❌ Approve expenses
```

---

### **Tier 4: Feature-Level Permissions** 🎯

Controls specific actions within each feature based on RBAC.

#### Permission Matrix

| Feature | Admin | EventManager | Finance | Viewer |
|---------|-------|--------------|---------|--------|
| **Events** |
| • View | ✅ | ✅ | ✅ | ✅ |
| • Create | ✅ | ✅ | ❌ | ❌ |
| • Edit | ✅ | ✅ | ❌ | ❌ |
| • Delete | ✅ | ✅ | ❌ | ❌ |
| **Budgets** |
| • View | ✅ | ✅ | ✅ | ✅ |
| • Create | ✅ | ✅ | ❌ | ❌ |
| • Edit | ✅ | ✅ | ❌ | ❌ |
| • Approve | ✅ | ✅ | ✅ | ❌ |
| **Expenses** |
| • View | ✅ | ✅ | ✅ | ✅ |
| • Submit | ✅ | ✅ | ✅ | ❌ |
| • Approve | ✅ | ✅ | ✅ | ❌ |
| • Reject | ✅ | ✅ | ✅ | ❌ |
| **Files** |
| • Upload | ✅ | ✅ | ✅ | ❌ |
| • Download | ✅ | ✅ | ✅ | ✅ |
| • Delete | ✅ | ✅ | ❌ | ❌ |
| **Users** |
| • View | ✅ | ✅ | ✅ | ✅ |
| • Add | ✅ | ❌ | ❌ | ❌ |
| • Edit Roles | ✅ | ❌ | ❌ | ❌ |
| • Remove | ✅ | ❌ | ❌ | ❌ |
| **Reports** |
| • Generate | ✅ | ✅ | ✅ | ❌ |
| • Download | ✅ | ✅ | ✅ | ❌ |
| **Activity Log** |
| • View | ✅ | ✅ | ✅ | ❌ |
| **ROI Analytics** |
| • View | ✅ | ✅ | ✅ | ✅ |

---

## 🎨 Advanced Features Access Matrix

This table shows which **subscription tier** and **role** are required to access each advanced feature:

| Feature | Free | Pro | Enterprise | Admin | EventMgr | Finance | Viewer |
|---------|------|-----|------------|-------|----------|---------|--------|
| **Overview** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **RBAC Management** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **File Upload** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Activity Log** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **ROI Analytics** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Multi-User Assignment** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Stakeholders** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Approval Workflow** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **AI Suggestions** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Report Generator** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Legend:
- ✅ = **Full Access** - Can view and use the feature
- ❌ = **No Access** - Feature hidden or locked with upgrade prompt

---

## 🔄 How the Access Control Layers Work Together

### Example: Expense Approval Flow

```
1. USER AUTHENTICATION
   ↓
   User: Sarah
   Organization: Acme Corp (ID: org-123)
   Role: EventManager
   Subscription: Pro

2. ORGANIZATION CHECK (Tier 3)
   ↓
   ✅ Sarah belongs to "Acme Corp"
   ✅ Can only access Acme Corp's data
   ❌ Cannot see TechCon Inc's data

3. SUBSCRIPTION CHECK (Tier 1)
   ↓
   Feature: Approval Workflow
   Required: Pro or Enterprise
   ✅ Sarah's org has Pro subscription
   → Feature unlocked

4. ROLE CHECK (Tier 2)
   ↓
   Action: Approve Expense
   Sarah's Role: EventManager
   ✅ EventManager can approve expenses
   → Action allowed

5. FEATURE PERMISSION CHECK (Tier 4)
   ↓
   Permission: "expense:approve"
   EventManager permissions: ['event:create', 'event:edit', 'expense:approve', ...]
   ✅ Permission exists
   → Display "Approve" button

6. ACTION EXECUTED
   ↓
   ✅ Sarah approves $2,500 catering expense
   ✅ Activity logged: "Sarah (EventManager) approved expense EXP-001"
   ✅ Notification sent to Finance team
```

### Example: Blocked Access

```
1. USER AUTHENTICATION
   ↓
   User: Mike
   Organization: Acme Corp
   Role: Viewer
   Subscription: Free

2. SUBSCRIPTION CHECK (Tier 1)
   ↓
   Feature: AI Budget Suggestions
   Required: Enterprise
   ❌ Acme Corp has Free subscription
   → Show upgrade prompt

3. ROLE CHECK (Tier 2)
   ↓
   Feature: AI Budget Suggestions
   Required Role: Admin or EventManager
   Mike's Role: Viewer
   ❌ Viewer cannot access
   → Feature not shown in sidebar

4. RESULT
   ↓
   ❌ Mike cannot see AI Budget Suggestions feature
   💡 Prompt: "Upgrade to Enterprise to unlock"
```

---

## 🚀 Implementation Details

### Code Structure

#### 1. Subscription Check
```tsx
const canAccessFeature = (tier: 'free' | 'pro' | 'enterprise') => {
  if (isDemo) return true; // Demo users see everything
  if (tier === 'free') return true;
  if (tier === 'pro') return subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
  if (tier === 'enterprise') return subscriptionTier === 'enterprise';
  return false;
};
```

#### 2. Role-Based Filtering
```tsx
const sections = allSections.filter(section => 
  section.roles.includes(userRole)
);
```

#### 3. RBAC Permission Check
```tsx
const hasPermission = (permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes('*') || permissions.includes(permission);
};
```

#### 4. Organization Isolation
```tsx
// All queries filter by organization ID
const events = await getEvents({ organizationId: user.organizationId });
```

---

## 🎯 Benefits of This System

### **Security** 🔒
- ✅ Multi-layered defense (4 tiers)
- ✅ Principle of least privilege
- ✅ Complete data isolation between organizations
- ✅ Role-based action control

### **Flexibility** 🎨
- ✅ Granular control at multiple levels
- ✅ Easy to add new roles or tiers
- ✅ Customizable per organization needs
- ✅ Demo mode for testing

### **User Experience** 😊
- ✅ Clear upgrade prompts for locked features
- ✅ Role-appropriate feature visibility
- ✅ No confusion about what they can/can't do
- ✅ Seamless experience within permission boundaries

### **Business Model** 💰
- ✅ Clear value proposition per tier
- ✅ Upsell opportunities (Free → Pro → Enterprise)
- ✅ Feature-based monetization
- ✅ Scalable pricing structure

---

## 📊 Feature Distribution by Tier

### **Free Tier** (4 features)
- Overview Dashboard
- Notifications (view only)
- ROI Analytics (view only)
- Basic event/budget management

**Target Users:** Solo event planners, small one-time events

---

### **Pro Tier** ($49/mo) (7 additional features)
- File Upload Manager
- Activity Log
- Multi-User Assignment
- Approval Workflow History
- Report Generator
- Unlimited events
- Team collaboration

**Target Users:** Event management companies, corporate event teams (5-50 users)

---

### **Enterprise Tier** (Custom) (2 additional features)
- AI Budget Suggestions
- Stakeholder Management
- Priority support
- Custom integrations
- Dedicated account manager
- API access

**Target Users:** Large corporations, event management agencies (50+ users)

---

## 🔧 Configuration

### Default Roles per User Type

```tsx
// Organization Setup
Admin creates organization → Gets Admin role automatically

// User Invitation
Admin invites user → Can assign role:
- Admin (for trusted managers)
- EventManager (for event planners)
- Finance (for accounting team)
- Viewer (for stakeholders/observers)
```

### Changing User Roles

```tsx
// Only Admins can change roles
<ProtectedAction permission="user:manage">
  <button onClick={() => changeRole(userId, 'Finance')}>
    Change Role
  </button>
</ProtectedAction>
```

---

## 🎓 Best Practices

### For Admins
1. ✅ Assign minimum necessary role to each user
2. ✅ Use Viewer role for stakeholders who just need visibility
3. ✅ Regularly review user roles and remove inactive users
4. ✅ Use Finance role for approval workflows
5. ✅ Monitor activity logs for security audits

### For EventManagers
1. ✅ Assign team members to specific events
2. ✅ Use role-appropriate permissions for assignments
3. ✅ Upload all receipts and invoices for audit trail
4. ✅ Review approval workflows before submitting

### For Finance
1. ✅ Review activity logs before approving large expenses
2. ✅ Generate reports regularly for executive review
3. ✅ Monitor budget alerts to prevent overruns
4. ✅ Verify file attachments before approving expenses

---

## 🚦 Access Denied Scenarios

Users will see upgrade prompts or permission denied messages in these cases:

### Subscription-Based Denial
```
🔒 Feature Locked
This feature requires a Pro subscription.

[Upgrade to Pro] button
```

### Role-Based Denial
```
❌ Permission Denied
Your role (Viewer) does not have permission to perform this action.
Contact your organization admin for access.
```

### Organization Isolation
```
❌ Access Denied
This event belongs to another organization.
```

---

## 📈 Future Enhancements

### Planned Features
- [ ] Custom roles (create your own role with specific permissions)
- [ ] Event-level permissions (assign different roles per event)
- [ ] Temporary access grants (time-limited permissions)
- [ ] Permission inheritance (child events inherit parent permissions)
- [ ] Audit log exports for compliance
- [ ] Two-factor authentication for Admin role
- [ ] IP whitelisting for Enterprise tier

---

## 🎉 Conclusion

EventBudget Pro's **4-tier access control system** provides:

1. ✅ **Subscription-based** feature gating for monetization
2. ✅ **Role-based** action control for security
3. ✅ **Organization-level** data isolation for multi-tenancy
4. ✅ **Feature-level** permission checks for granular control

This creates a **secure, scalable, and user-friendly** system that balances flexibility with control! 🚀

---

*Last Updated: November 28, 2024*
*Version: 1.0*

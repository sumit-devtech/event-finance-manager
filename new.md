# Event Finance Manager - Database Schema Documentation

## Entity Relationship Diagram

### Complete ER Diagram

erDiagram
    %% Multi-Tenancy Layer
    Organization ||--o{ User : "has"
    Organization ||--o{ Event : "has"
    Organization ||--o{ Vendor : "has"
    Organization ||--o{ Expense : "has"
    Organization ||--|| DashboardMetrics : "has"
    Organization ||--o{ Subscription : "has"
    Organization ||--o{ Notification : "has"
    Organization ||--o{ ActivityLog : "has"
    
    %% User Relationships
    User ||--o{ Event : "creates"
    User ||--o{ Expense : "creates"
    User ||--o{ EventAssignment : "assigned"
    User ||--o{ BudgetItem : "assigned"
    User ||--o{ ApprovalWorkflow : "approves"
    User ||--o{ Notification : "receives"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Report : "creates"
    User ||--o{ File : "uploads"
    User ||--o{ Note : "creates"
    User ||--o{ SubscriptionHistory : "changes"
    User ||--o{ Organization : "deletes"
    User ||--o{ User : "deletes"
    User ||--o{ Event : "deletes"
    User ||--o{ BudgetItem : "deletes"
    User ||--o{ Expense : "deletes"
    User ||--o{ Vendor : "deletes"
    User ||--o{ File : "deletes"
    User ||--o{ Note : "deletes"
    User ||--o{ Report : "deletes"
    User ||--o{ StrategicGoal : "deletes"
    User ||--o{ EventAssignment : "deletes"
    User ||--o{ EventStakeholder : "deletes"
    User ||--o{ VendorEvent : "deletes"
    User ||--o{ Insight : "deletes"
    User ||--o{ AiBudgetSuggestion : "deletes"
    User ||--o{ Subscription : "deletes"
    
    %% Event Relationships
    Event ||--o{ EventAssignment : "has"
    Event ||--o{ EventStakeholder : "has"
    Event ||--o{ BudgetItem : "has"
    Event ||--o{ Expense : "has"
    Event ||--o{ VendorEvent : "has"
    Event ||--o{ StrategicGoal : "has"
    Event ||--|| EventMetrics : "has"
    Event ||--|| ROIMetrics : "has"
    Event ||--|| CRMSync : "has"
    Event ||--o{ File : "has"
    Event ||--o{ Note : "has"
    Event ||--o{ Insight : "has"
    Event ||--o{ Report : "has"
    Event ||--o{ AiBudgetSuggestion : "has"
    Event ||--o{ ActivityLog : "has"
    
    %% Budget Relationships
    BudgetItem }o--|| Event : "belongs to"
    BudgetItem }o--o| Vendor : "uses"
    BudgetItem }o--o| User : "assigned to"
    BudgetItem }o--o| StrategicGoal : "linked to"
    BudgetItem ||--o{ Expense : "tracks"
    BudgetItem ||--o{ ApprovalWorkflow : "has"
    BudgetItem ||--o{ File : "has"
    
    %% Expense Relationships
    Expense }o--|| Event : "belongs to"
    Expense }o--o| BudgetItem : "linked to"
    Expense }o--o| Vendor : "uses"
    Expense }o--|| User : "created by"
    Expense ||--o{ ApprovalWorkflow : "has"
    Expense ||--o{ File : "has"
    
    %% Vendor Relationships
    Vendor ||--o{ VendorEvent : "assigned to"
    Vendor ||--o{ BudgetItem : "used in"
    Vendor ||--o{ Expense : "used in"
    Vendor ||--|| VendorMetrics : "has"
    
    %% Approval Workflow
    ApprovalWorkflow }o--o| Expense : "tracks"
    ApprovalWorkflow }o--o| BudgetItem : "tracks"
    ApprovalWorkflow }o--|| User : "by"
    
    %% Subscription
    Subscription ||--o{ SubscriptionHistory : "has"
    SubscriptionHistory }o--o| User : "changed by"
    
    %% File Relationships
    File }o--o| Event : "attached to"
    File }o--o| BudgetItem : "attached to"
    File }o--o| Expense : "attached to"
    File }o--o| Report : "attached to"
    File }o--|| User : "uploaded by"
    
    %% Report Relationships
    Report }o--|| Event : "for"
    Report }o--|| User : "created by"
    Report ||--o{ File : "has"
    
    %% Entity Definitions with Soft Delete Fields
    Organization {
        string id PK
        string name
        string baseCurrency
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }
    
    User {
        string id PK
        string organizationId FK
        string fullName
        string email UK
        enum role
        boolean isActive
        boolean emailVerified
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }
    
    Event {
        string id PK
        string organizationId FK
        string name
        string eventType
        enum status
        decimal budget
        string currency "PLAN Module"
        string businessUnit "PLAN Module"
        string eventObjective "PLAN Module"
        int internalAttendees "PLAN Module"
        int externalAttendees "PLAN Module"
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    
    BudgetItem {
        string id PK
        string eventId FK
        enum category
        string subcategory
        decimal estimatedCost
        decimal actualCost
        decimal allocatedAmount
        enum status
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }
    
    Expense {
        string id PK
        string organizationId FK
        string eventId FK
        string budgetItemId FK
        string vendorId FK
        string title
        float amount
        enum status
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    
    Vendor {
        string id PK
        string organizationId FK
        string name
        string email
        float rating
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
        datetime updatedAt
    }
    
    ApprovalWorkflow {
        string id PK
        string expenseId FK
        string budgetItemId FK
        string approverId FK
        string action
        string comments
        datetime actionAt
    }
    
    File {
        string id PK
        string eventId FK
        string budgetItemId FK
        string expenseId FK
        string filename
        string path
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime uploadedAt
    }
    
    Note {
        string id PK
        string eventId FK
        string content
        string_array tags
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
    }
    
    Report {
        string id PK
        string eventId FK
        string reportType
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
    }
    
    StrategicGoal {
        string id PK
        string eventId FK
        string title
        float targetValue
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
    }
    
    EventAssignment {
        string id PK
        string userId FK
        string eventId FK
        string role
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime assignedAt
    }
    
    EventStakeholder {
        string id PK
        string eventId FK
        string name
        string email
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
    }
    
    VendorEvent {
        string id PK
        string vendorId FK
        string eventId FK
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime assignedAt
    }
    
    Insight {
        string id PK
        string eventId FK
        string insightType
        json data
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
    }
    
    AiBudgetSuggestion {
        string id PK
        string eventId FK
        enum category
        decimal suggestedCost
        boolean accepted
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
    }
    
    Subscription {
        string id PK
        string organizationId FK
        string planName
        enum status
        datetime deletedAt "Soft Delete"
        string deletedBy FK "Soft Delete"
        datetime createdAt
    }
    
    DashboardMetrics {
        string id PK
        string organizationId FK UK
        decimal totalBudget
        decimal totalExpenses
        int pendingApprovals
        datetime lastComputedAt
    }
    
    EventMetrics {
        string id PK
        string eventId FK UK
        decimal totalBudget
        decimal totalSpent
        decimal variance
        boolean isOverBudget
        datetime lastComputedAt
    }
    
    VendorMetrics {
        string id PK
        string vendorId FK UK
        int totalContracts
        decimal totalSpent
        datetime lastComputedAt
    }---

## Database Tables Overview

### Core Tables

#### 1. Organization
**Purpose:** Multi-tenancy root table. Each organization is a separate tenant.

**Key Fields:**
- `id` (PK): Unique identifier
- `name`: Organization name
- `baseCurrency`: Default currency (default: USD)
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the organization

**Relationships:**
- Has many Users
- Has many Events
- Has many Vendors
- Has many Expenses
- Has one DashboardMetrics

---

#### 2. User
**Purpose:** System users with role-based access control.

**Key Fields:**
- `id` (PK): Unique identifier
- `email` (UK): Unique email address
- `role`: UserRole enum (Admin, EventManager, Finance, Viewer)
- `organizationId` (FK): Belongs to Organization
- `isActive`: Account status
- `emailVerified`: Email verification status
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted this user

**Relationships:**
- Belongs to Organization
- Creates Events
- Creates Expenses
- Assigned to Events (via EventAssignment)
- Assigned to BudgetItems
- Approves workflows
- Uploads Files
- Creates Notes and Reports

---

#### 3. Event
**Purpose:** Core event entity with PLAN module fields.

**Key Fields:**
- `id` (PK): Unique identifier
- `name`: Event name
- `eventType`: Virtual, In-Person, Hybrid, City-wide
- `status`: EventStatus enum (Planning, Active, Completed, Cancelled)
- `currency`: Event currency (default: USD)
- `budget`: Total budget amount
- `businessUnit`: Business unit or department
- `eventObjective`: Lead Generation, Customer Engagement, etc.
- `internalAttendees`: Internal attendee count
- `externalAttendees`: External attendee count
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the event

**Relationships:**
- Belongs to Organization
- Created by User
- Has many BudgetItems
- Has many Expenses
- Has many EventAssignments
- Has many EventStakeholders
- Has many VendorEvents
- Has one EventMetrics
- Has one ROIMetrics
- Has one CRMSync

---

#### 4. BudgetItem
**Purpose:** Budget line items for events.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `category`: BudgetItemCategory enum
- `subcategory`: Subcategory name
- `estimatedCost`: Estimated amount
- `actualCost`: Actual amount spent
- `allocatedAmount`: Allocated amount
- `status`: BudgetItemStatus enum (Pending, Approved, Rejected)
- `vendorId` (FK): Optional vendor link
- `assignedUserId` (FK): Assigned user
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the item

**Relationships:**
- Belongs to Event
- Links to Vendor (optional)
- Assigned to User (optional)
- Links to StrategicGoal (optional)
- Tracks Expenses
- Has ApprovalWorkflows
- Has Files

---

#### 5. Expense
**Purpose:** Actual expenses incurred for events.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `budgetItemId` (FK): Optional link to BudgetItem
- `vendorId` (FK): Optional vendor link
- `title`: Expense title
- `amount`: Expense amount
- `status`: ExpenseStatus enum (Pending, Approved, Rejected)
- `createdBy` (FK): User who created
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the expense

**Relationships:**
- Belongs to Event
- Links to BudgetItem (optional)
- Links to Vendor (optional)
- Created by User
- Has ApprovalWorkflows
- Has Files (receipts)

---

#### 6. Vendor
**Purpose:** Vendor/supplier management.

**Key Fields:**
- `id` (PK): Unique identifier
- `organizationId` (FK): Belongs to Organization
- `name`: Vendor name
- `email`: Contact email
- `serviceType`: Type of service
- `rating`: Vendor rating
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the vendor

**Relationships:**
- Belongs to Organization
- Used in BudgetItems
- Used in Expenses
- Assigned to Events (via VendorEvent)
- Has VendorMetrics

---

### Supporting Tables

#### 7. ApprovalWorkflow
**Purpose:** Tracks approval/rejection actions for expenses and budget items.

**Key Fields:**
- `id` (PK): Unique identifier
- `expenseId` (FK): Optional expense link
- `budgetItemId` (FK): Optional budget item link
- `approverId` (FK): User who approved/rejected
- `action`: "approved" or "rejected"
- `comments`: Approval comments
- `actionAt`: Timestamp of action

---

#### 8. File
**Purpose:** File storage for receipts, documents, attachments.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Optional event link
- `budgetItemId` (FK): Optional budget item link
- `expenseId` (FK): Optional expense link
- `reportId` (FK): Optional report link
- `filename`: File name
- `path`: Storage path
- `mimeType`: File MIME type
- `size`: File size in bytes
- `uploadedBy` (FK): User who uploaded
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the file

---

#### 9. EventAssignment
**Purpose:** Links users to events with roles.

**Key Fields:**
- `id` (PK): Unique identifier
- `userId` (FK): User assigned
- `eventId` (FK): Event assignment
- `role`: Assignment role (Manager, Lead, etc.)
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the assignment

---

#### 10. EventStakeholder
**Purpose:** External participants/stakeholders for events.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `name`: Stakeholder name
- `email`: Contact email
- `role`: Stakeholder role
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the stakeholder

---

#### 11. VendorEvent
**Purpose:** Links vendors to events.

**Key Fields:**
- `id` (PK): Unique identifier
- `vendorId` (FK): Vendor
- `eventId` (FK): Event
- `assignedAt`: Assignment timestamp
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the assignment

---

#### 12. StrategicGoal
**Purpose:** Strategic goals linked to events.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `title`: Goal title
- `targetValue`: Target value
- `currentValue`: Current progress
- `status`: Goal status
- `priority`: Goal priority
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the goal

---

#### 13. Note
**Purpose:** Notes/comments on events.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `content`: Note content
- `tags`: Array of tags
- `createdBy` (FK): User who created
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the note

---

#### 14. Report
**Purpose:** Generated reports for events.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `reportType`: Type of report
- `createdBy` (FK): User who created
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the report

---

#### 15. Subscription
**Purpose:** Organization subscription management.

**Key Fields:**
- `id` (PK): Unique identifier
- `organizationId` (FK): Belongs to Organization
- `planName`: Subscription plan name
- `billingCycle`: Monthly or Yearly
- `status`: SubscriptionStatus enum
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the subscription

---

#### 16. SubscriptionHistory
**Purpose:** History of subscription changes.

**Key Fields:**
- `id` (PK): Unique identifier
- `subscriptionId` (FK): Belongs to Subscription
- `action`: Change action (upgrade, downgrade, etc.)
- `changedBy` (FK): User who made the change
- `changedAt`: Change timestamp

---

### Analytics & Metrics Tables

#### 17. DashboardMetrics
**Purpose:** Pre-computed organization-level metrics.

**Key Fields:**
- `id` (PK): Unique identifier
- `organizationId` (FK, UK): One per organization
- `totalBudget`: Total budget across all events
- `totalExpenses`: Total expenses
- `pendingApprovals`: Count of pending approvals
- `overBudgetEvents`: Count of over-budget events
- `lastComputedAt`: Last computation timestamp

---

#### 18. EventMetrics
**Purpose:** Pre-computed event-level metrics.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK, UK): One per event
- `totalBudget`: Sum of budget items
- `totalSpent`: Sum of approved expenses
- `variance`: Budget variance
- `isOverBudget`: Over budget flag
- `totalsByCategory`: JSON breakdown by category
- `lastComputedAt`: Last computation timestamp

---

#### 19. VendorMetrics
**Purpose:** Pre-computed vendor-level metrics.

**Key Fields:**
- `id` (PK): Unique identifier
- `vendorId` (FK, UK): One per vendor
- `totalContracts`: Count of vendor events
- `totalSpent`: Total amount spent with vendor
- `lastContractDate`: Last contract date
- `lastComputedAt`: Last computation timestamp

---

### Integration Tables

#### 20. Insight
**Purpose:** AI-generated insights and recommendations.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `insightType`: Type of insight
- `data`: JSON insight data
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the insight

---

#### 21. ROIMetrics
**Purpose:** ROI calculations per event.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK, UK): One per event
- `totalBudget`: Total budget
- `actualSpend`: Actual spend
- `leadsGenerated`: Number of leads
- `conversions`: Number of conversions
- `revenueGenerated`: Revenue amount
- `roiPercent`: ROI percentage

---

#### 22. CRMSync
**Purpose:** CRM integration sync status.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK, UK): One per event
- `crmSystem`: CRM system name
- `syncStatus`: Sync status
- `lastSyncedAt`: Last sync timestamp
- `data`: JSON sync data

---

#### 23. AiBudgetSuggestion
**Purpose:** AI-generated budget suggestions.

**Key Fields:**
- `id` (PK): Unique identifier
- `eventId` (FK): Belongs to Event
- `category`: Budget category
- `suggestedCost`: Suggested cost amount
- `reasoning`: AI reasoning
- `confidence`: Confidence score (0-1)
- `accepted`: Whether suggestion was accepted
- `deletedAt`: Soft delete timestamp
- `deletedBy`: User who deleted the suggestion

---

#### 24. Notification
**Purpose:** User notifications.

**Key Fields:**
- `id` (PK): Unique identifier
- `organizationId` (FK): Optional organization link
- `userId` (FK): User who receives notification
- `type`: NotificationType enum
- `title`: Notification title
- `message`: Notification message
- `read`: Read status
- `readAt`: Read timestamp

---

#### 25. ActivityLog
**Purpose:** Audit trail of all system actions.

**Key Fields:**
- `id` (PK): Unique identifier
- `organizationId` (FK): Optional organization link
- `userId` (FK): User who performed action
- `eventId` (FK): Optional event link
- `action`: Action type (created, updated, deleted)
- `details`: JSON action details
- `createdAt`: Action timestamp

---

## Soft Delete Implementation

All major tables support soft delete with the following fields:
- `deletedAt`: DateTime? - Timestamp when record was deleted (NULL = not deleted)
- `deletedBy`: String? - User ID who deleted the record (FK to User)

**Tables with Soft Delete:**
- Organization
- User
- Event
- BudgetItem
- Expense
- Vendor
- File
- Note
- Report
- StrategicGoal
- EventAssignment
- EventStakeholder
- VendorEvent
- Insight
- AiBudgetSuggestion
- Subscription

**Tables without Soft Delete (Audit/Logging):**
- ApprovalWorkflow (audit trail)
- ActivityLog (audit trail)
- Notification (ephemeral)
- SubscriptionHistory (historical record)
- ROIMetrics (computed)
- CRMSync (sync state)
- DashboardMetrics (computed)
- EventMetrics (computed)
- VendorMetrics (computed)

---

## Relationship Summary

### One-to-Many Relationships
- Organization → Users, Events, Vendors, Expenses
- Event → BudgetItems, Expenses, EventAssignments, EventStakeholders
- User → Created Events, Created Expenses, Uploaded Files
- BudgetItem → Expenses, ApprovalWorkflows, Files
- Vendor → BudgetItems, Expenses, VendorEvents

### One-to-One Relationships
- Event → EventMetrics, ROIMetrics, CRMSync
- Organization → DashboardMetrics
- Vendor → VendorMetrics

### Many-to-Many Relationships
- User ↔ Event (via EventAssignment)
- Vendor ↔ Event (via VendorEvent)
- BudgetItem ↔ StrategicGoal (via strategicGoalId)

---

## Indexes

All tables have appropriate indexes on:
- Primary keys (automatic)
- Foreign keys
- Soft delete fields (`deletedAt`, `deletedBy`)
- Frequently queried fields (status, dates, organizationId)
- Composite indexes for common query patterns

---

## Notes

1. **Soft Delete**: Records are never physically deleted. Use `deletedAt IS NULL` in queries to filter active records.

2. **Multi-Tenancy**: All data is scoped by `organizationId` for data isolation.

3. **Audit Trail**: All deletions are tracked via `deletedBy` field linking to User table.

4. **PLAN Module Fields**: Event table includes fields for event intake, budgeting, and planning workflows.

5. **Metrics Tables**: Pre-computed metrics are updated via background jobs or triggers for performance.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Schema Version:** With Soft Delete Support



<svg aria-roledescription="flowchart-v2" role="graphics-document document" viewBox="-8 -8 736.867431640625 2316.299560546875" style="max-width: 736.867431640625px;" xmlns="http://www.w3.org/2000/svg" width="100%" id="mermaid-svg-1766329142835-vjvzpey7x"><style>#mermaid-svg-1766329142835-vjvzpey7x{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;fill:#000000;}#mermaid-svg-1766329142835-vjvzpey7x .error-icon{fill:#f2dede;}#mermaid-svg-1766329142835-vjvzpey7x .error-text{fill:#a1260d;stroke:#a1260d;}#mermaid-svg-1766329142835-vjvzpey7x .edge-thickness-normal{stroke-width:2px;}#mermaid-svg-1766329142835-vjvzpey7x .edge-thickness-thick{stroke-width:3.5px;}#mermaid-svg-1766329142835-vjvzpey7x .edge-pattern-solid{stroke-dasharray:0;}#mermaid-svg-1766329142835-vjvzpey7x .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-svg-1766329142835-vjvzpey7x .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-svg-1766329142835-vjvzpey7x .marker{fill:#717171;stroke:#717171;}#mermaid-svg-1766329142835-vjvzpey7x .marker.cross{stroke:#717171;}#mermaid-svg-1766329142835-vjvzpey7x svg{font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:16px;}#mermaid-svg-1766329142835-vjvzpey7x .label{font-family:"trebuchet ms",verdana,arial,sans-serif;color:#000000;}#mermaid-svg-1766329142835-vjvzpey7x .cluster-label text{fill:#000000;}#mermaid-svg-1766329142835-vjvzpey7x .cluster-label span,#mermaid-svg-1766329142835-vjvzpey7x p{color:#000000;}#mermaid-svg-1766329142835-vjvzpey7x .label text,#mermaid-svg-1766329142835-vjvzpey7x span,#mermaid-svg-1766329142835-vjvzpey7x p{fill:#000000;color:#000000;}#mermaid-svg-1766329142835-vjvzpey7x .node rect,#mermaid-svg-1766329142835-vjvzpey7x .node circle,#mermaid-svg-1766329142835-vjvzpey7x .node ellipse,#mermaid-svg-1766329142835-vjvzpey7x .node polygon,#mermaid-svg-1766329142835-vjvzpey7x .node path{fill:#ffffff;stroke:#c8c8c8;stroke-width:1px;}#mermaid-svg-1766329142835-vjvzpey7x .flowchart-label text{text-anchor:middle;}#mermaid-svg-1766329142835-vjvzpey7x .node .label{text-align:center;}#mermaid-svg-1766329142835-vjvzpey7x .node.clickable{cursor:pointer;}#mermaid-svg-1766329142835-vjvzpey7x .arrowheadPath{fill:#000000;}#mermaid-svg-1766329142835-vjvzpey7x .edgePath .path{stroke:#717171;stroke-width:2.0px;}#mermaid-svg-1766329142835-vjvzpey7x .flowchart-link{stroke:#717171;fill:none;}#mermaid-svg-1766329142835-vjvzpey7x .edgeLabel{background-color:#ffffff99;text-align:center;}#mermaid-svg-1766329142835-vjvzpey7x .edgeLabel rect{opacity:0.5;background-color:#ffffff99;fill:#ffffff99;}#mermaid-svg-1766329142835-vjvzpey7x .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-svg-1766329142835-vjvzpey7x .cluster rect{fill:#e5ebf1;stroke:#c8c8c8;stroke-width:1px;}#mermaid-svg-1766329142835-vjvzpey7x .cluster text{fill:#000000;}#mermaid-svg-1766329142835-vjvzpey7x .cluster span,#mermaid-svg-1766329142835-vjvzpey7x p{color:#000000;}#mermaid-svg-1766329142835-vjvzpey7x div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:"trebuchet ms",verdana,arial,sans-serif;font-size:12px;background:#add6ff;border:1px solid #c8c8c8;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-svg-1766329142835-vjvzpey7x .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-svg-1766329142835-vjvzpey7x :root{--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif;}</style><g><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="6" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd"><path style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 0 0 L 10 5 L 0 10 z"/></marker><marker orient="auto" markerHeight="12" markerWidth="12" markerUnits="userSpaceOnUse" refY="5" refX="4.5" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointStart"><path style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 0 5 L 10 10 L 10 0 z"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="11" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1766329142835-vjvzpey7x_flowchart-circleEnd"><circle style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" r="5" cy="5" cx="5"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5" refX="-1" viewBox="0 0 10 10" class="marker flowchart" id="mermaid-svg-1766329142835-vjvzpey7x_flowchart-circleStart"><circle style="stroke-width: 1; stroke-dasharray: 1, 0;" class="arrowMarkerPath" r="5" cy="5" cx="5"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="12" viewBox="0 0 11 11" class="marker cross flowchart" id="mermaid-svg-1766329142835-vjvzpey7x_flowchart-crossEnd"><path style="stroke-width: 2; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"/></marker><marker orient="auto" markerHeight="11" markerWidth="11" markerUnits="userSpaceOnUse" refY="5.2" refX="-1" viewBox="0 0 11 11" class="marker cross flowchart" id="mermaid-svg-1766329142835-vjvzpey7x_flowchart-crossStart"><path style="stroke-width: 2; stroke-dasharray: 1, 0;" class="arrowMarkerPath" d="M 1,1 l 9,9 M 10,1 l -9,9"/></marker><g class="root"><g class="clusters"/><g class="edgePaths"><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-Start LE-LoginPage" id="L-Start-LoginPage-0" d="M315.521,33.75L315.521,37.917C315.521,42.083,315.521,50.417,315.587,57.95C315.653,65.484,315.785,72.217,315.851,75.584L315.917,78.951"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-LoginPage LE-EnterCredentials" id="L-LoginPage-EnterCredentials-0" d="M374.674,200.44L406.203,215.862C437.731,231.283,500.788,262.126,532.316,286.089C563.844,310.052,563.844,327.135,563.844,342.656C563.844,358.177,563.844,372.135,563.844,394.171C563.844,416.207,563.844,446.319,563.844,477.995C563.844,509.67,563.844,542.908,563.844,568.069C563.844,593.229,563.844,610.312,563.844,625.833C563.844,641.354,563.844,655.312,563.844,669.271C563.844,683.229,563.844,697.187,563.844,711.146C563.844,725.104,563.844,739.062,563.844,749.325C563.844,759.587,563.844,766.154,563.844,769.437L563.844,772.721"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-LoginPage LE-RegisterForm" id="L-LoginPage-RegisterForm-0" d="M270.251,213.324L255.489,226.598C240.728,239.872,211.204,266.42,196.443,284.54C181.681,302.66,181.681,312.352,181.681,317.198L181.681,322.044"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-EnterCredentials LE-ValidateLogin" id="L-EnterCredentials-ValidateLogin-0" d="M588.74,811.771L594.888,815.937C601.035,820.104,613.329,828.437,619.542,835.971C625.755,843.505,625.887,850.238,625.953,853.605L626.019,856.972"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ValidateLogin LE-ShowError" id="L-ValidateLogin-ShowError-0" d="M556.498,968.245L490.011,985.495C423.524,1002.745,290.55,1037.245,213.285,1069.607C136.019,1101.97,114.461,1132.195,103.682,1147.308L92.903,1162.42"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ShowError LE-EnterCredentials" id="L-ShowError-EnterCredentials-0" d="M73.355,1166.735L69.194,1150.903C65.033,1135.072,56.711,1103.408,52.55,1067.214C48.389,1031.02,48.389,990.295,48.389,951.133C48.389,911.97,48.389,874.371,118.08,849.909C187.77,825.448,327.152,814.124,396.843,808.463L466.534,802.801"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ValidateLogin LE-CheckEmailVerified" id="L-ValidateLogin-CheckEmailVerified-0" d="M626.123,1037.87L626.04,1043.516C625.957,1049.161,625.79,1060.453,625.777,1071.028C625.765,1081.603,625.906,1091.462,625.977,1096.391L626.047,1101.32"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CheckEmailVerified LE-EmailVerificationPage" id="L-CheckEmailVerified-EmailVerificationPage-0" d="M589.184,1224.661L578.274,1236.463C567.364,1248.266,545.543,1271.871,517.178,1289.138C488.813,1306.406,453.904,1317.336,436.449,1322.801L418.995,1328.267"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CheckEmailVerified LE-CheckActive" id="L-CheckEmailVerified-CheckActive-0" d="M635.124,1252.6L635.99,1259.746C636.857,1266.892,638.591,1281.183,639.457,1296.871C640.324,1312.559,640.324,1329.642,640.324,1345.163C640.324,1360.684,640.324,1374.642,640.324,1388.6C640.324,1402.559,640.324,1416.517,640.324,1430.475C640.324,1444.434,640.324,1458.392,640.324,1480.839C640.324,1503.286,640.324,1534.221,640.324,1566.719C640.324,1599.217,640.324,1633.277,640.324,1658.849C640.324,1684.421,640.324,1701.504,640.324,1717.025C640.324,1732.546,640.324,1746.504,640.324,1760.462C640.324,1774.421,640.324,1788.379,640.324,1802.337C640.324,1816.296,640.324,1830.254,640.39,1840.6C640.456,1850.946,640.588,1857.68,640.654,1861.046L640.72,1864.413"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CheckActive LE-AccountInactive" id="L-CheckActive-AccountInactive-0" d="M582.079,1972.055L540.173,1987.492C498.267,2002.928,414.454,2033.801,372.548,2054.084C330.641,2074.366,330.641,2084.058,330.641,2088.904L330.641,2093.749"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CheckActive LE-CreateSession" id="L-CheckActive-CreateSession-0" d="M640.824,2030.799L640.741,2036.445C640.657,2042.091,640.491,2053.383,632.591,2064.266C624.692,2075.149,609.061,2085.624,601.245,2090.862L593.43,2096.099"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CreateSession LE-Dashboard" id="L-CreateSession-Dashboard-0" d="M563.844,2132.799L563.844,2136.966C563.844,2141.133,563.844,2149.466,563.844,2156.916C563.844,2164.366,563.844,2170.933,563.844,2174.216L563.844,2177.499"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-RegisterForm LE-ValidateForm" id="L-RegisterForm-ValidateForm-0" d="M213.687,361.094L221.589,365.26C229.492,369.427,245.297,377.76,253.265,385.294C261.234,392.827,261.366,399.561,261.432,402.928L261.498,406.295"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ValidateForm LE-ShowFormErrors" id="L-ValidateForm-ShowFormErrors-0" d="M227.451,508.12L214.861,519.458C202.272,530.795,177.093,553.471,157.389,570.016C137.686,586.561,123.457,596.976,116.343,602.183L109.229,607.39"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ShowFormErrors LE-RegisterForm" id="L-ShowFormErrors-RegisterForm-0" d="M77.057,610.521L75.414,604.792C73.771,599.062,70.484,587.604,68.841,565.256C67.197,542.908,67.197,509.67,67.197,477.995C67.197,446.319,67.197,416.207,77.759,397.287C88.321,378.367,109.445,370.641,120.007,366.778L130.568,362.914"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ValidateForm LE-CreateOrg" id="L-ValidateForm-CreateOrg-0" d="M272.682,531.191L274.146,538.683C275.61,546.176,278.537,561.161,280.001,573.499C281.465,585.837,281.465,595.529,281.465,600.375L281.465,605.221"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CreateOrg LE-CreateUser" id="L-CreateOrg-CreateUser-0" d="M281.465,644.271L281.465,648.437C281.465,652.604,281.465,660.937,281.465,668.387C281.465,675.837,281.465,682.404,281.465,685.687L281.465,688.971"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CreateUser LE-CreateSubscription" id="L-CreateUser-CreateSubscription-0" d="M281.465,728.021L281.465,732.187C281.465,736.354,281.465,744.687,281.465,752.137C281.465,759.587,281.465,766.154,281.465,769.437L281.465,772.721"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-CreateSubscription LE-GenerateToken" id="L-CreateSubscription-GenerateToken-0" d="M287.389,811.771L288.852,815.937C290.314,820.104,293.24,828.437,294.703,847.708C296.165,866.979,296.165,897.187,296.165,912.291L296.165,927.395"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-GenerateToken LE-SendEmail" id="L-GenerateToken-SendEmail-0" d="M296.165,966.445L296.165,983.995C296.165,1001.545,296.165,1036.645,296.165,1069.143C296.165,1101.642,296.165,1131.538,296.165,1146.487L296.165,1161.435"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-SendEmail LE-EmailVerificationPage" id="L-SendEmail-EmailVerificationPage-0" d="M296.165,1200.485L296.165,1216.317C296.165,1232.148,296.165,1263.812,302.617,1284.82C309.069,1305.828,321.972,1316.181,328.424,1321.357L334.876,1326.534"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-EmailVerificationPage LE-ClickLink" id="L-EmailVerificationPage-ClickLink-0" d="M360.042,1363.6L360.042,1367.767C360.042,1371.934,360.042,1380.267,360.042,1387.717C360.042,1395.167,360.042,1401.734,360.042,1405.017L360.042,1408.3"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ClickLink LE-ValidateToken" id="L-ClickLink-ValidateToken-0" d="M360.042,1447.35L360.042,1451.517C360.042,1455.684,360.042,1464.017,360.108,1471.55C360.174,1479.084,360.306,1485.818,360.372,1489.184L360.438,1492.551"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ValidateToken LE-TokenExpired" id="L-ValidateToken-TokenExpired-0" d="M318.214,1591.134L296.893,1603.835C275.571,1616.535,232.928,1641.936,211.606,1659.483C190.285,1677.029,190.285,1686.721,190.285,1691.566L190.285,1696.412"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ValidateToken LE-ActivateUser" id="L-ValidateToken-ActivateUser-0" d="M389.568,1604.436L397.394,1614.92C405.219,1625.403,420.871,1646.37,428.696,1661.7C436.522,1677.029,436.522,1686.721,436.522,1691.566L436.522,1696.412"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-ActivateUser LE-SetEmailVerified" id="L-ActivateUser-SetEmailVerified-0" d="M436.522,1735.462L436.522,1739.629C436.522,1743.796,436.522,1752.129,436.522,1759.579C436.522,1767.029,436.522,1773.596,436.522,1776.879L436.522,1780.162"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-SetEmailVerified LE-SetActive" id="L-SetEmailVerified-SetActive-0" d="M436.522,1819.212L436.522,1823.379C436.522,1827.546,436.522,1835.879,436.522,1853.94C436.522,1872.002,436.522,1899.791,436.522,1913.686L436.522,1927.581"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-SetActive LE-CreateSession" id="L-SetActive-CreateSession-0" d="M436.522,1966.631L436.522,1982.971C436.522,1999.312,436.522,2031.993,449.936,2053.733C463.349,2075.473,490.177,2086.272,503.591,2091.671L517.004,2097.07"/><path marker-end="url(#mermaid-svg-1766329142835-vjvzpey7x_flowchart-pointEnd)" style="fill:none;" class="edge-thickness-normal edge-pattern-solid flowchart-link LS-Dashboard LE-End" id="L-Dashboard-End-0" d="M563.844,2216.549L563.844,2220.716C563.844,2224.883,563.844,2233.216,563.844,2240.666C563.844,2248.116,563.844,2254.683,563.844,2257.966L563.844,2261.249"/></g><g class="edgeLabels"><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g transform="translate(563.8443832397461, 576.1458282470703)" class="edgeLabel"><g transform="translate(-19.013671875, -9.375)" class="label"><rect height="18.750139236450195" width="38.01460647583008" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Login</tspan></text></g></g><g transform="translate(181.68131160736084, 292.96875)" class="edgeLabel"><g transform="translate(-28.876953125, -9.375)" class="label"><rect height="18.750139236450195" width="57.74131393432617" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Register</tspan></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g transform="translate(157.57649421691895, 1071.7447814941406)" class="edgeLabel"><g transform="translate(-9.401041030883789, -9.375)" class="label"><rect height="18.750139236450195" width="18.795711517333984" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">No</tspan></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g transform="translate(625.6233577728271, 1071.7447814941406)" class="edgeLabel"><g transform="translate(-11.324869155883789, -9.375)" class="label"><rect height="18.750139236450195" width="22.643396377563477" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Yes</tspan></text></g></g><g transform="translate(523.722318649292, 1295.4752502441406)" class="edgeLabel"><g transform="translate(-9.401041030883789, -9.375)" class="label"><rect height="18.750139236450195" width="18.795711517333984" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">No</tspan></text></g></g><g transform="translate(640.323878288269, 1565.156234741211)" class="edgeLabel"><g transform="translate(-11.324869155883789, -9.375)" class="label"><rect height="18.750139236450195" width="22.643396377563477" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Yes</tspan></text></g></g><g transform="translate(330.641263961792, 2064.6744537353516)" class="edgeLabel"><g transform="translate(-9.401041030883789, -9.375)" class="label"><rect height="18.750139236450195" width="18.795711517333984" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">No</tspan></text></g></g><g transform="translate(640.323878288269, 2064.6744537353516)" class="edgeLabel"><g transform="translate(-11.324869155883789, -9.375)" class="label"><rect height="18.750139236450195" width="22.643396377563477" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Yes</tspan></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g transform="translate(151.91405963897705, 576.1458282470703)" class="edgeLabel"><g transform="translate(-9.401041030883789, -9.375)" class="label"><rect height="18.750139236450195" width="18.795711517333984" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">No</tspan></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g transform="translate(281.4648389816284, 576.1458282470703)" class="edgeLabel"><g transform="translate(-11.324869155883789, -9.375)" class="label"><rect height="18.750139236450195" width="22.643396377563477" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Yes</tspan></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g transform="translate(190.28482341766357, 1667.3372192382812)" class="edgeLabel"><g transform="translate(-9.401041030883789, -9.375)" class="label"><rect height="18.750139236450195" width="18.795711517333984" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">No</tspan></text></g></g><g transform="translate(436.52180004119873, 1667.3372192382812)" class="edgeLabel"><g transform="translate(-11.324869155883789, -9.375)" class="label"><rect height="18.750139236450195" width="22.643396377563477" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Yes</tspan></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g><g class="edgeLabel"><g transform="translate(0, 0)" class="label"><rect height="0" width="0" ry="0" rx="0"/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve"/></text></g></g></g><g class="nodes"><g transform="translate(315.52082347869873, 16.875)" id="flowchart-Start-387" class="node default default flowchart-label"><rect height="33.75" width="128.7890625" y="-16.875" x="-64.39453125" ry="16.875" rx="16.875" style=""/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">User Visits App</tspan></text></g></g><g transform="translate(315.52082347869873, 171.171875)" id="flowchart-LoginPage-388" class="node default default flowchart-label"><polygon style="" transform="translate(-87.421875,87.421875)" class="label-container" points="87.421875,0 174.84375,-87.421875 87.421875,-174.84375 0,-87.421875"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Login or Register?</tspan></text></g></g><g transform="translate(563.8443832397461, 794.8958282470703)" id="flowchart-EnterCredentials-390" class="node default default flowchart-label"><rect height="33.75" width="184.0559844970703" y="-16.875" x="-92.02799224853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Enter Email &amp; Password</tspan></text></g></g><g transform="translate(181.68131160736084, 344.21875)" id="flowchart-RegisterForm-392" class="node default default flowchart-label"><rect height="33.75" width="169.1927032470703" y="-16.875" x="-84.59635162353516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Fill Registration Form</tspan></text></g></g><g transform="translate(625.6233577728271, 949.5703048706055)" id="flowchart-ValidateLogin-394" class="node default default flowchart-label"><polygon style="" transform="translate(-87.79947662353516,87.79947662353516)" class="label-container" points="87.79947662353516,0 175.5989532470703,-87.79947662353516 87.79947662353516,-175.5989532470703 0,-87.79947662353516"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Valid Credentials?</tspan></text></g></g><g transform="translate(77.78971099853516, 1183.6100158691406)" id="flowchart-ShowError-396" class="node default default flowchart-label"><rect height="33.75" width="155.5794219970703" y="-16.875" x="-77.78971099853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Show Error Message</tspan></text></g></g><g transform="translate(625.6233577728271, 1183.6100158691406)" id="flowchart-CheckEmailVerified-400" class="node default default flowchart-label"><polygon style="" transform="translate(-77.490234375,77.490234375)" class="label-container" points="77.490234375,0 154.98046875,-77.490234375 77.490234375,-154.98046875 0,-77.490234375"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Email Verified?</tspan></text></g></g><g transform="translate(360.0423049926758, 1346.7252502441406)" id="flowchart-EmailVerificationPage-402" class="node default default flowchart-label"><rect height="33.75" width="180.4296875" y="-16.875" x="-90.21484375" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Email Verification Page</tspan></text></g></g><g transform="translate(640.323878288269, 1949.7558364868164)" id="flowchart-CheckActive-404" class="node default default flowchart-label"><polygon style="" transform="translate(-80.54361724853516,80.54361724853516)" class="label-container" points="80.54361724853516,0 161.0872344970703,-80.54361724853516 80.54361724853516,-161.0872344970703 0,-80.54361724853516"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Account Active?</tspan></text></g></g><g transform="translate(330.641263961792, 2115.9244537353516)" id="flowchart-AccountInactive-406" class="node default default flowchart-label"><rect height="33.75" width="176.7578125" y="-16.875" x="-88.37890625" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Show Inactive Message</tspan></text></g></g><g transform="translate(563.8443832397461, 2115.9244537353516)" id="flowchart-CreateSession-408" class="node default default flowchart-label"><rect height="33.75" width="155.6966094970703" y="-16.875" x="-77.84830474853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Create User Session</tspan></text></g></g><g transform="translate(563.8443832397461, 2199.6744537353516)" id="flowchart-Dashboard-410" class="node default default flowchart-label"><rect height="33.75" width="174.12759399414062" y="-16.875" x="-87.06379699707031" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Redirect to Dashboard</tspan></text></g></g><g transform="translate(261.10188388824463, 476.43228912353516)" id="flowchart-ValidateForm-412" class="node default default flowchart-label"><polygon style="" transform="translate(-65.33853912353516,65.33853912353516)" class="label-container" points="65.33853912353516,0 130.6770782470703,-65.33853912353516 65.33853912353516,-130.6770782470703 0,-65.33853912353516"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Form Valid?</tspan></text></g></g><g transform="translate(81.89778423309326, 627.3958282470703)" id="flowchart-ShowFormErrors-414" class="node default default flowchart-label"><rect height="33.75" width="140.3450469970703" y="-16.875" x="-70.17252349853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Show Form Errors</tspan></text></g></g><g transform="translate(281.4648389816284, 627.3958282470703)" id="flowchart-CreateOrg-418" class="node default default flowchart-label"><rect height="33.75" width="158.7890625" y="-16.875" x="-79.39453125" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Create Organization</tspan></text></g></g><g transform="translate(281.4648389816284, 711.1458282470703)" id="flowchart-CreateUser-420" class="node default default flowchart-label"><rect height="33.75" width="161.2434844970703" y="-16.875" x="-80.62174224853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Create User Account</tspan></text></g></g><g transform="translate(281.4648389816284, 794.8958282470703)" id="flowchart-CreateSubscription-422" class="node default default flowchart-label"><rect height="33.75" width="192.3828125" y="-16.875" x="-96.19140625" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Create Free Subscription</tspan></text></g></g><g transform="translate(296.1653594970703, 949.5703048706055)" id="flowchart-GenerateToken-424" class="node default default flowchart-label"><rect height="33.75" width="259.7591094970703" y="-16.875" x="-129.87955474853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Generate Email Verification Token</tspan></text></g></g><g transform="translate(296.1653594970703, 1183.6100158691406)" id="flowchart-SendEmail-426" class="node default default flowchart-label"><rect height="33.75" width="181.171875" y="-16.875" x="-90.5859375" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Send Verification Email</tspan></text></g></g><g transform="translate(360.0423049926758, 1430.4752502441406)" id="flowchart-ClickLink-430" class="node default default flowchart-label"><rect height="33.75" width="214.9739532470703" y="-16.875" x="-107.48697662353516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">User Clicks Verification Link</tspan></text></g></g><g transform="translate(360.0423049926758, 1565.156234741211)" id="flowchart-ValidateToken-432" class="node default default flowchart-label"><polygon style="" transform="translate(-67.80598831176758,67.80598831176758)" class="label-container" points="67.80598831176758,0 135.61197662353516,-67.80598831176758 67.80598831176758,-135.61197662353516 0,-67.80598831176758"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Token Valid?</tspan></text></g></g><g transform="translate(190.28482341766357, 1718.5872192382812)" id="flowchart-TokenExpired-434" class="node default default flowchart-label"><rect height="33.75" width="219.6419219970703" y="-16.875" x="-109.82096099853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Show Expired Token Message</tspan></text></g></g><g transform="translate(436.52180004119873, 1718.5872192382812)" id="flowchart-ActivateUser-436" class="node default default flowchart-label"><rect height="33.75" width="172.83203125" y="-16.875" x="-86.416015625" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Activate User Account</tspan></text></g></g><g transform="translate(436.52180004119873, 1802.3372192382812)" id="flowchart-SetEmailVerified-438" class="node default default flowchart-label"><rect height="33.75" width="186.3411407470703" y="-16.875" x="-93.17057037353516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Set emailVerified = true</tspan></text></g></g><g transform="translate(436.52180004119873, 1949.7558364868164)" id="flowchart-SetActive-440" class="node default default flowchart-label"><rect height="33.75" width="146.5169219970703" y="-16.875" x="-73.25846099853516" ry="0" rx="0" style="" class="basic label-container"/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">Set isActive = true</tspan></text></g></g><g transform="translate(563.8443832397461, 2283.4244537353516)" id="flowchart-End-444" class="node default default flowchart-label"><rect height="33.75" width="128.46353912353516" y="-16.875" x="-64.23176956176758" ry="16.875" rx="16.875" style=""/><g transform="translate(0, -9.375)" style="" class="label"><rect/><text style=""><tspan class="row" x="0" dy="1em" xml:space="preserve">User Logged In</tspan></text></g></g></g></g></g></svg>
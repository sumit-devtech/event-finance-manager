# ER Diagram - Event Finance Manager System

## High-Level Entity Relationship Diagram

This diagram shows the complete database structure for the Event Finance Manager system, organized by functional areas.

```mermaid
erDiagram
    %% Multi-Tenancy Core
    Organization ||--o{ User : "has"
    Organization ||--o{ Subscription : "has"
    Organization ||--o{ Vendor : "has"
    Organization ||--o{ Event : "has"
    Organization ||--o{ Expense : "has"
    Organization ||--o{ ActivityLog : "tracks"
    Organization ||--o{ Notification : "sends"

    %% User Management
    User ||--o{ Event : "creates"
    User ||--o{ EventAssignment : "assigned_to"
    User ||--o{ Expense : "creates"
    User ||--o{ ApprovalWorkflow : "approves"
    User ||--o{ SubscriptionHistory : "changes"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Notification : "receives"
    User ||--o{ Report : "creates"

    %% Subscription Management
    Subscription ||--o{ SubscriptionHistory : "has_history"

    %% Event Management
    Event ||--o{ EventAssignment : "has_assignments"
    Event ||--o{ EventStakeholder : "has_stakeholders"
    Event ||--o{ BudgetItem : "has_budget_items"
    Event ||--o{ Expense : "has_expenses"
    Event ||--o{ VendorEvent : "uses_vendors"
    Event ||--o{ File : "has_files"
    Event ||--o{ ActivityLog : "tracks_activity"
    Event ||--o{ Insight : "has_insights"
    Event ||--|| ROIMetrics : "has_roi"
    Event ||--|| CRMSync : "has_crm_sync"
    Event ||--o{ Report : "has_reports"
    Event ||--o{ AiBudgetSuggestion : "has_ai_suggestions"

    %% User-Event Assignment
    EventAssignment }o--|| User : "assigned_user"
    EventAssignment }o--|| Event : "assigned_event"

    %% Budget Management
    BudgetItem }o--o| Vendor : "optional_vendor"
    BudgetItem ||--o{ File : "has_files"

    %% Expense Management
    Expense }o--o| Vendor : "optional_vendor"
    Expense ||--o{ ApprovalWorkflow : "requires_approval"
    ApprovalWorkflow }o--o| User : "approved_by"

    %% Vendor Management
    Vendor ||--o{ VendorEvent : "assigned_to_events"
    Vendor ||--o{ BudgetItem : "used_in_budgets"
    Vendor ||--o{ Expense : "receives_payments"

    %% Vendor-Event Assignment
    VendorEvent }o--|| Vendor : "vendor"
    VendorEvent }o--|| Event : "event"

    %% Reporting
    Report ||--o{ File : "contains_files"

    %% Analytics
    Insight }o--|| Event : "for_event"
    ROIMetrics }o--|| Event : "for_event"
    CRMSync }o--|| Event : "for_event"

    %% Entity Definitions
    Organization {
        uuid id PK
        string name
        string industry
        string logoUrl
        datetime createdAt
        datetime updatedAt
    }

    User {
        uuid id PK
        uuid organizationId FK
        string fullName
        string email UK
        enum role
        string passwordHash
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Subscription {
        uuid id PK
        uuid organizationId FK
        string planName
        enum billingCycle
        enum status
        datetime currentPeriodStart
        datetime currentPeriodEnd
        datetime createdAt
        datetime updatedAt
    }

    SubscriptionHistory {
        uuid id PK
        uuid subscriptionId FK
        string action
        json oldValue
        json newValue
        uuid changedBy FK
        datetime changedAt
    }

    Event {
        uuid id PK
        uuid organizationId FK
        uuid createdBy FK
        string name
        string location
        datetime startDate
        datetime endDate
        string eventType
        string description
        enum status
        datetime createdAt
        datetime updatedAt
    }

    EventAssignment {
        uuid id PK
        uuid userId FK
        uuid eventId FK
        string role
        datetime assignedAt
    }

    EventStakeholder {
        uuid id PK
        uuid eventId FK
        string name
        string role
        string email
        string phone
        datetime createdAt
        datetime updatedAt
    }

    Vendor {
        uuid id PK
        uuid organizationId FK
        string name
        string serviceType
        string contactPerson
        string email
        string phone
        string gstNumber
        float rating
        datetime createdAt
        datetime updatedAt
    }

    VendorEvent {
        uuid id PK
        uuid vendorId FK
        uuid eventId FK
        datetime assignedAt
    }

    BudgetItem {
        uuid id PK
        uuid eventId FK
        uuid vendorId FK
        enum category
        string description
        string vendor
        decimal estimatedCost
        decimal actualCost
        datetime createdAt
        datetime updatedAt
    }

    Expense {
        uuid id PK
        uuid organizationId FK
        uuid eventId FK
        uuid vendorId FK
        uuid createdBy FK
        string vendor
        string title
        float amount
        string description
        enum status
        datetime createdAt
        datetime updatedAt
    }

    ApprovalWorkflow {
        uuid id PK
        uuid expenseId FK
        uuid approverId FK
        string action
        string comments
        datetime actionAt
    }

    ROIMetrics {
        uuid id PK
        uuid eventId FK
        float totalBudget
        float actualSpend
        int leadsGenerated
        int conversions
        float revenueGenerated
        float roiPercent
        datetime createdAt
        datetime updatedAt
    }

    Insight {
        uuid id PK
        uuid eventId FK
        string insightType
        json data
        datetime createdAt
        datetime updatedAt
    }

    CRMSync {
        uuid id PK
        uuid eventId FK
        string crmSystem
        string syncStatus
        datetime lastSyncedAt
        json data
        datetime createdAt
        datetime updatedAt
    }

    Report {
        uuid id PK
        uuid eventId FK
        uuid createdBy FK
        string reportType
        datetime createdAt
    }

    File {
        uuid id PK
        uuid eventId FK
        uuid budgetItemId FK
        uuid reportId FK
        string filename
        string path
        string mimeType
        int size
        datetime uploadedAt
    }

    Notification {
        uuid id PK
        uuid organizationId FK
        uuid userId FK
        enum type
        string title
        string message
        boolean read
        json metadata
        datetime createdAt
        datetime readAt
    }

    ActivityLog {
        uuid id PK
        uuid organizationId FK
        uuid userId FK
        uuid eventId FK
        string action
        json details
        datetime createdAt
    }

    AiBudgetSuggestion {
        uuid id PK
        uuid eventId FK
        enum category
        string description
        decimal suggestedCost
        string reasoning
        float confidence
        boolean accepted
        datetime createdAt
    }
```

## Diagram Legend

### Relationship Types
- `||--o{` : One-to-Many (one Organization has many Users)
- `||--||` : One-to-One (one Event has one ROIMetrics)
- `}o--o|` : Many-to-One Optional (BudgetItem optionally links to Vendor)
- `}o--||` : Many-to-One Required (EventAssignment requires User)

### Key Abbreviations
- **PK**: Primary Key
- **FK**: Foreign Key
- **UK**: Unique Key
- **enum**: Enumeration (predefined values)

## Functional Areas

### 1. Multi-Tenancy Core
- **Organization**: Root entity - all data is scoped to an organization
- **User**: System users belonging to organizations
- **Subscription**: Billing and subscription management

### 2. Event Management
- **Event**: Core entity representing an event
- **EventAssignment**: Links users to events with roles
- **EventStakeholder**: External participants/stakeholders

### 3. Budget Planning
- **BudgetItem**: Budget line items directly on events
- **AiBudgetSuggestion**: AI-generated budget recommendations

### 4. Expense Management
- **Expense**: Actual expenses incurred
- **ApprovalWorkflow**: Multi-step approval process

### 5. Vendor Management
- **Vendor**: Vendor master data
- **VendorEvent**: Links vendors to events

### 6. Analytics & Integration
- **ROIMetrics**: Return on Investment calculations
- **Insight**: Analytics insights and recommendations
- **CRMSync**: CRM system integration tracking

### 7. Supporting Systems
- **Report**: Generated reports
- **File**: Flexible file storage
- **Notification**: User notifications
- **ActivityLog**: Audit trail

## Key Design Patterns

1. **Multi-Tenancy**: All major entities include `organizationId` for data isolation
2. **Flexible Relationships**: Files can link to Event, BudgetItem, or Report
3. **Optional Vendor Links**: Both BudgetItem and Expense support vendor as text or FK
4. **Audit Trail**: ActivityLog tracks all important actions
5. **One-to-One Analytics**: ROIMetrics and CRMSync are unique per event

## Notes for Client Presentation

- The system supports multiple organizations (multi-tenant architecture)
- Each organization has isolated data
- Events are the central entity around which all planning and tracking revolves
- Budget planning and expense tracking are separate but related processes
- The system includes AI-powered budget suggestions
- Complete audit trail via ActivityLog
- Flexible file storage for documents, receipts, and reports


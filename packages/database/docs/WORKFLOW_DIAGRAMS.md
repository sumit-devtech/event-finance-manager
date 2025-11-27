# Workflow Diagrams - Event Finance Manager System

This document contains visual workflow diagrams for key business processes in the Event Finance Manager system.

## 1. Event Lifecycle Workflow

Shows the complete lifecycle of an event from creation to completion.

```mermaid
flowchart TD
    Start([Start: Create Event]) --> Create[Admin/Manager Creates Event]
    Create --> Planning[Status: Planning]
    Planning --> AssignUsers[Assign Users to Event]
    AssignUsers --> AddStakeholders[Add External Stakeholders]
    AddStakeholders --> CreateBudget[Create Budget Items]
    CreateBudget --> ReviewBudget{Review Budget}
    ReviewBudget -->|Needs Changes| CreateBudget
    ReviewBudget -->|Approved| Activate[Status: Active]
    Activate --> TrackExpenses[Track Expenses]
    TrackExpenses --> Monitor{Monitor Progress}
    Monitor -->|Event Ongoing| TrackExpenses
    Monitor -->|Event Complete| Complete[Status: Completed]
    Complete --> GenerateROI[Calculate ROI Metrics]
    GenerateROI --> GenerateReports[Generate Reports]
    GenerateReports --> End([End])
    
    style Planning fill:#fff4e1
    style Activate fill:#e1f5ff
    style Complete fill:#e1ffe1
```

## 2. Expense Approval Workflow

Shows the multi-step expense approval process.

```mermaid
flowchart TD
    Start([User Submits Expense]) --> CreateExpense[Create Expense Record]
    CreateExpense --> StatusPending[Status: Pending]
    StatusPending --> NotifyApprover[Notify Approver]
    NotifyApprover --> ApproverReview{Approver Reviews}
    ApproverReview -->|Rejected| Rejected[Status: Rejected]
    ApproverReview -->|Approved| Approved[Status: Approved]
    Rejected --> NotifyUser[Notify User]
    NotifyUser --> UpdateExpense[User Updates Expense]
    UpdateExpense --> StatusPending
    Approved --> RecordApproval[Record Approval in Workflow]
    RecordApproval --> UpdateBudget[Update Budget Actual Cost]
    UpdateBudget --> GenerateInsight[Generate Budget Variance Insight]
    GenerateInsight --> End([End: Expense Approved])
    
    style StatusPending fill:#fff4e1
    style Approved fill:#e1ffe1
    style Rejected fill:#ffe1e1
```

## 3. Budget Planning Workflow

Shows how budgets are created, reviewed, and tracked.

```mermaid
flowchart TD
    Start([Start Budget Planning]) --> CreateItems[Create Budget Items]
    CreateItems --> AddCategory[Add Items by Category]
    AddCategory --> SetEstimated[Set Estimated Costs]
    SetEstimated --> CheckAI{Use AI Suggestions?}
    CheckAI -->|Yes| GetAISuggestions[Get AI Budget Suggestions]
    GetAISuggestions --> ReviewAI{Review Suggestions}
    ReviewAI -->|Accept| AddToBudget[Add to Budget]
    ReviewAI -->|Reject| CreateItems
    AddToBudget --> CreateItems
    CheckAI -->|No| ReviewBudget[Review Total Budget]
    ReviewBudget --> BudgetApproved{Budget Approved?}
    BudgetApproved -->|No| CreateItems
    BudgetApproved -->|Yes| LockBudget[Lock Budget]
    LockBudget --> TrackActual[Track Actual Expenses]
    TrackActual --> Compare[Compare Estimated vs Actual]
    Compare --> GenerateVariance[Generate Variance Report]
    GenerateVariance --> UpdateROI[Update ROI Metrics]
    UpdateROI --> End([End])
    
    style GetAISuggestions fill:#e1f5ff
    style LockBudget fill:#fff4e1
    style GenerateVariance fill:#e1ffe1
```

## 4. User Assignment to Events Workflow

Shows how users are assigned to events and their roles.

```mermaid
flowchart TD
    Start([Admin/Manager Assigns User]) --> SelectEvent[Select Event]
    SelectEvent --> SelectUser[Select User]
    SelectUser --> CheckExisting{Already Assigned?}
    CheckExisting -->|Yes| ShowError[Show Error: Already Assigned]
    ShowError --> SelectUser
    CheckExisting -->|No| AssignRole[Assign Role]
    AssignRole --> CreateAssignment[Create EventAssignment]
    CreateAssignment --> NotifyUser[Notify User]
    NotifyUser --> LogActivity[Log Activity]
    LogActivity --> UpdatePermissions[Update User Permissions]
    UpdatePermissions --> End([User Assigned])
    
    style CheckExisting fill:#fff4e1
    style CreateAssignment fill:#e1ffe1
```

## 5. Vendor Assignment Workflow

Shows how vendors are assigned to events.

```mermaid
flowchart TD
    Start([Assign Vendor to Event]) --> CheckVendor{Vendor Exists?}
    CheckVendor -->|No| CreateVendor[Create Vendor Record]
    CreateVendor --> AddDetails[Add Vendor Details]
    AddDetails --> SaveVendor[Save Vendor]
    SaveVendor --> SelectEvent[Select Event]
    CheckVendor -->|Yes| SelectEvent
    SelectEvent --> CheckAssignment{Already Assigned?}
    CheckAssignment -->|Yes| ShowError[Show Error]
    ShowError --> SelectEvent
    CheckAssignment -->|No| CreateAssignment[Create VendorEvent]
    CreateAssignment --> LinkToBudget[Link to Budget Items]
    LinkToBudget --> LinkToExpenses[Link to Expenses]
    LinkToExpenses --> NotifyStakeholders[Notify Stakeholders]
    NotifyStakeholders --> End([Vendor Assigned])
    
    style CheckVendor fill:#fff4e1
    style CreateAssignment fill:#e1ffe1
```

## 6. Budget vs Actual Tracking Workflow

Shows how the system tracks budget variance and generates insights.

```mermaid
flowchart TD
    Start([Expense Recorded]) --> UpdateActual[Update Actual Cost]
    UpdateActual --> CalculateVariance[Calculate Budget Variance]
    CalculateVariance --> CheckThreshold{Within Threshold?}
    CheckThreshold -->|Yes| Continue[Continue Tracking]
    CheckThreshold -->|No| GenerateAlert[Generate Alert]
    GenerateAlert --> CreateInsight[Create Insight Record]
    CreateInsight --> NotifyManager[Notify Event Manager]
    NotifyManager --> ReviewVariance{Review Variance}
    ReviewVariance -->|Adjust Budget| UpdateBudget[Update Budget Items]
    ReviewVariance -->|Accept Variance| Acknowledge[Acknowledge Variance]
    UpdateBudget --> CalculateVariance
    Acknowledge --> UpdateROI[Update ROI Metrics]
    Continue --> UpdateROI
    UpdateROI --> GenerateReport[Generate Variance Report]
    GenerateReport --> End([End])
    
    style CheckThreshold fill:#fff4e1
    style GenerateAlert fill:#ffe1e1
    style UpdateROI fill:#e1ffe1
```

## 7. ROI Calculation Workflow

Shows how ROI metrics are calculated and updated.

```mermaid
flowchart TD
    Start([Event Status: Completed]) --> GatherData[Gather Event Data]
    GatherData --> GetBudget[Get Total Budget]
    GetBudget --> GetExpenses[Get Total Expenses]
    GetExpenses --> GetLeads[Get Leads Generated]
    GetLeads --> GetConversions[Get Conversions]
    GetConversions --> GetRevenue[Get Revenue Generated]
    GetRevenue --> CalculateROI[Calculate ROI Percentage]
    CalculateROI --> UpdateMetrics[Update ROIMetrics]
    UpdateMetrics --> SyncCRM{Sync with CRM?}
    SyncCRM -->|Yes| UpdateCRM[Update CRM System]
    UpdateCRM --> CreateReport[Create ROI Report]
    SyncCRM -->|No| CreateReport
    CreateReport --> NotifyStakeholders[Notify Stakeholders]
    NotifyStakeholders --> End([End])
    
    style CalculateROI fill:#e1f5ff
    style UpdateMetrics fill:#e1ffe1
```

## 8. Multi-Tenant Data Isolation Workflow

Shows how the system ensures data isolation between organizations.

```mermaid
flowchart TD
    Start([User Login]) --> Authenticate[Authenticate User]
    Authenticate --> GetOrg[Get User Organization]
    GetOrg --> SetContext[Set Organization Context]
    SetContext --> QueryData[Query Data]
    QueryData --> FilterOrg[Filter by Organization ID]
    FilterOrg --> ReturnData[Return Filtered Data]
    ReturnData --> ValidateAccess{Has Access?}
    ValidateAccess -->|No| DenyAccess[Deny Access]
    ValidateAccess -->|Yes| AllowAccess[Allow Access]
    DenyAccess --> End([End: Access Denied])
    AllowAccess --> LogActivity[Log Activity with Org ID]
    LogActivity --> End([End: Access Granted])
    
    style FilterOrg fill:#fff4e1
    style ValidateAccess fill:#ffe1e1
    style AllowAccess fill:#e1ffe1
```

## Workflow Summary

### Key Workflows Covered:

1. **Event Lifecycle**: Complete event management from planning to completion
2. **Expense Approval**: Multi-step approval process with notifications
3. **Budget Planning**: Creation, AI suggestions, and approval
4. **User Assignment**: Assigning users to events with roles
5. **Vendor Assignment**: Managing vendor relationships with events
6. **Budget Tracking**: Real-time variance tracking and alerts
7. **ROI Calculation**: Automated ROI metrics calculation
8. **Data Isolation**: Multi-tenant security and data isolation

### Common Patterns:

- **Status-based workflows**: Events and Expenses use status enums
- **Approval processes**: Multi-step approvals with notifications
- **Audit trails**: All actions logged in ActivityLog
- **Notifications**: Users notified at key workflow steps
- **Data validation**: Checks for duplicates and access control


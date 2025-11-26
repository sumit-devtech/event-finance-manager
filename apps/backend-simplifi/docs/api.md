# API Documentation - Event Budget Planning System

Base URL: `http://localhost:3334/api/v1`

All endpoints require JWT authentication unless otherwise specified. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication

### Signup
**POST** `/api/v1/auth/signup`

Register a new organization with an admin user.

**Request Body:**
```json
{
  "organizationName": "Tech Corp",
  "industry": "Technology",
  "adminEmail": "admin@techcorp.com",
  "adminFullName": "Admin User",
  "adminPassword": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@techcorp.com",
    "fullName": "Admin User",
    "role": "admin",
    "organizationId": "uuid"
  }
}
```

### Login
**POST** `/api/v1/auth/login`

**Request Body:**
```json
{
  "email": "admin@techcorp.com",
  "password": "password123"
}
```

**Response:** Same as signup

### Get Current User
**GET** `/api/v1/auth/me`

Returns the current authenticated user.

---

## Organizations

### Get Organization
**GET** `/api/v1/organizations/:id`

**Response:**
```json
{
  "id": "uuid",
  "name": "Tech Corp",
  "industry": "Technology",
  "logoUrl": "https://...",
  "users": [...],
  "_count": {
    "events": 5,
    "vendors": 10,
    "subscriptions": 1
  }
}
```

### Update Organization
**PUT** `/api/v1/organizations/:id`

**Request Body:**
```json
{
  "name": "Updated Name",
  "industry": "Updated Industry",
  "logoUrl": "https://..."
}
```

### Get Organization Stats
**GET** `/api/v1/organizations/:id/stats`

**Response:**
```json
{
  "events": { "total": 5 },
  "vendors": { "total": 10 },
  "users": { "total": 8 },
  "expenses": { "totalApproved": 50000 },
  "subscription": {
    "planName": "professional",
    "status": "active",
    "currentPeriodEnd": "2025-12-23T00:00:00.000Z"
  }
}
```

---

## Users

### List Users
**GET** `/api/v1/users`

**Roles:** admin, manager

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "manager",
    "isActive": true,
    "createdAt": "2025-11-23T00:00:00.000Z"
  }
]
```

### Create User
**POST** `/api/v1/users`

**Roles:** admin

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "fullName": "New User",
  "role": "manager",
  "organizationId": "uuid" // optional, defaults to current user's org
}
```

### Invite User
**POST** `/api/v1/users/invite`

**Roles:** admin, manager

**Request Body:**
```json
{
  "email": "invite@example.com",
  "fullName": "Invited User",
  "role": "viewer"
}
```

### Get User
**GET** `/api/v1/users/:id`

**Roles:** admin, manager

### Update User
**PUT** `/api/v1/users/:id`

**Roles:** admin

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "role": "finance",
  "isActive": true
}
```

### Update User Role
**PUT** `/api/v1/users/:id/role`

**Roles:** admin

**Request Body:**
```json
{
  "role": "manager"
}
```

### Delete User (Deactivate)
**DELETE** `/api/v1/users/:id`

**Roles:** admin

---

## Subscriptions

### Get Organization Subscription
**GET** `/api/v1/organizations/:orgId/subscription`

**Roles:** admin, manager

### Create Subscription
**POST** `/api/v1/organizations/:orgId/subscription`

**Roles:** admin

**Request Body:**
```json
{
  "planName": "professional",
  "billingCycle": "monthly",
  "currentPeriodStart": "2025-11-23T00:00:00.000Z",
  "currentPeriodEnd": "2025-12-23T00:00:00.000Z"
}
```

### Update Subscription
**PUT** `/api/v1/subscriptions/:id`

**Roles:** admin

### Get Subscription History
**GET** `/api/v1/subscriptions/:id/history`

**Roles:** admin, manager

### Cancel Subscription
**POST** `/api/v1/subscriptions/:id/cancel`

**Roles:** admin

---

## Events

### List Events
**GET** `/api/v1/events?status=draft&createdBy=uuid`

**Query Parameters:**
- `status` (optional): Filter by status
- `createdBy` (optional): Filter by creator

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Tech Expo 2025",
    "location": "San Francisco",
    "startDate": "2025-06-15T00:00:00.000Z",
    "endDate": "2025-06-17T00:00:00.000Z",
    "status": "planning",
    "creator": {...},
    "_count": {
      "budgetVersions": 2,
      "expenses": 5,
      "stakeholders": 3
    }
  }
]
```

### Create Event
**POST** `/api/v1/events`

**Roles:** admin, manager

**Request Body:**
```json
{
  "name": "Tech Expo 2025",
  "location": "San Francisco Convention Center",
  "startDate": "2025-06-15T00:00:00.000Z",
  "endDate": "2025-06-17T00:00:00.000Z",
  "eventType": "Conference",
  "description": "Annual technology conference"
}
```

### Get Event
**GET** `/api/v1/events/:id`

### Update Event
**PUT** `/api/v1/events/:id`

**Roles:** admin, manager

### Update Event Status
**PUT** `/api/v1/events/:id/status`

**Roles:** admin, manager

**Request Body:**
```json
{
  "status": "planning" // draft, planning, active, completed, cancelled
}
```

### Delete Event
**DELETE** `/api/v1/events/:id`

**Roles:** admin

### Get Stakeholders
**GET** `/api/v1/events/:eventId/stakeholders`

### Add Stakeholder
**POST** `/api/v1/events/:eventId/stakeholders`

**Roles:** admin, manager

**Request Body:**
```json
{
  "name": "John Doe",
  "role": "Marketing Head",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

### Remove Stakeholder
**DELETE** `/api/v1/events/:eventId/stakeholders/:stakeholderId`

**Roles:** admin, manager

---

## Budgets

### List Budget Versions
**GET** `/api/v1/events/:eventId/budgets`

**Response:**
```json
[
  {
    "id": "uuid",
    "versionNumber": 2,
    "notes": "Final approved budget",
    "isFinal": true,
    "createdAt": "2025-11-23T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "category": "Venue",
        "itemName": "Conference Hall Rental",
        "estimatedCost": 15000,
        "actualCost": null,
        "vendor": {...}
      }
    ]
  }
]
```

### Create Budget Version
**POST** `/api/v1/events/:eventId/budgets`

**Roles:** admin, manager, finance

**Request Body:**
```json
{
  "versionNumber": 1,
  "notes": "Initial budget draft",
  "items": [
    {
      "category": "Venue",
      "itemName": "Conference Hall Rental",
      "vendorId": "uuid",
      "quantity": 3,
      "unitCost": 5000,
      "estimatedCost": 15000,
      "notes": "3-day rental"
    }
  ]
}
```

### Get Budget Version
**GET** `/api/v1/budgets/:budgetId`

### Update Budget Version
**PUT** `/api/v1/budgets/:budgetId`

**Roles:** admin, manager, finance

**Request Body:**
```json
{
  "notes": "Updated notes",
  "isFinal": false
}
```

### Finalize Budget Version
**PUT** `/api/v1/budgets/:budgetId/finalize`

**Roles:** admin, manager, finance

Marks this version as final and unmarks all other versions.

### Clone Budget Version
**POST** `/api/v1/budgets/:budgetId/clone`

**Roles:** admin, manager, finance

Creates a new version with incremented version number.

### Add Line Item
**POST** `/api/v1/budgets/:budgetId/line-items`

**Roles:** admin, manager, finance

**Request Body:**
```json
{
  "category": "Marketing",
  "itemName": "Digital Campaign",
  "vendorId": "uuid",
  "estimatedCost": 8000
}
```

### Update Line Item
**PUT** `/api/v1/budgets/line-items/:itemId`

**Roles:** admin, manager, finance

### Delete Line Item
**DELETE** `/api/v1/budgets/line-items/:itemId`

**Roles:** admin, manager, finance

---

## Expenses

### List Expenses
**GET** `/api/v1/expenses?eventId=uuid&status=approved&vendorId=uuid`

**Query Parameters:**
- `eventId` (optional)
- `status` (optional): pending, under_review, approved, rejected
- `vendorId` (optional)

### Create Expense
**POST** `/api/v1/events/:eventId/expenses`

**Roles:** admin, manager, finance

**Request Body:**
```json
{
  "title": "Venue Advance Payment",
  "amount": 7500,
  "vendorId": "uuid",
  "description": "50% advance payment",
  "budgetLineItemId": "uuid"
}
```

### Get Expense
**GET** `/api/v1/expenses/:id`

### Update Expense
**PUT** `/api/v1/expenses/:id`

**Roles:** admin, manager, finance

**Note:** Cannot update approved expenses.

### Delete Expense
**DELETE** `/api/v1/expenses/:id`

**Roles:** admin, manager, finance

**Note:** Cannot delete approved expenses.

### Submit for Approval
**POST** `/api/v1/expenses/:id/submit-approval`

**Roles:** admin, manager, finance

Creates approval workflow and notifies approvers.

### Get Approval History
**GET** `/api/v1/expenses/:id/approvals`

### Approve/Reject Expense
**POST** `/api/v1/expenses/:id/approval`

**Roles:** admin, manager, finance

**Request Body:**
```json
{
  "approverId": "uuid",
  "action": "approved", // or "rejected"
  "comments": "Approved as per contract"
}
```

---

## Vendors

### List Vendors
**GET** `/api/v1/vendors`

### Create Vendor
**POST** `/api/v1/vendors`

**Roles:** admin, manager

**Request Body:**
```json
{
  "name": "Venue Solutions",
  "serviceType": "Venue",
  "contactPerson": "John Doe",
  "email": "john@venuesolutions.com",
  "phone": "+1234567890",
  "gstNumber": "GST123456",
  "rating": 4.5
}
```

### Get Vendor
**GET** `/api/v1/vendors/:id`

### Update Vendor
**PUT** `/api/v1/vendors/:id`

**Roles:** admin, manager

### Delete Vendor
**DELETE** `/api/v1/vendors/:id`

**Roles:** admin

### Assign Vendor to Event
**POST** `/api/v1/vendors/:vendorId/events/:eventId`

**Roles:** admin, manager

### List Vendor Contracts
**GET** `/api/v1/vendors/:vendorId/contracts`

### Create Contract
**POST** `/api/v1/vendors/:vendorId/contracts`

**Roles:** admin, manager, finance

**Request Body:**
```json
{
  "eventId": "uuid",
  "amount": 15000,
  "startDate": "2025-06-15T00:00:00.000Z",
  "endDate": "2025-06-17T00:00:00.000Z",
  "terms": "50% advance, 50% on completion",
  "contractFileUrl": "https://..."
}
```

### Get Contract
**GET** `/api/v1/contracts/:id`

### Update Contract
**PUT** `/api/v1/contracts/:id`

**Roles:** admin, manager, finance

---

## CRM Sync

### Trigger Manual Sync
**POST** `/api/v1/events/:eventId/crm-sync`

**Roles:** admin, manager

**Request Body:**
```json
{
  "crmSystem": "hubspot" // or "salesforce"
}
```

### Get Sync Status
**GET** `/api/v1/events/:eventId/crm-sync`

---

## Insights

### Get Insights
**GET** `/api/v1/events/:eventId/insights`

**Response:**
```json
[
  {
    "id": "uuid",
    "insightType": "budget_variance",
    "data": {
      "message": "Actual spend is 26.0% under budget",
      "budget": 36500,
      "actual": 9500,
      "variance": -27000,
      "variancePercent": -73.97
    },
    "createdAt": "2025-11-23T00:00:00.000Z"
  }
]
```

### Generate Insights
**POST** `/api/v1/events/:eventId/insights/generate`

**Roles:** admin, manager, finance

---

## ROI

### Get ROI Metrics
**GET** `/api/v1/events/:eventId/roi`

**Response:**
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "totalBudget": 36500,
  "actualSpend": 9500,
  "leadsGenerated": 250,
  "conversions": 45,
  "revenueGenerated": 120000,
  "roiPercent": 1163.16,
  "createdAt": "2025-11-23T00:00:00.000Z"
}
```

### Calculate ROI
**POST** `/api/v1/events/:eventId/roi/calculate`

**Roles:** admin, manager, finance

---

## Reports

### List Reports
**GET** `/api/v1/events/:eventId/reports`

### Generate Report
**POST** `/api/v1/events/:eventId/reports`

**Roles:** admin, manager, finance

**Request Body:**
```json
{
  "reportType": "budget-vs-actual" // or "vendor-summary", "stakeholder-summary"
}
```

### Get Report
**GET** `/api/v1/reports/:id`

### Get Report Files
**GET** `/api/v1/reports/:id/files`

---

## Notifications

### List Notifications
**GET** `/api/v1/notifications?isRead=false&limit=50&offset=0`

**Query Parameters:**
- `isRead` (optional): true/false
- `limit` (optional): default 50
- `offset` (optional): default 0

### Get Unread Count
**GET** `/api/v1/notifications/unread`

**Response:**
```json
{
  "count": 5
}
```

### Mark as Read
**PUT** `/api/v1/notifications/:id/read`

### Mark All as Read
**PUT** `/api/v1/notifications/read-all`

---

## Activity Logs

### Get Event Activity Logs
**GET** `/api/v1/events/:eventId/activity-logs?limit=50&offset=0`

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "action": "event.created",
      "details": {...},
      "user": {...},
      "createdAt": "2025-11-23T00:00:00.000Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

### Get All Activity Logs
**GET** `/api/v1/activity-logs?limit=50&offset=0`

**Roles:** admin

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "timestamp": "2025-11-23T00:00:00.000Z",
  "path": "/api/v1/events",
  "message": "Error message here"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Role-Based Access Control

- **admin**: Full access to all resources
- **manager**: Can create/edit events, budgets, expenses, vendors
- **finance**: Can manage budgets, expenses, approve expenses
- **viewer**: Read-only access

All endpoints enforce organization-level isolation - users can only access resources from their own organization.


-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'EventManager', 'Finance', 'Viewer');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('Planning', 'Active', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "BudgetItemCategory" AS ENUM ('Venue', 'Catering', 'Marketing', 'Logistics', 'Entertainment', 'StaffTravel', 'Miscellaneous');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Info', 'Warning', 'Error', 'Success');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "BudgetItemStatus" AS ENUM ('Pending', 'Approved', 'Closed');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('Active', 'Cancelled', 'Expired');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('Monthly', 'Yearly');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "passwordHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "planName" TEXT NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionHistory" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "venue" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "eventType" TEXT,
    "type" TEXT,
    "description" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'Planning',
    "attendees" INTEGER,
    "budget" DECIMAL(10,2),
    "organizer" TEXT,
    "client" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStakeholder" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventStakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "serviceType" TEXT,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "gstNumber" TEXT,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorEvent" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicGoal" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "unit" TEXT,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'not-started',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategicGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "category" "BudgetItemCategory" NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "vendor" TEXT,
    "vendorId" TEXT,
    "estimatedCost" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "status" "BudgetItemStatus" NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "assignedUserId" TEXT,
    "strategicGoalId" TEXT,
    "lastEditedBy" TEXT,
    "lastEditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "eventId" TEXT NOT NULL,
    "category" "BudgetItemCategory",
    "budgetItemId" TEXT,
    "vendor" TEXT,
    "vendorId" TEXT,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'Pending',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalWorkflow" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "approverId" TEXT,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "insightType" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ROIMetrics" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "totalBudget" DOUBLE PRECISION,
    "actualSpend" DOUBLE PRECISION,
    "leadsGenerated" INTEGER,
    "conversions" INTEGER,
    "revenueGenerated" DOUBLE PRECISION,
    "roiPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ROIMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMSync" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "crmSystem" TEXT,
    "syncStatus" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "reportType" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "budgetItemId" TEXT,
    "expenseId" TEXT,
    "reportId" TEXT,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT NOT NULL,
    "eventId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiBudgetSuggestion" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "category" "BudgetItemCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "suggestedCost" DECIMAL(10,2) NOT NULL,
    "reasoning" TEXT,
    "confidence" DOUBLE PRECISION,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiBudgetSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_isActive_idx" ON "User"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_status_idx" ON "Subscription"("organizationId", "status");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_subscriptionId_idx" ON "SubscriptionHistory"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_changedBy_idx" ON "SubscriptionHistory"("changedBy");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_action_idx" ON "SubscriptionHistory"("action");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_changedAt_idx" ON "SubscriptionHistory"("changedAt");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_subscriptionId_changedAt_idx" ON "SubscriptionHistory"("subscriptionId", "changedAt");

-- CreateIndex
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");

-- CreateIndex
CREATE INDEX "Event_organizationId_status_idx" ON "Event"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_organizationId_status_startDate_idx" ON "Event"("organizationId", "status", "startDate");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_endDate_idx" ON "Event"("endDate");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_organizationId_startDate_idx" ON "Event"("organizationId", "startDate");

-- CreateIndex
CREATE INDEX "Event_organizationId_createdAt_idx" ON "Event"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "EventAssignment_userId_idx" ON "EventAssignment"("userId");

-- CreateIndex
CREATE INDEX "EventAssignment_eventId_idx" ON "EventAssignment"("eventId");

-- CreateIndex
CREATE INDEX "EventAssignment_eventId_role_idx" ON "EventAssignment"("eventId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "EventAssignment_userId_eventId_key" ON "EventAssignment"("userId", "eventId");

-- CreateIndex
CREATE INDEX "EventStakeholder_eventId_idx" ON "EventStakeholder"("eventId");

-- CreateIndex
CREATE INDEX "EventStakeholder_email_idx" ON "EventStakeholder"("email");

-- CreateIndex
CREATE INDEX "EventStakeholder_eventId_email_idx" ON "EventStakeholder"("eventId", "email");

-- CreateIndex
CREATE INDEX "Vendor_organizationId_idx" ON "Vendor"("organizationId");

-- CreateIndex
CREATE INDEX "Vendor_name_idx" ON "Vendor"("name");

-- CreateIndex
CREATE INDEX "Vendor_email_idx" ON "Vendor"("email");

-- CreateIndex
CREATE INDEX "Vendor_organizationId_name_idx" ON "Vendor"("organizationId", "name");

-- CreateIndex
CREATE INDEX "VendorEvent_vendorId_idx" ON "VendorEvent"("vendorId");

-- CreateIndex
CREATE INDEX "VendorEvent_eventId_idx" ON "VendorEvent"("eventId");

-- CreateIndex
CREATE INDEX "VendorEvent_assignedAt_idx" ON "VendorEvent"("assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VendorEvent_vendorId_eventId_key" ON "VendorEvent"("vendorId", "eventId");

-- CreateIndex
CREATE INDEX "StrategicGoal_eventId_idx" ON "StrategicGoal"("eventId");

-- CreateIndex
CREATE INDEX "StrategicGoal_status_idx" ON "StrategicGoal"("status");

-- CreateIndex
CREATE INDEX "StrategicGoal_priority_idx" ON "StrategicGoal"("priority");

-- CreateIndex
CREATE INDEX "StrategicGoal_deadline_idx" ON "StrategicGoal"("deadline");

-- CreateIndex
CREATE INDEX "StrategicGoal_eventId_status_idx" ON "StrategicGoal"("eventId", "status");

-- CreateIndex
CREATE INDEX "StrategicGoal_eventId_priority_idx" ON "StrategicGoal"("eventId", "priority");

-- CreateIndex
CREATE INDEX "BudgetItem_eventId_idx" ON "BudgetItem"("eventId");

-- CreateIndex
CREATE INDEX "BudgetItem_category_idx" ON "BudgetItem"("category");

-- CreateIndex
CREATE INDEX "BudgetItem_vendorId_idx" ON "BudgetItem"("vendorId");

-- CreateIndex
CREATE INDEX "BudgetItem_eventId_category_idx" ON "BudgetItem"("eventId", "category");

-- CreateIndex
CREATE INDEX "BudgetItem_status_idx" ON "BudgetItem"("status");

-- CreateIndex
CREATE INDEX "BudgetItem_assignedUserId_idx" ON "BudgetItem"("assignedUserId");

-- CreateIndex
CREATE INDEX "BudgetItem_strategicGoalId_idx" ON "BudgetItem"("strategicGoalId");

-- CreateIndex
CREATE INDEX "BudgetItem_createdAt_idx" ON "BudgetItem"("createdAt");

-- CreateIndex
CREATE INDEX "BudgetItem_eventId_status_idx" ON "BudgetItem"("eventId", "status");

-- CreateIndex
CREATE INDEX "BudgetItem_eventId_category_status_idx" ON "BudgetItem"("eventId", "category", "status");

-- CreateIndex
CREATE INDEX "Expense_organizationId_idx" ON "Expense"("organizationId");

-- CreateIndex
CREATE INDEX "Expense_eventId_status_idx" ON "Expense"("eventId", "status");

-- CreateIndex
CREATE INDEX "Expense_eventId_status_createdAt_idx" ON "Expense"("eventId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_budgetItemId_idx" ON "Expense"("budgetItemId");

-- CreateIndex
CREATE INDEX "Expense_eventId_category_idx" ON "Expense"("eventId", "category");

-- CreateIndex
CREATE INDEX "Expense_createdBy_idx" ON "Expense"("createdBy");

-- CreateIndex
CREATE INDEX "Expense_createdAt_idx" ON "Expense"("createdAt");

-- CreateIndex
CREATE INDEX "Expense_vendorId_idx" ON "Expense"("vendorId");

-- CreateIndex
CREATE INDEX "Expense_organizationId_status_idx" ON "Expense"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Expense_organizationId_eventId_status_idx" ON "Expense"("organizationId", "eventId", "status");

-- CreateIndex
CREATE INDEX "Expense_eventId_createdAt_idx" ON "Expense"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_expenseId_idx" ON "ApprovalWorkflow"("expenseId");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_approverId_idx" ON "ApprovalWorkflow"("approverId");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_action_idx" ON "ApprovalWorkflow"("action");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_actionAt_idx" ON "ApprovalWorkflow"("actionAt");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_expenseId_actionAt_idx" ON "ApprovalWorkflow"("expenseId", "actionAt");

-- CreateIndex
CREATE INDEX "ApprovalWorkflow_approverId_actionAt_idx" ON "ApprovalWorkflow"("approverId", "actionAt");

-- CreateIndex
CREATE INDEX "Insight_eventId_idx" ON "Insight"("eventId");

-- CreateIndex
CREATE INDEX "Insight_insightType_idx" ON "Insight"("insightType");

-- CreateIndex
CREATE UNIQUE INDEX "ROIMetrics_eventId_key" ON "ROIMetrics"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMSync_eventId_key" ON "CRMSync"("eventId");

-- CreateIndex
CREATE INDEX "Report_eventId_idx" ON "Report"("eventId");

-- CreateIndex
CREATE INDEX "Report_createdBy_idx" ON "Report"("createdBy");

-- CreateIndex
CREATE INDEX "Report_reportType_idx" ON "Report"("reportType");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Report_eventId_reportType_idx" ON "Report"("eventId", "reportType");

-- CreateIndex
CREATE INDEX "Report_eventId_createdAt_idx" ON "Report"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "File_eventId_idx" ON "File"("eventId");

-- CreateIndex
CREATE INDEX "File_budgetItemId_idx" ON "File"("budgetItemId");

-- CreateIndex
CREATE INDEX "File_expenseId_idx" ON "File"("expenseId");

-- CreateIndex
CREATE INDEX "File_reportId_idx" ON "File"("reportId");

-- CreateIndex
CREATE INDEX "File_uploadedAt_idx" ON "File"("uploadedAt");

-- CreateIndex
CREATE INDEX "File_mimeType_idx" ON "File"("mimeType");

-- CreateIndex
CREATE INDEX "File_eventId_uploadedAt_idx" ON "File"("eventId", "uploadedAt");

-- CreateIndex
CREATE INDEX "File_expenseId_uploadedAt_idx" ON "File"("expenseId", "uploadedAt");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_organizationId_read_idx" ON "Notification"("organizationId", "read");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_organizationId_read_createdAt_idx" ON "Notification"("organizationId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_type_idx" ON "Notification"("userId", "type");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_idx" ON "ActivityLog"("organizationId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_eventId_idx" ON "ActivityLog"("eventId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_createdAt_idx" ON "ActivityLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_userId_idx" ON "ActivityLog"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_userId_createdAt_idx" ON "ActivityLog"("organizationId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_eventId_createdAt_idx" ON "ActivityLog"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_eventId_createdAt_idx" ON "ActivityLog"("organizationId", "eventId", "createdAt");

-- CreateIndex
CREATE INDEX "AiBudgetSuggestion_eventId_idx" ON "AiBudgetSuggestion"("eventId");

-- CreateIndex
CREATE INDEX "AiBudgetSuggestion_accepted_idx" ON "AiBudgetSuggestion"("accepted");

-- CreateIndex
CREATE INDEX "AiBudgetSuggestion_category_idx" ON "AiBudgetSuggestion"("category");

-- CreateIndex
CREATE INDEX "AiBudgetSuggestion_createdAt_idx" ON "AiBudgetSuggestion"("createdAt");

-- CreateIndex
CREATE INDEX "AiBudgetSuggestion_eventId_accepted_idx" ON "AiBudgetSuggestion"("eventId", "accepted");

-- CreateIndex
CREATE INDEX "AiBudgetSuggestion_eventId_category_idx" ON "AiBudgetSuggestion"("eventId", "category");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStakeholder" ADD CONSTRAINT "EventStakeholder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorEvent" ADD CONSTRAINT "VendorEvent_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorEvent" ADD CONSTRAINT "VendorEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicGoal" ADD CONSTRAINT "StrategicGoal_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_strategicGoalId_fkey" FOREIGN KEY ("strategicGoalId") REFERENCES "StrategicGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "BudgetItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ROIMetrics" ADD CONSTRAINT "ROIMetrics_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMSync" ADD CONSTRAINT "CRMSync_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "BudgetItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiBudgetSuggestion" ADD CONSTRAINT "AiBudgetSuggestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

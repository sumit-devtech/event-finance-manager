-- CreateTable: DashboardMetrics
CREATE TABLE "DashboardMetrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "totalBudget" DECIMAL(10,2),
    "totalExpenses" DECIMAL(10,2),
    "pendingApprovals" INTEGER NOT NULL DEFAULT 0,
    "overBudgetEvents" INTEGER NOT NULL DEFAULT 0,
    "upcomingEvents" INTEGER NOT NULL DEFAULT 0,
    "recentEvents" JSONB,
    "chartsJson" JSONB,
    "statsJson" JSONB,
    "lastComputedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable: EventMetrics
CREATE TABLE "EventMetrics" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "organizationId" TEXT,
    "totalBudget" DECIMAL(10,2),
    "totalSpent" DECIMAL(10,2),
    "totalEstimated" DECIMAL(10,2),
    "totalActual" DECIMAL(10,2),
    "variance" DECIMAL(10,2),
    "variancePercentage" DOUBLE PRECISION,
    "isOverBudget" BOOLEAN NOT NULL DEFAULT false,
    "totalsByCategory" JSONB,
    "pendingExpensesCount" INTEGER NOT NULL DEFAULT 0,
    "approvedExpensesCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedExpensesCount" INTEGER NOT NULL DEFAULT 0,
    "budgetItemsCount" INTEGER NOT NULL DEFAULT 0,
    "lastComputedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable: VendorMetrics
CREATE TABLE "VendorMetrics" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "organizationId" TEXT,
    "totalContracts" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(10,2),
    "eventsCount" INTEGER NOT NULL DEFAULT 0,
    "lastContractDate" TIMESTAMP(3),
    "lastComputedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: DashboardMetrics.organizationId
CREATE UNIQUE INDEX "DashboardMetrics_organizationId_key" ON "DashboardMetrics"("organizationId");

-- CreateIndex: DashboardMetrics.organizationId
CREATE INDEX "DashboardMetrics_organizationId_idx" ON "DashboardMetrics"("organizationId");

-- CreateIndex: EventMetrics.eventId
CREATE UNIQUE INDEX "EventMetrics_eventId_key" ON "EventMetrics"("eventId");

-- CreateIndex: EventMetrics.eventId
CREATE INDEX "EventMetrics_eventId_idx" ON "EventMetrics"("eventId");

-- CreateIndex: EventMetrics.organizationId
CREATE INDEX "EventMetrics_organizationId_idx" ON "EventMetrics"("organizationId");

-- CreateIndex: EventMetrics.eventId_organizationId
CREATE INDEX "EventMetrics_eventId_organizationId_idx" ON "EventMetrics"("eventId", "organizationId");

-- CreateIndex: VendorMetrics.vendorId
CREATE UNIQUE INDEX "VendorMetrics_vendorId_key" ON "VendorMetrics"("vendorId");

-- CreateIndex: VendorMetrics.vendorId
CREATE INDEX "VendorMetrics_vendorId_idx" ON "VendorMetrics"("vendorId");

-- CreateIndex: VendorMetrics.organizationId
CREATE INDEX "VendorMetrics_organizationId_idx" ON "VendorMetrics"("organizationId");

-- CreateIndex: VendorMetrics.vendorId_organizationId
CREATE INDEX "VendorMetrics_vendorId_organizationId_idx" ON "VendorMetrics"("vendorId", "organizationId");

-- AddForeignKey: DashboardMetrics.organizationId -> Organization.id
ALTER TABLE "DashboardMetrics" ADD CONSTRAINT "DashboardMetrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: EventMetrics.eventId -> Event.id
ALTER TABLE "EventMetrics" ADD CONSTRAINT "EventMetrics_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: VendorMetrics.vendorId -> Vendor.id
ALTER TABLE "VendorMetrics" ADD CONSTRAINT "VendorMetrics_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;


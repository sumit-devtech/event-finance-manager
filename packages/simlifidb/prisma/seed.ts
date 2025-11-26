import { prismaSimplifi as prisma } from "../src/client";
import * as bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding Simplifi database...");
  console.log("📡 Connecting to database...");

  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw error;
  }

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("\n🧹 Cleaning existing data...");
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.file.deleteMany();
  await prisma.report.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.rOIMetrics.deleteMany();
  await prisma.crmSync.deleteMany();
  await prisma.approvalWorkflow.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budgetLineItem.deleteMany();
  await prisma.budgetVersion.deleteMany();
  await prisma.vendorContract.deleteMany();
  await prisma.vendorEvent.deleteMany();
  await prisma.eventStakeholder.deleteMany();
  await prisma.event.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.subscriptionHistory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("✅ Data cleaned");

  // Create Organizations
  console.log("\n📦 Creating organizations...");
  const org1 = await prisma.organization.create({
    data: {
      name: "Tech Corp",
      industry: "Technology",
      logoUrl: "https://example.com/logo1.png",
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Marketing Solutions Inc",
      industry: "Marketing",
    },
  });

  console.log(`✅ Created ${2} organizations`);

  // Create Users
  console.log("\n👥 Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin1 = await prisma.user.create({
    data: {
      email: "admin@techcorp.com",
      fullName: "Admin User",
      role: "admin",
      passwordHash,
      organizationId: org1.id,
      isActive: true,
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: "manager@techcorp.com",
      fullName: "Manager User",
      role: "manager",
      passwordHash,
      organizationId: org1.id,
      isActive: true,
    },
  });

  const finance1 = await prisma.user.create({
    data: {
      email: "finance@techcorp.com",
      fullName: "Finance User",
      role: "finance",
      passwordHash,
      organizationId: org1.id,
      isActive: true,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: "admin@marketing.com",
      fullName: "Marketing Admin",
      role: "admin",
      passwordHash,
      organizationId: org2.id,
      isActive: true,
    },
  });

  console.log(`✅ Created ${4} users`);

  // Create Subscriptions
  console.log("\n💳 Creating subscriptions...");
  const sub1 = await prisma.subscription.create({
    data: {
      organizationId: org1.id,
      planName: "professional",
      billingCycle: "monthly",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: sub1.id,
      action: "create",
      newValue: { planName: "professional", billingCycle: "monthly" },
      changedBy: admin1.id,
    },
  });

  console.log(`✅ Created ${1} subscription`);

  // Create Vendors
  console.log("\n🏢 Creating vendors...");
  const vendor1 = await prisma.vendor.create({
    data: {
      organizationId: org1.id,
      name: "Venue Solutions",
      serviceType: "Venue",
      contactPerson: "John Doe",
      email: "john@venuesolutions.com",
      phone: "+1234567890",
      rating: 4.5,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      organizationId: org1.id,
      name: "Catering Express",
      serviceType: "Catering",
      contactPerson: "Jane Smith",
      email: "jane@cateringexpress.com",
      phone: "+1234567891",
      rating: 4.8,
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      organizationId: org1.id,
      name: "Event Marketing Pro",
      serviceType: "Marketing",
      contactPerson: "Bob Johnson",
      email: "bob@eventmarketing.com",
      rating: 4.2,
    },
  });

  console.log(`✅ Created ${3} vendors`);

  // Create Events
  console.log("\n🎉 Creating events...");
  const event1 = await prisma.event.create({
    data: {
      organizationId: org1.id,
      name: "Tech Expo 2025",
      location: "San Francisco Convention Center",
      startDate: new Date("2025-06-15"),
      endDate: new Date("2025-06-17"),
      eventType: "Conference",
      description: "Annual technology conference showcasing latest innovations",
      status: "planning",
      createdBy: admin1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      organizationId: org1.id,
      name: "Product Launch Event",
      location: "New York",
      startDate: new Date("2025-03-20"),
      endDate: new Date("2025-03-20"),
      eventType: "Launch",
      status: "draft",
      createdBy: manager1.id,
    },
  });

  console.log(`✅ Created ${2} events`);

  // Create Stakeholders
  console.log("\n👤 Creating stakeholders...");
  await prisma.eventStakeholder.create({
    data: {
      eventId: event1.id,
      name: "Marketing Head",
      role: "Stakeholder",
      email: "marketing@techcorp.com",
      phone: "+1234567892",
    },
  });

  await prisma.eventStakeholder.create({
    data: {
      eventId: event1.id,
      name: "Finance Director",
      role: "Finance",
      email: "finance@techcorp.com",
    },
  });

  console.log(`✅ Created ${2} stakeholders`);

  // Create Budget Versions
  console.log("\n💰 Creating budget versions...");
  const budget1 = await prisma.budgetVersion.create({
    data: {
      eventId: event1.id,
      versionNumber: 1,
      notes: "Initial budget draft",
      createdBy: manager1.id,
      isFinal: false,
    },
  });

  await prisma.budgetLineItem.createMany({
    data: [
      {
        budgetVersionId: budget1.id,
        category: "Venue",
        itemName: "Conference Hall Rental",
        vendorId: vendor1.id,
        quantity: 3,
        unitCost: 5000,
        estimatedCost: 15000,
        notes: "3-day rental",
      },
      {
        budgetVersionId: budget1.id,
        category: "Catering",
        itemName: "Lunch & Coffee Breaks",
        vendorId: vendor2.id,
        quantity: 300,
        unitCost: 25,
        estimatedCost: 7500,
      },
      {
        budgetVersionId: budget1.id,
        category: "Marketing",
        itemName: "Digital Marketing Campaign",
        vendorId: vendor3.id,
        estimatedCost: 8000,
      },
      {
        budgetVersionId: budget1.id,
        category: "Logistics",
        itemName: "Audio/Visual Equipment",
        estimatedCost: 5000,
      },
    ],
  });

  const budget2 = await prisma.budgetVersion.create({
    data: {
      eventId: event1.id,
      versionNumber: 2,
      notes: "Final approved budget",
      createdBy: admin1.id,
      isFinal: true,
    },
  });

  await prisma.budgetLineItem.createMany({
    data: [
      {
        budgetVersionId: budget2.id,
        category: "Venue",
        itemName: "Conference Hall Rental",
        vendorId: vendor1.id,
        quantity: 3,
        unitCost: 5000,
        estimatedCost: 15000,
      },
      {
        budgetVersionId: budget2.id,
        category: "Catering",
        itemName: "Lunch & Coffee Breaks",
        vendorId: vendor2.id,
        quantity: 300,
        unitCost: 25,
        estimatedCost: 7500,
      },
      {
        budgetVersionId: budget2.id,
        category: "Marketing",
        itemName: "Digital Marketing Campaign",
        vendorId: vendor3.id,
        estimatedCost: 8500,
      },
      {
        budgetVersionId: budget2.id,
        category: "Logistics",
        itemName: "Audio/Visual Equipment",
        estimatedCost: 5500,
      },
    ],
  });

  console.log(`✅ Created ${2} budget versions with line items`);

  // Assign Vendors to Events
  console.log("\n🔗 Assigning vendors to events...");
  await prisma.vendorEvent.createMany({
    data: [
      { vendorId: vendor1.id, eventId: event1.id },
      { vendorId: vendor2.id, eventId: event1.id },
      { vendorId: vendor3.id, eventId: event1.id },
    ],
  });

  console.log(`✅ Assigned ${3} vendors to events`);

  // Create Vendor Contracts
  console.log("\n📄 Creating vendor contracts...");
  await prisma.vendorContract.create({
    data: {
      vendorId: vendor1.id,
      eventId: event1.id,
      amount: 15000,
      startDate: new Date("2025-06-15"),
      endDate: new Date("2025-06-17"),
      terms: "50% advance, 50% on completion",
      contractFileUrl: "https://example.com/contracts/venue-contract.pdf",
    },
  });

  console.log(`✅ Created ${1} vendor contract`);

  // Create Expenses
  console.log("\n💸 Creating expenses...");
  const expense1 = await prisma.expense.create({
    data: {
      eventId: event1.id,
      vendorId: vendor1.id,
      title: "Venue Advance Payment",
      amount: 7500,
      description: "50% advance payment for venue booking",
      status: "approved",
      createdBy: finance1.id,
    },
  });

  const expense2 = await prisma.expense.create({
    data: {
      eventId: event1.id,
      vendorId: vendor2.id,
      title: "Catering Deposit",
      amount: 2000,
      description: "Initial deposit for catering services",
      status: "approved",
      createdBy: finance1.id,
    },
  });

  const expense3 = await prisma.expense.create({
    data: {
      eventId: event1.id,
      title: "Marketing Materials",
      amount: 1500,
      description: "Printing and promotional materials",
      status: "pending",
      createdBy: manager1.id,
    },
  });

  console.log(`✅ Created ${3} expenses`);

  // Create Approval Workflows
  console.log("\n✅ Creating approval workflows...");
  await prisma.approvalWorkflow.create({
    data: {
      expenseId: expense1.id,
      approverId: admin1.id,
      action: "approved",
      comments: "Approved - advance payment as per contract",
    },
  });

  await prisma.approvalWorkflow.create({
    data: {
      expenseId: expense2.id,
      approverId: admin1.id,
      action: "approved",
      comments: "Approved",
    },
  });

  console.log(`✅ Created ${2} approval workflows`);

  // Create ROI Metrics
  console.log("\n📊 Creating ROI metrics...");
  await prisma.rOIMetrics.create({
    data: {
      eventId: event1.id,
      totalBudget: 36500,
      actualSpend: 9500,
      leadsGenerated: 250,
      conversions: 45,
      revenueGenerated: 120000,
      roiPercent: 1163.16, // ((120000 - 9500) / 9500) * 100
    },
  });

  console.log(`✅ Created ROI metrics`);

  // Create CRM Sync
  console.log("\n🔄 Creating CRM sync records...");
  await prisma.crmSync.create({
    data: {
      eventId: event1.id,
      crmSystem: "hubspot",
      syncStatus: "success",
      lastSyncedAt: new Date(),
      data: {
        leadsGenerated: 250,
        conversions: 45,
        revenueGenerated: 120000,
        syncedAt: new Date().toISOString(),
      },
    },
  });

  console.log(`✅ Created CRM sync record`);

  // Create Insights
  console.log("\n💡 Creating insights...");
  await prisma.insight.create({
    data: {
      eventId: event1.id,
      insightType: "budget_variance",
      data: {
        message: "Actual spend is 26.0% under budget",
        budget: 36500,
        actual: 9500,
        variance: -27000,
        variancePercent: -73.97,
      },
    },
  });

  console.log(`✅ Created ${1} insight`);

  // Create Reports
  console.log("\n📋 Creating reports...");
  const report1 = await prisma.report.create({
    data: {
      eventId: event1.id,
      reportType: "budget-vs-actual",
      createdBy: admin1.id,
    },
  });

  await prisma.file.create({
    data: {
      reportId: report1.id,
      fileUrl: "https://example.com/reports/budget-vs-actual.pdf",
      fileType: "pdf",
    },
  });

  console.log(`✅ Created ${1} report with file`);

  // Create Notifications
  console.log("\n🔔 Creating notifications...");
  await prisma.notification.createMany({
    data: [
      {
        userId: admin1.id,
        title: "New Expense Approval Required",
        message: "You have a new expense 'Marketing Materials' awaiting your approval.",
        isRead: false,
      },
      {
        userId: manager1.id,
        title: "Budget Version Finalized",
        message: "Budget Version 2 has been finalized for Tech Expo 2025",
        isRead: false,
      },
    ],
  });

  console.log(`✅ Created ${2} notifications`);

  // Create Activity Logs
  console.log("\n📝 Creating activity logs...");
  await prisma.activityLog.createMany({
    data: [
      {
        eventId: event1.id,
        userId: admin1.id,
        action: "event.created",
        details: { eventName: "Tech Expo 2025" },
      },
      {
        eventId: event1.id,
        userId: manager1.id,
        action: "budget.created",
        details: { budgetVersionId: budget1.id, versionNumber: 1 },
      },
      {
        eventId: event1.id,
        userId: admin1.id,
        action: "budget.finalized",
        details: { budgetVersionId: budget2.id, versionNumber: 2 },
      },
      {
        eventId: event1.id,
        userId: finance1.id,
        action: "expense.created",
        details: { expenseId: expense1.id, title: "Venue Advance Payment" },
      },
    ],
  });

  console.log(`✅ Created ${4} activity logs`);

  console.log("\n✨ Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Organizations: 2`);
  console.log(`   - Users: 4`);
  console.log(`   - Subscriptions: 1`);
  console.log(`   - Vendors: 3`);
  console.log(`   - Events: 2`);
  console.log(`   - Budget Versions: 2`);
  console.log(`   - Expenses: 3`);
  console.log(`   - ROI Metrics: 1`);
  console.log(`\n🔑 Test Credentials:`);
  console.log(`   Admin: admin@techcorp.com / password123`);
  console.log(`   Manager: manager@techcorp.com / password123`);
  console.log(`   Finance: finance@techcorp.com / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


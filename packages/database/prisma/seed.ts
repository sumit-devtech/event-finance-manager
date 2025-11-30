import { PrismaClient, UserRole, EventStatus, BudgetItemCategory, ExpenseStatus } from "../src/generated/prisma-database";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with comprehensive demo data...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  // Delete in order to respect foreign key constraints (most dependent first)
  console.log("🧹 Cleaning existing data...");
  await prisma.approvalWorkflow.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.file.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.eventAssignment.deleteMany();
  await prisma.eventStakeholder.deleteMany();
  await prisma.vendorEvent.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.rOIMetrics.deleteMany();
  await prisma.cRMSync.deleteMany();
  await prisma.aiBudgetSuggestion.deleteMany();
  await prisma.event.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.subscriptionHistory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: "Demo Organization",
      industry: "Technology",
    },
  });

  console.log("✅ Created organization:", organization.name);

  // Create users with different roles
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      fullName: "Admin User",
      email: "admin@demo.com",
      role: UserRole.Admin,
      passwordHash,
      isActive: true,
    },
  });

  const eventManager = await prisma.user.create({
    data: {
      organizationId: organization.id,
      fullName: "Sarah Johnson",
      email: "sarah@demo.com",
      role: UserRole.EventManager,
      passwordHash,
      isActive: true,
    },
  });

  const finance = await prisma.user.create({
    data: {
      organizationId: organization.id,
      fullName: "Mike Davis",
      email: "mike@demo.com",
      role: UserRole.Finance,
      passwordHash,
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      organizationId: organization.id,
      fullName: "Emily Chen",
      email: "emily@demo.com",
      role: UserRole.Viewer,
      passwordHash,
      isActive: true,
    },
  });

  console.log("✅ Created users:", [admin.email, eventManager.email, finance.email, viewer.email].join(", "));

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      planName: "professional",
      billingCycle: "Monthly",
      status: "Active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log("✅ Created subscription:", subscription.planName);

  // Create vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        organizationId: organization.id,
        name: "Grand Convention Center",
        serviceType: "Venue",
        contactPerson: "John Smith",
        email: "bookings@grandconvention.com",
        phone: "+1 (555) 123-4567",
        rating: 4.8,
      },
    }),
    prisma.vendor.create({
      data: {
        organizationId: organization.id,
        name: "Premium Catering Co.",
        serviceType: "Catering",
        contactPerson: "Jane Doe",
        email: "info@premiumcatering.com",
        phone: "+1 (555) 234-5678",
        rating: 4.6,
      },
    }),
    prisma.vendor.create({
      data: {
        organizationId: organization.id,
        name: "AdTech Solutions",
        serviceType: "Marketing",
        contactPerson: "Bob Wilson",
        email: "sales@adtech.com",
        phone: "+1 (555) 345-6789",
        rating: 4.7,
      },
    }),
    prisma.vendor.create({
      data: {
        organizationId: organization.id,
        name: "Tech Events Pro",
        serviceType: "Technology",
        contactPerson: "Alice Brown",
        email: "contact@techevents.com",
        phone: "+1 (555) 456-7890",
        rating: 4.9,
      },
    }),
    prisma.vendor.create({
      data: {
        organizationId: organization.id,
        name: "Entertainment Plus",
        serviceType: "Entertainment",
        contactPerson: "Charlie Green",
        email: "bookings@entertainmentplus.com",
        phone: "+1 (555) 567-8901",
        rating: 4.5,
      },
    }),
  ]);

  console.log("✅ Created vendors:", vendors.length);

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Annual Tech Conference 2024",
        location: "San Francisco, CA",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-17"),
        eventType: "conference",
        description: "Annual technology conference featuring keynote speakers and workshops",
        status: EventStatus.Active,
        createdBy: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Product Launch Event",
        location: "New York, NY",
        startDate: new Date("2024-03-20"),
        eventType: "launch",
        description: "Launching our new product line with media and influencers",
        status: EventStatus.Planning,
        createdBy: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Team Building Retreat",
        location: "Lake Tahoe, NV",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-04-03"),
        eventType: "retreat",
        description: "Company-wide team building activities and workshops",
        status: EventStatus.Planning,
        createdBy: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Annual Gala",
        location: "Chicago, IL",
        startDate: new Date("2024-02-28"),
        endDate: new Date("2024-02-28"),
        eventType: "gala",
        description: "Annual company gala with dinner and entertainment",
        status: EventStatus.Active,
        createdBy: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Workshop Series",
        location: "Seattle, WA",
        startDate: new Date("2024-01-20"),
        endDate: new Date("2024-01-22"),
        eventType: "workshop",
        description: "Educational workshop series for team development",
        status: EventStatus.Completed,
        createdBy: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Summer Networking Mixer",
        location: "Miami, FL",
        startDate: new Date("2024-06-15"),
        eventType: "networking",
        description: "Networking event for industry professionals",
        status: EventStatus.Planning,
        createdBy: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Client Appreciation Dinner",
        location: "Boston, MA",
        startDate: new Date("2024-04-10"),
        endDate: new Date("2024-04-10"),
        eventType: "dinner",
        description: "Exclusive dinner for top clients",
        status: EventStatus.Active,
        createdBy: finance.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Training Seminar",
        location: "Austin, TX",
        startDate: new Date("2024-03-25"),
        endDate: new Date("2024-03-25"),
        eventType: "seminar",
        description: "Professional development training session",
        status: EventStatus.Active,
        createdBy: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Charity Fundraiser",
        location: "Los Angeles, CA",
        startDate: new Date("2024-05-20"),
        endDate: new Date("2024-05-20"),
        eventType: "fundraiser",
        description: "Annual charity fundraising event",
        status: EventStatus.Planning,
        createdBy: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        organizationId: organization.id,
        name: "Industry Summit",
        location: "Las Vegas, NV",
        startDate: new Date("2024-04-05"),
        endDate: new Date("2024-04-07"),
        eventType: "summit",
        description: "Multi-day industry summit with panels and networking",
        status: EventStatus.Active,
        createdBy: eventManager.id,
      },
    }),
  ]);

  console.log("✅ Created events:", events.length);

  // Create event assignments
  await Promise.all([
    prisma.eventAssignment.create({
      data: {
        userId: eventManager.id,
        eventId: events[0].id,
        role: "Lead Organizer",
      },
    }),
    prisma.eventAssignment.create({
      data: {
        userId: finance.id,
        eventId: events[0].id,
        role: "Budget Manager",
      },
    }),
    prisma.eventAssignment.create({
      data: {
        userId: eventManager.id,
        eventId: events[1].id,
        role: "Event Coordinator",
      },
    }),
  ]);

  console.log("✅ Created event assignments");

  // Create stakeholders
  await Promise.all([
    prisma.eventStakeholder.create({
      data: {
        eventId: events[0].id,
        name: "Tech Corp",
        role: "Client",
        email: "contact@techcorp.com",
        phone: "+1 (555) 111-2222",
      },
    }),
    prisma.eventStakeholder.create({
      data: {
        eventId: events[0].id,
        name: "Keynote Speaker",
        role: "Speaker",
        email: "speaker@example.com",
      },
    }),
  ]);

  console.log("✅ Created stakeholders");

  // Create budget items across multiple events for better dashboard visualization
  const budgetItems = await Promise.all([
    // Budget items for Annual Tech Conference (Event 0)
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Venue,
        description: "Conference Hall Rental",
        vendor: "Grand Convention Center",
        vendorId: vendors[0].id,
        estimatedCost: 45000,
        actualCost: 45000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Catering,
        description: "Lunch & Refreshments (500 pax)",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 25000,
        actualCost: 24000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Marketing,
        description: "Digital Marketing Campaign",
        vendor: "AdTech Solutions",
        vendorId: vendors[2].id,
        estimatedCost: 15000,
        actualCost: 12000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Entertainment,
        description: "Keynote Speaker Fee",
        vendor: "Speaker Bureau Inc.",
        estimatedCost: 20000,
        actualCost: 20000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Logistics,
        description: "AV Equipment & Setup",
        vendor: "Tech Events Pro",
        vendorId: vendors[3].id,
        estimatedCost: 12000,
        actualCost: 10500,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Miscellaneous,
        description: "Event Staff (20 people)",
        vendor: "EventStaff Plus",
        estimatedCost: 8000,
        actualCost: 7200,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Logistics,
        description: "Transportation & Shuttle Service",
        vendor: "Transport Co",
        estimatedCost: 5000,
        actualCost: 4800,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[0].id,
        category: BudgetItemCategory.Miscellaneous,
        description: "Event Decorations & Signage",
        vendor: "Design Studio",
        estimatedCost: 8000,
        actualCost: 0,
      },
    }),
    // Budget items for Product Launch Event (Event 1)
    prisma.budgetItem.create({
      data: {
        eventId: events[1].id,
        category: BudgetItemCategory.Venue,
        description: "Event Space Rental",
        vendor: "Hudson Yards",
        estimatedCost: 20000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[1].id,
        category: BudgetItemCategory.Marketing,
        description: "Press Release Distribution",
        vendor: "PR Newswire",
        estimatedCost: 3500,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[1].id,
        category: BudgetItemCategory.Catering,
        description: "Coffee & Snacks Setup",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 2500,
        actualCost: 2500,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[1].id,
        category: BudgetItemCategory.Logistics,
        description: "Event App Development",
        vendor: "App Developers",
        estimatedCost: 12000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[1].id,
        category: BudgetItemCategory.Marketing,
        description: "Social Media Influencer Campaign",
        vendor: "Influencer Agency",
        estimatedCost: 10000,
        actualCost: 0,
      },
    }),
    // Budget items for Team Building Retreat (Event 2)
    prisma.budgetItem.create({
      data: {
        eventId: events[2].id,
        category: BudgetItemCategory.Venue,
        description: "Mountain Resort Accommodation",
        vendor: "Mountain Resort",
        estimatedCost: 15000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[2].id,
        category: BudgetItemCategory.Catering,
        description: "Meals for 3 Days",
        vendor: "Resort Catering",
        estimatedCost: 8000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[2].id,
        category: BudgetItemCategory.Entertainment,
        description: "Team Building Activities",
        vendor: "Adventure Co",
        estimatedCost: 5000,
        actualCost: 0,
      },
    }),
    // Budget items for Annual Gala (Event 3)
    prisma.budgetItem.create({
      data: {
        eventId: events[3].id,
        category: BudgetItemCategory.Venue,
        description: "Ballroom Rental",
        vendor: "Grand Ballroom",
        estimatedCost: 25000,
        actualCost: 25000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[3].id,
        category: BudgetItemCategory.Catering,
        description: "Fine Dining Service (350 pax)",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 35000,
        actualCost: 32000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[3].id,
        category: BudgetItemCategory.Entertainment,
        description: "Live Band Performance",
        vendor: "Entertainment Plus",
        vendorId: vendors[4].id,
        estimatedCost: 8000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[3].id,
        category: BudgetItemCategory.Miscellaneous,
        description: "Event Photography & Videography",
        vendor: "Photo Pro",
        estimatedCost: 6000,
        actualCost: 6000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[3].id,
        category: BudgetItemCategory.Miscellaneous,
        description: "Floral Arrangements & Decor",
        vendor: "Design Studio",
        estimatedCost: 12000,
        actualCost: 11000,
      },
    }),
    // Budget items for Workshop Series (Event 4 - Completed)
    prisma.budgetItem.create({
      data: {
        eventId: events[4].id,
        category: BudgetItemCategory.Venue,
        description: "Convention Center Rental",
        vendor: "Convention Center",
        estimatedCost: 15000,
        actualCost: 15000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[4].id,
        category: BudgetItemCategory.Catering,
        description: "Workshop Meals & Coffee",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 8000,
        actualCost: 7800,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[4].id,
        category: BudgetItemCategory.Logistics,
        description: "Workshop Materials & Supplies",
        vendor: "Supply Co",
        estimatedCost: 5000,
        actualCost: 4950,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[4].id,
        category: BudgetItemCategory.Marketing,
        description: "Workshop Promotion",
        vendor: "AdTech Solutions",
        vendorId: vendors[2].id,
        estimatedCost: 3000,
        actualCost: 3000,
      },
    }),
    // Budget items for Summer Networking Mixer (Event 5)
    prisma.budgetItem.create({
      data: {
        eventId: events[5].id,
        category: BudgetItemCategory.Venue,
        description: "Beachfront Hotel Rental",
        vendor: "Beachfront Hotel",
        estimatedCost: 12000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[5].id,
        category: BudgetItemCategory.Catering,
        description: "Cocktail Reception",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 8000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[5].id,
        category: BudgetItemCategory.Entertainment,
        description: "DJ & Music Setup",
        vendor: "Entertainment Plus",
        vendorId: vendors[4].id,
        estimatedCost: 5000,
        actualCost: 0,
      },
    }),
    // Budget items for Client Appreciation Dinner (Event 6)
    prisma.budgetItem.create({
      data: {
        eventId: events[6].id,
        category: BudgetItemCategory.Venue,
        description: "Fine Dining Restaurant",
        vendor: "Fine Dining Restaurant",
        estimatedCost: 10000,
        actualCost: 5000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[6].id,
        category: BudgetItemCategory.Catering,
        description: "Premium Dinner Service (80 pax)",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 20000,
        actualCost: 10000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[6].id,
        category: BudgetItemCategory.Miscellaneous,
        description: "Client Gifts & Favors",
        vendor: "Gift Co",
        estimatedCost: 5000,
        actualCost: 0,
      },
    }),
    // Budget items for Training Seminar (Event 7)
    prisma.budgetItem.create({
      data: {
        eventId: events[7].id,
        category: BudgetItemCategory.Venue,
        description: "Training Center Rental",
        vendor: "Training Center",
        estimatedCost: 8000,
        actualCost: 8000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[7].id,
        category: BudgetItemCategory.Logistics,
        description: "Training Materials & Equipment",
        vendor: "Training Supplies",
        estimatedCost: 5000,
        actualCost: 4500,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[7].id,
        category: BudgetItemCategory.Catering,
        description: "Lunch & Refreshments",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 3000,
        actualCost: 2800,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[7].id,
        category: BudgetItemCategory.Miscellaneous,
        description: "Trainer Fee",
        vendor: "Training Solutions",
        estimatedCost: 12000,
        actualCost: 12000,
      },
    }),
    // Budget items for Charity Fundraiser (Event 8)
    prisma.budgetItem.create({
      data: {
        eventId: events[8].id,
        category: BudgetItemCategory.Venue,
        description: "Event Hall Rental",
        vendor: "Event Hall",
        estimatedCost: 15000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[8].id,
        category: BudgetItemCategory.Catering,
        description: "Dinner Service (250 pax)",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 20000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[8].id,
        category: BudgetItemCategory.Entertainment,
        description: "Live Entertainment",
        vendor: "Entertainment Plus",
        vendorId: vendors[4].id,
        estimatedCost: 10000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[8].id,
        category: BudgetItemCategory.Marketing,
        description: "Fundraiser Promotion",
        vendor: "AdTech Solutions",
        vendorId: vendors[2].id,
        estimatedCost: 8000,
        actualCost: 0,
      },
    }),
    // Budget items for Industry Summit (Event 9)
    prisma.budgetItem.create({
      data: {
        eventId: events[9].id,
        category: BudgetItemCategory.Venue,
        description: "Convention Center (3 days)",
        vendor: "Convention Center",
        estimatedCost: 60000,
        actualCost: 40000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[9].id,
        category: BudgetItemCategory.Catering,
        description: "Meals for 800 attendees (3 days)",
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        estimatedCost: 45000,
        actualCost: 30000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[9].id,
        category: BudgetItemCategory.Logistics,
        description: "AV Equipment & Setup",
        vendor: "Tech Events Pro",
        vendorId: vendors[3].id,
        estimatedCost: 20000,
        actualCost: 15000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[9].id,
        category: BudgetItemCategory.Marketing,
        description: "Summit Marketing Campaign",
        vendor: "AdTech Solutions",
        vendorId: vendors[2].id,
        estimatedCost: 15000,
        actualCost: 10000,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[9].id,
        category: BudgetItemCategory.Entertainment,
        description: "Keynote Speakers (3 speakers)",
        vendor: "Speaker Bureau Inc.",
        estimatedCost: 30000,
        actualCost: 0,
      },
    }),
    prisma.budgetItem.create({
      data: {
        eventId: events[9].id,
        category: BudgetItemCategory.Miscellaneous,
        description: "Event Staff & Security",
        vendor: "EventStaff Plus",
        estimatedCost: 15000,
        actualCost: 0,
      },
    }),
  ]);

  console.log("✅ Created budget items:", budgetItems.length);

  // Create expenses
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        organizationId: organization.id,
        eventId: events[0].id,
        vendor: "Grand Convention Center",
        vendorId: vendors[0].id,
        title: "Conference Hall Deposit",
        amount: 15000,
        description: "Initial deposit for conference hall rental",
        status: ExpenseStatus.Approved,
        createdBy: eventManager.id,
      },
    }),
    prisma.expense.create({
      data: {
        organizationId: organization.id,
        eventId: events[0].id,
        vendor: "AdTech Solutions",
        vendorId: vendors[2].id,
        title: "Social Media Ads",
        amount: 5000,
        description: "Digital marketing campaign",
        status: ExpenseStatus.Pending,
        createdBy: finance.id,
      },
    }),
    prisma.expense.create({
      data: {
        organizationId: organization.id,
        eventId: events[1].id,
        vendor: "Premium Catering Co.",
        vendorId: vendors[1].id,
        title: "Coffee & Snacks Setup",
        amount: 2500,
        description: "Refreshments for product launch",
        status: ExpenseStatus.Approved,
        createdBy: eventManager.id,
      },
    }),
    prisma.expense.create({
      data: {
        organizationId: organization.id,
        eventId: events[3].id,
        vendor: "Entertainment Plus",
        vendorId: vendors[4].id,
        title: "Live Band Performance",
        amount: 8000,
        description: "Entertainment for annual gala",
        status: ExpenseStatus.Pending,
        createdBy: admin.id,
      },
    }),
    prisma.expense.create({
      data: {
        organizationId: organization.id,
        eventId: events[0].id,
        vendor: "Tech Events Pro",
        vendorId: vendors[3].id,
        title: "AV Equipment & Setup",
        amount: 10500,
        description: "Audio visual equipment rental",
        status: ExpenseStatus.Approved,
        createdBy: eventManager.id,
      },
    }),
    prisma.expense.create({
      data: {
        organizationId: organization.id,
        eventId: events[1].id,
        vendor: "PR Newswire",
        title: "Press Release Distribution",
        amount: 3500,
        description: "Media distribution service",
        status: ExpenseStatus.Pending,
        createdBy: finance.id,
      },
    }),
  ]);

  console.log("✅ Created expenses:", expenses.length);

  // Create approval workflows for approved expenses
  await Promise.all([
    prisma.approvalWorkflow.create({
      data: {
        expenseId: expenses[0].id,
        approverId: finance.id,
        action: "approved",
        comments: "Approved - within budget",
      },
    }),
    prisma.approvalWorkflow.create({
      data: {
        expenseId: expenses[2].id,
        approverId: finance.id,
        action: "approved",
        comments: "Approved",
      },
    }),
    prisma.approvalWorkflow.create({
      data: {
        expenseId: expenses[4].id,
        approverId: finance.id,
        action: "approved",
        comments: "Approved - necessary for event",
      },
    }),
  ]);

  console.log("✅ Created approval workflows");

  // Create vendor-event assignments
  await Promise.all([
    prisma.vendorEvent.create({
      data: {
        vendorId: vendors[0].id,
        eventId: events[0].id,
      },
    }),
    prisma.vendorEvent.create({
      data: {
        vendorId: vendors[1].id,
        eventId: events[0].id,
      },
    }),
    prisma.vendorEvent.create({
      data: {
        vendorId: vendors[2].id,
        eventId: events[0].id,
      },
    }),
  ]);

  console.log("✅ Created vendor-event assignments");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Organizations: 1`);
  console.log(`   - Users: 4 (Admin, EventManager, Finance, Viewer)`);
  console.log(`   - Events: ${events.length}`);
  console.log(`   - Vendors: ${vendors.length}`);
  console.log(`   - Budget Items: ${budgetItems.length} (across all events)`);
  console.log(`   - Expenses: ${expenses.length}`);
  console.log(`   - Event Assignments: 3`);
  console.log(`   - Stakeholders: 2`);
  console.log(`   - Vendor-Event Links: 3`);
  console.log("\n🔑 Login credentials (all users):");
  console.log("   Email: admin@demo.com / sarah@demo.com / mike@demo.com / emily@demo.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

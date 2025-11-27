import { PrismaClient } from "../src/generated/prisma-database";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: "Demo Organization",
      industry: "Technology",
    },
  });

  console.log("✅ Created organization:", organization.name);

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      fullName: "Admin User",
      email: "admin@demo.com",
      role: "Admin",
      passwordHash,
      isActive: true,
    },
  });

  console.log("✅ Created admin user:", admin.email);

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

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


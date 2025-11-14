import { prisma } from "../src/client";
import * as bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");
  console.log("📡 Connecting to database...");

  // Test connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw error;
  }

  // Check current users
  const existingUsers = await prisma.user.findMany();
  console.log(`📊 Found ${existingUsers.length} existing users in database`);

  console.log("\n✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

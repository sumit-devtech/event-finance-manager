/**
 * Quick script to verify users in database
 * Run with: tsx prisma/verify-users.ts
 */

import { prisma } from "../src/client";

type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
};

async function main() {
  console.log("🔍 Checking users in database...\n");

  try {
    await prisma.$connect();
    console.log("✅ Connected to database\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 Found ${users.length} user(s):\n`);

    if (users.length === 0) {
      console.log("⚠️  No users found in database!");
      console.log("💡 Run: pnpm db:seed to create test users\n");
    } else {
      users.forEach((user: UserSummary, index: number) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name || "N/A"}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt.toISOString()}`);
        console.log(`   ID: ${user.id}\n`);
      });
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("P1001")) {
      console.error("\n💡 Database connection failed. Check your DATABASE_URL in .env file");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();


/**
 * Helper script to list unverified users and their verification tokens
 * Useful for manual testing when SMTP is not configured
 * 
 * Usage: npx tsx scripts/list-unverified-users.ts
 */

import { PrismaClient } from '@event-finance-manager/database';

const prisma = new PrismaClient();

async function listUnverifiedUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerificationToken: true,
        emailVerificationExpires: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('\n✅ No unverified users found.\n');
      return;
    }

    console.log('\n📧 Unverified Users:\n');
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      const expires = user.emailVerificationExpires 
        ? new Date(user.emailVerificationExpires).toLocaleString()
        : 'N/A';
      
      const isExpired = user.emailVerificationExpires 
        ? new Date(user.emailVerificationExpires) < new Date()
        : false;
      
      const status = isExpired ? '❌ EXPIRED' : '⏰ Valid';
      
      console.log(`\n${index + 1}. ${user.fullName || 'N/A'} (${user.email})`);
      console.log(`   Status: ${status}`);
      console.log(`   Token: ${user.emailVerificationToken || 'N/A'}`);
      console.log(`   Expires: ${expires}`);
      
      if (user.emailVerificationToken && !isExpired) {
        console.log(`   Verify URL: http://localhost:5173/auth/verify-email?token=${user.emailVerificationToken}`);
        console.log(`   API Call: curl "http://localhost:3334/api/auth/verify-email?token=${user.emailVerificationToken}"`);
      }
      
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal: ${users.length} unverified user(s)\n`);
    
  } catch (error) {
    console.error('Error listing unverified users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUnverifiedUsers();


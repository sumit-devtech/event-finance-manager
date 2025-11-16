import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, prisma } from "@event-finance-manager/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  get client(): PrismaClient {
    return prisma;
  }

  async onModuleInit() {
    // Optional: Test database connection
    await prisma.$connect();
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }
}


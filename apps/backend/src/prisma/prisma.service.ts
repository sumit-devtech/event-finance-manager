import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClientEventDb, prismaEventDb } from "@event-finance-manager/event-db";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  get client(): PrismaClientEventDb {
    return prismaEventDb;
  }

  async onModuleInit() {
    // Optional: Test database connection
    await prismaEventDb.$connect();
  }

  async onModuleDestroy() {
    await prismaEventDb.$disconnect();
  }
}


import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClientSimplifi, prismaSimplifi } from "@event-finance-manager/simlifidb";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  get client(): InstanceType<typeof PrismaClientSimplifi> {
    return prismaSimplifi;
  }

  async onModuleInit() {
    // Optional: Test database connection
    await prismaSimplifi.$connect();
  }

  async onModuleDestroy() {
    await prismaSimplifi.$disconnect();
  }
}


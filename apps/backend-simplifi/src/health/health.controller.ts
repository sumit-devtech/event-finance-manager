import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Test database connection
      await this.prisma.client.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}


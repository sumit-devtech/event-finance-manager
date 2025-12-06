import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
  imports: [PrismaModule, MetricsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}


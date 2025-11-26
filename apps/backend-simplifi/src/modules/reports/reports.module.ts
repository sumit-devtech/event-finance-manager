import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { BudgetVsActualGenerator } from "./generators/budget-vs-actual.generator";
import { VendorReportGenerator } from "./generators/vendor-report.generator";
import { StakeholderSummaryGenerator } from "./generators/stakeholder-summary.generator";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    BudgetVsActualGenerator,
    VendorReportGenerator,
    StakeholderSummaryGenerator,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}


import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { CrmSyncJob } from "./crm-sync.job";
import { RoiCalcJob } from "./roi-calc.job";
import { InsightsGenerationJob } from "./insights-generation.job";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmModule } from "../modules/crm/crm.module";
import { RoiModule } from "../modules/roi/roi.module";
import { InsightsModule } from "../modules/insights/insights.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    CrmModule,
    RoiModule,
    InsightsModule,
  ],
  providers: [CrmSyncJob, RoiCalcJob, InsightsGenerationJob],
})
export class JobsModule {}


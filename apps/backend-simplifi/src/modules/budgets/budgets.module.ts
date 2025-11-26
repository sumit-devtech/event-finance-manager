import { Module } from "@nestjs/common";
import { BudgetsController } from "./budgets.controller";
import { BudgetsService } from "./budgets.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";

@Module({
  imports: [PrismaModule, ActivityLogsModule],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}


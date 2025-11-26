import { Module } from "@nestjs/common";
import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";
import { ApprovalService } from "./approval.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, ActivityLogsModule, NotificationsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ApprovalService],
  exports: [ExpensesService, ApprovalService],
})
export class ExpensesModule {}


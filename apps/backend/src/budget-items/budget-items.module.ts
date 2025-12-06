import { Module } from "@nestjs/common";
import { BudgetItemsService } from "./budget-items.service";
import { BudgetItemsController } from "./budget-items.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
  imports: [PrismaModule, NotificationsModule, MetricsModule],
  controllers: [BudgetItemsController],
  providers: [BudgetItemsService],
  exports: [BudgetItemsService],
})
export class BudgetItemsModule {}


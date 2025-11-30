import { Module, forwardRef } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { ExpensesController, EventExpensesController } from "./expenses.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { BudgetItemsModule } from "../budget-items/budget-items.module";

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    forwardRef(() => BudgetItemsModule),
  ],
  controllers: [ExpensesController, EventExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}


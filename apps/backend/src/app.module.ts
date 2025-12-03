import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";
import { EventsModule } from "./events/events.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BudgetItemsModule } from "./budget-items/budget-items.module";
import { ReportsModule } from "./reports/reports.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { FilesModule } from "./files/files.module";
import { StrategicGoalsModule } from "./strategic-goals/strategic-goals.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { VendorsModule } from "./vendors/vendors.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EventsModule,
    AuthModule,
    UsersModule,
    BudgetItemsModule,
    ReportsModule,
    NotificationsModule,
    FilesModule,
    StrategicGoalsModule,
    ExpensesModule,
    VendorsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}


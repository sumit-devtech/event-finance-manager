import { Module } from "@nestjs/common";
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { UsersModule } from "./modules/users/users.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { EventsModule } from "./modules/events/events.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { VendorsModule } from "./modules/vendors/vendors.module";
import { CrmModule } from "./modules/crm/crm.module";
import { RoiModule } from "./modules/roi/roi.module";
import { InsightsModule } from "./modules/insights/insights.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ActivityLogsModule } from "./modules/activity-logs/activity-logs.module";
import { JobsModule } from "./jobs/jobs.module";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    SubscriptionsModule,
    EventsModule,
    BudgetsModule,
    ExpensesModule,
    VendorsModule,
    CrmModule,
    RoiModule,
    InsightsModule,
    ReportsModule,
    NotificationsModule,
    ActivityLogsModule,
    JobsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}


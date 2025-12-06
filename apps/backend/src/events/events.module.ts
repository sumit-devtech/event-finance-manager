import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EventAssignmentGuard } from "./guards/event-assignment.guard";
import { NotificationsModule } from "../notifications/notifications.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { MetricsModule } from "../metrics/metrics.module";

@Module({
  imports: [PrismaModule, NotificationsModule, SubscriptionsModule, MetricsModule],
  controllers: [EventsController],
  providers: [EventsService, EventAssignmentGuard],
  exports: [EventsService],
})
export class EventsModule {}


import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailService } from "./email.service";
import { EmailQueueService } from "./email-queue.service";
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, EmailQueueService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}


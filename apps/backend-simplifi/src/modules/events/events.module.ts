import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { StakeholdersController } from "./stakeholders/stakeholders.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";

@Module({
  imports: [PrismaModule, ActivityLogsModule],
  controllers: [EventsController, StakeholdersController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}


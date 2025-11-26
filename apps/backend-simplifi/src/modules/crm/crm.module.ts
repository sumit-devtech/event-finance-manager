import { Module } from "@nestjs/common";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { HubSpotProvider } from "./providers/hubspot.provider";
import { SalesforceProvider } from "./providers/salesforce.provider";
import { PrismaModule } from "../../prisma/prisma.module";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";

@Module({
  imports: [PrismaModule, ActivityLogsModule],
  controllers: [CrmController],
  providers: [CrmService, HubSpotProvider, SalesforceProvider],
  exports: [CrmService],
})
export class CrmModule {}


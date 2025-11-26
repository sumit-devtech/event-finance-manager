import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { CrmService } from "../modules/crm/crm.service";

@Injectable()
export class CrmSyncJob {
  private readonly logger = new Logger(CrmSyncJob.name);

  constructor(
    private prisma: PrismaService,
    private crmService: CrmService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCrmSync() {
    this.logger.log("Starting CRM sync job");

    try {
      // Find events that need sync (events with recent changes or no sync record)
      const events = await this.prisma.client.event.findMany({
        where: {
          OR: [
            {
              crmSync: null, // No sync record
            },
            {
              updatedAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Updated in last 24 hours
              },
            },
          ],
        },
        include: {
          organization: {
            select: {
              id: true,
            },
          },
        },
        take: 10, // Process 10 at a time
      });

      for (const event of events) {
        try {
          // Determine CRM system (default to hubspot, could be configurable per org)
          const crmSystem = "hubspot";

          await this.crmService.syncEvent(event.id, crmSystem, event.organizationId || "");

          this.logger.log(`Synced event ${event.id} to ${crmSystem}`);
        } catch (error) {
          this.logger.error(`Failed to sync event ${event.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.logger.log(`CRM sync job completed. Processed ${events.length} events`);
    } catch (error) {
      this.logger.error(`CRM sync job failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}


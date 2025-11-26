import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { RoiService } from "../modules/roi/roi.service";

@Injectable()
export class RoiCalcJob {
  private readonly logger = new Logger(RoiCalcJob.name);

  constructor(
    private prisma: PrismaService,
    private roiService: RoiService,
  ) {}

  @Cron("0 */1 * * *") // Every hour
  async handleRoiCalc() {
    this.logger.log("Starting ROI calculation job");

    try {
      // Find events that need ROI calculation
      // Events with new expenses or CRM data in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const events = await this.prisma.client.event.findMany({
        where: {
          OR: [
            {
              expenses: {
                some: {
                  createdAt: {
                    gte: oneHourAgo,
                  },
                  status: "approved",
                },
              },
            },
            {
              crmSync: {
                lastSyncedAt: {
                  gte: oneHourAgo,
                },
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
        take: 20, // Process 20 at a time
      });

      for (const event of events) {
        try {
          await this.roiService.calculateROI(event.id, event.organizationId || "");

          this.logger.log(`Calculated ROI for event ${event.id}`);
        } catch (error) {
          this.logger.error(`Failed to calculate ROI for event ${event.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.logger.log(`ROI calculation job completed. Processed ${events.length} events`);
    } catch (error) {
      this.logger.error(`ROI calculation job failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}


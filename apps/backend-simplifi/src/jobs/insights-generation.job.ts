import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { InsightsService } from "../modules/insights/insights.service";

@Injectable()
export class InsightsGenerationJob {
  private readonly logger = new Logger(InsightsGenerationJob.name);

  constructor(
    private prisma: PrismaService,
    private insightsService: InsightsService,
  ) {}

  @Cron("0 2 * * *") // Daily at 2 AM
  async handleInsightsGeneration() {
    this.logger.log("Starting insights generation job");

    try {
      // Find events that need insights (events with recent activity)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const events = await this.prisma.client.event.findMany({
        where: {
          OR: [
            {
              updatedAt: {
                gte: oneDayAgo,
              },
            },
            {
              expenses: {
                some: {
                  createdAt: {
                    gte: oneDayAgo,
                  },
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
        take: 50, // Process 50 at a time
      });

      for (const event of events) {
        try {
          await this.insightsService.generateInsights(event.id, event.organizationId || "");

          this.logger.log(`Generated insights for event ${event.id}`);
        } catch (error) {
          this.logger.error(`Failed to generate insights for event ${event.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.logger.log(`Insights generation job completed. Processed ${events.length} events`);
    } catch (error) {
      this.logger.error(`Insights generation job failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}


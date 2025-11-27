import { Injectable, Logger } from "@nestjs/common";
import { EmailService } from "./email.service";
import { PrismaService } from "../prisma/prisma.service";

interface EmailJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);
  private emailQueue: EmailJob[] = [];
  private processing = false;

  constructor(
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {
    // Start processing queue every 5 seconds
    this.startQueueProcessor();
  }

  async addToQueue(job: EmailJob): Promise<void> {
    this.emailQueue.push(job);
    this.logger.debug(`Email job added to queue. Queue size: ${this.emailQueue.length}`);
  }

  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      if (!this.processing && this.emailQueue.length > 0) {
        await this.processQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.emailQueue.length === 0) {
      return;
    }

    this.processing = true;
    this.logger.debug(`Processing email queue. ${this.emailQueue.length} jobs remaining`);

    while (this.emailQueue.length > 0) {
      const job = this.emailQueue.shift();
      if (!job) break;

      try {
        const user = await this.prisma.client.user.findUnique({
          where: { id: job.userId },
          select: { email: true, fullName: true },
        });

        if (user?.email) {
          await this.emailService.sendNotificationEmail({
            to: user.email,
            name: user.fullName || "User",
            type: job.type as any,
            title: job.title,
            message: job.message,
            metadata: job.metadata,
          });
        }
      } catch (error) {
        this.logger.error(`Failed to process email job for user ${job.userId}:`, error);
        // Optionally: re-queue failed jobs or log to database
      }
    }

    this.processing = false;
  }
}


import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailQueueService } from "./email-queue.service";
import { NotificationType } from "@event-finance-manager/database";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async findAll(userId: string, filters?: { read?: boolean; type?: NotificationType }) {
    const where: any = { userId };
    if (filters?.read !== undefined) {
      where.read = filters.read;
    }
    if (filters?.type !== undefined) {
      where.type = filters.type;
    }

    return this.prisma.client.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.client.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    if (notification.read) {
      return notification;
    }

    return this.prisma.client.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.client.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return { message: "All notifications marked as read" };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.client.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return { count };
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
    organizationId?: string;
    sendEmail?: boolean;
  }) {
    const notification = await this.prisma.client.notification.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
      },
    });

    // Queue email if requested
    if (data.sendEmail) {
      await this.emailQueueService.addToQueue({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
      });
    }

    return notification;
  }

  async createEventAssignedNotification(userId: string, eventId: string, eventName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.Info,
      title: "Event Assigned",
      message: `You have been assigned to the event: ${eventName}`,
      metadata: { eventId, eventName },
      sendEmail: true,
    });
  }

  async createBudgetApprovalNotification(userId: string, eventId: string, eventName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.Warning,
      title: "Budget Approval Required",
      message: `Budget approval is required for event: ${eventName}`,
      metadata: { eventId, eventName },
      sendEmail: true,
    });
  }

  async createOverBudgetAlertNotification(
    userId: string,
    eventId: string,
    eventName: string,
    variance: number,
    variancePercentage: number,
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.Error,
      title: "Budget Overrun Alert",
      message: `Event "${eventName}" has exceeded budget by ${Math.abs(variancePercentage).toFixed(2)}%`,
      metadata: { eventId, eventName, variance, variancePercentage },
      sendEmail: true,
    });
  }

  async createEventCompletionNotification(userId: string, eventId: string, eventName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.Success,
      title: "Event Completed",
      message: `Event "${eventName}" has been marked as completed`,
      metadata: { eventId, eventName },
      sendEmail: true,
    });
  }
}


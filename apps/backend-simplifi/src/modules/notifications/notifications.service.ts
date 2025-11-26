import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, title: string, message: string) {
    return this.prisma.client.notification.create({
      data: {
        userId,
        title,
        message,
        isRead: false,
      },
    });
  }

  async findAll(userId: string, filters?: { isRead?: boolean; limit?: number; offset?: number }) {
    const where: any = { userId };

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [notifications, total] = await Promise.all([
      this.prisma.client.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.client.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      limit,
      offset,
    };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.client.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.client.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException("Access denied to this notification");
    }

    return this.prisma.client.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.client.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async notifyApproversForExpense(expense: any, approverIds: string[]) {
    const notifications = await Promise.all(
      approverIds.map((approverId) =>
        this.createNotification(
          approverId,
          "Expense Approval Required",
          `You have a new expense "${expense.title}" (${expense.amount}) awaiting your approval.`,
        ),
      ),
    );

    return notifications;
  }

  async notifyStakeholders(eventId: string, message: string) {
    const stakeholders = await this.prisma.client.eventStakeholder.findMany({
      where: { eventId },
    });

    // Get users by email if available
    const emails = stakeholders.map((s) => s.email).filter(Boolean);
    const users = await this.prisma.client.user.findMany({
      where: {
        email: { in: emails },
      },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        this.createNotification(user.id, "Event Update", message),
      ),
    );

    return notifications;
  }
}


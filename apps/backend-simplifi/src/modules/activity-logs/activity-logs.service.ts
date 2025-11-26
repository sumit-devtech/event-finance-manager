import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async logActivity(
    eventId: string,
    userId: string | null | undefined,
    action: string,
    details?: any,
  ) {
    return this.prisma.client.activityLog.create({
      data: {
        eventId,
        userId: userId || null,
        action,
        details: details || {},
      },
    });
  }

  async getActivityLogs(eventId: string, filters?: { limit?: number; offset?: number }) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [logs, total] = await Promise.all([
      this.prisma.client.activityLog.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.client.activityLog.count({
        where: { eventId },
      }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  async getAllActivityLogs(organizationId: string, filters?: { limit?: number; offset?: number }) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [logs, total] = await Promise.all([
      this.prisma.client.activityLog.findMany({
        where: {
          event: {
            organizationId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.client.activityLog.count({
        where: {
          event: {
            organizationId,
          },
        },
      }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }
}


import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(userId: string, userRole: string, organizationId?: string) {
    if (!organizationId) {
      return {
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        planningEvents: 0,
        cancelledEvents: 0,
        totalBudgetItems: 0,
        upcomingEvents: [],
        recentEvents: [],
      };
    }

    // Get all events for organization
    const events = await this.prisma.client.event.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        startDate: true,
        createdAt: true,
        status: true,
      },
    });

    // Get all budget items for organization
    const budgetItems = await this.prisma.client.budgetItem.findMany({
      where: {
        event: { organizationId },
      },
    });

    // Calculate stats
    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter((e) => e.status === "Active").length,
      completedEvents: events.filter((e) => e.status === "Completed").length,
      planningEvents: events.filter((e) => e.status === "Planning").length,
      cancelledEvents: events.filter((e) => e.status === "Cancelled").length,
      totalBudgetItems: budgetItems.length,
    };

    // Get upcoming events (startDate > now)
    const now = new Date();
    const upcomingEvents = events
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        createdAt: e.createdAt,
      }));

    // Get recent events (last 5, sorted by createdAt)
    const recentEvents = events
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        createdAt: e.createdAt,
      }));

    return {
      ...stats,
      upcomingEvents,
      recentEvents,
    };
  }
}

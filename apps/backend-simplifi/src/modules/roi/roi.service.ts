import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RoiService {
  constructor(private prisma: PrismaService) {}

  async calculateROI(eventId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      include: {
        expenses: {
          where: { status: "approved" },
        },
        crmSync: true,
        budgetVersions: {
          where: { isFinal: true },
          include: {
            items: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    // Calculate actual spend
    const actualSpend = event.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate total budget
    const totalBudget =
      event.budgetVersions[0]?.items.reduce(
        (sum, item) => sum + (item.estimatedCost || 0),
        0,
      ) || 0;

    // Get revenue from CRM sync data
    const revenueGenerated =
      event.crmSync?.data && typeof event.crmSync.data === "object"
        ? (event.crmSync.data as any).revenueGenerated || 0
        : 0;

    const leadsGenerated =
      event.crmSync?.data && typeof event.crmSync.data === "object"
        ? (event.crmSync.data as any).leadsGenerated || 0
        : 0;

    const conversions =
      event.crmSync?.data && typeof event.crmSync.data === "object"
        ? (event.crmSync.data as any).conversions || 0
        : 0;

    // Calculate ROI
    const roiPercent =
      actualSpend > 0 ? ((revenueGenerated - actualSpend) / actualSpend) * 100 : null;

    // Upsert ROIMetrics
    const roiMetrics = await this.prisma.client.rOIMetrics.upsert({
      where: { eventId },
      update: {
        totalBudget,
        actualSpend,
        leadsGenerated,
        conversions,
        revenueGenerated,
        roiPercent,
      },
      create: {
        eventId,
        totalBudget,
        actualSpend,
        leadsGenerated,
        conversions,
        revenueGenerated,
        roiPercent,
      },
    });

    return roiMetrics;
  }

  async getROIMetrics(eventId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    let roiMetrics = await this.prisma.client.rOIMetrics.findUnique({
      where: { eventId },
    });

    // If no ROI metrics exist, calculate them
    if (!roiMetrics) {
      roiMetrics = await this.calculateROI(eventId, organizationId);
    }

    return roiMetrics;
  }
}


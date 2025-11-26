import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async generateInsights(eventId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      include: {
        budgetVersions: {
          where: { isFinal: true },
          include: {
            items: true,
          },
        },
        expenses: {
          where: { status: "approved" },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const insights: any[] = [];

    // Calculate budget vs actual
    const finalBudget = event.budgetVersions[0];
    if (finalBudget) {
      const totalBudget = finalBudget.items.reduce(
        (sum, item) => sum + (item.estimatedCost || 0),
        0,
      );
      const totalActual = event.expenses.reduce((sum, e) => sum + e.amount, 0);
      const variance = totalActual - totalBudget;
      const variancePercent = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;

      if (Math.abs(variancePercent) > 10) {
        insights.push({
          type: "budget_variance",
          severity: variancePercent > 0 ? "warning" : "info",
          message: `Actual spend is ${Math.abs(variancePercent).toFixed(1)}% ${
            variancePercent > 0 ? "over" : "under"
          } budget`,
          data: {
            budget: totalBudget,
            actual: totalActual,
            variance,
            variancePercent,
          },
        });
      }
    }

    // Category analysis
    const categorySpend: Record<string, number> = {};
    event.expenses.forEach((expense) => {
      // Group by vendor service type or expense category
      const category = expense.vendorId ? "vendor" : "other";
      categorySpend[category] = (categorySpend[category] || 0) + expense.amount;
    });

    // Store insights
    await Promise.all(
      insights.map((insight) =>
        this.prisma.client.insight.create({
          data: {
            eventId,
            insightType: insight.type,
            data: insight,
          },
        }),
      ),
    );

    return insights;
  }

  async getInsights(eventId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    return this.prisma.client.insight.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  }
}


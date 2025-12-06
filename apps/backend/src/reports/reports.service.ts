import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MetricsService } from "../metrics/metrics.service";
import { ComparisonReportDto } from "./dto/comparison-report.dto";

// Dynamic imports for optional dependencies
let ExcelJS: any;
let PDFDocument: any;

try {
  ExcelJS = require("exceljs");
} catch (e) {
  console.warn("exceljs not installed. Excel export will not work.");
}

try {
  PDFDocument = require("pdfkit");
} catch (e) {
  console.warn("pdfkit not installed. PDF export will not work.");
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  async getEventSummary(eventId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      include: {
        budgetItems: {
          include: {
            vendorLink: true,
          },
        },
        stakeholders: true,
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Try to get cached event metrics first
    const eventMetrics = await this.metricsService.getEventMetrics(eventId);

    let totalsByCategory: Record<string, { estimated: number; actual: number; variance: number }> = {};
    let totalEstimated = 0;
    let totalActual = 0;
    let variance = 0;
    let variancePercentage = 0;

    if (eventMetrics && eventMetrics.totalsByCategory) {
      // Use cached metrics
      const cachedTotals = eventMetrics.totalsByCategory as Record<string, { estimated: number; actual: number }>;
      totalsByCategory = {};
      Object.entries(cachedTotals).forEach(([category, totals]) => {
        totalsByCategory[category] = {
          estimated: totals.estimated,
          actual: totals.actual,
          variance: totals.actual - totals.estimated,
        };
      });
      totalEstimated = eventMetrics.totalEstimated ? Number(eventMetrics.totalEstimated) : 0;
      totalActual = eventMetrics.totalActual ? Number(eventMetrics.totalActual) : 0;
      variance = eventMetrics.variance ? Number(eventMetrics.variance) : 0;
      variancePercentage = eventMetrics.variancePercentage || 0;
    } else {
      // Fallback: Calculate from budget items
      const budgetItems = event.budgetItems || [];

      budgetItems.forEach((item) => {
        const category = item.category;
        if (!totalsByCategory[category]) {
          totalsByCategory[category] = { estimated: 0, actual: 0, variance: 0 };
        }

        // Handle Decimal type conversion (Prisma Decimal type)
        const estimated = item.estimatedCost 
          ? (typeof item.estimatedCost === 'object' && 'toNumber' in item.estimatedCost 
            ? item.estimatedCost.toNumber() 
            : Number(item.estimatedCost)) 
          : 0;
        const actual = item.actualCost 
          ? (typeof item.actualCost === 'object' && 'toNumber' in item.actualCost 
            ? item.actualCost.toNumber() 
            : Number(item.actualCost)) 
          : 0;

        totalsByCategory[category].estimated += estimated;
        totalsByCategory[category].actual += actual;
        totalsByCategory[category].variance += actual - estimated;
        totalEstimated += estimated;
        totalActual += actual;
      });

      variance = totalActual - totalEstimated;
      variancePercentage = totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;
    }

    // Calculate cost per attendee using stakeholders count
    const attendeeCount = event.stakeholders.length || 1;
    const costPerAttendee = attendeeCount > 0 ? totalActual / attendeeCount : 0;

    return {
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        client: event.location || null, // Map location to client for frontend compatibility
        status: event.status,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      budget: {
        totalsByCategory,
        summary: {
          totalEstimated,
          totalActual,
          variance,
          variancePercentage: Number(variancePercentage.toFixed(2)),
          isOverBudget: variance > 0,
        },
        costPerAttendee: Number(costPerAttendee.toFixed(2)),
        attendeeCount,
      },
      assignments: event.assignments.map((assignment) => ({
        user: assignment.user ? {
          id: assignment.user.id,
          name: assignment.user.fullName || null, // Map fullName to name
          email: assignment.user.email,
        } : null,
        role: assignment.role,
        assignedAt: assignment.assignedAt,
      })),
      stakeholders: event.stakeholders.map((s) => ({
        name: s.name,
        role: s.role,
        email: s.email,
      })),
      generatedAt: new Date(),
    };
  }

  async getComparisonReport(comparisonDto: ComparisonReportDto) {
    const { eventIds } = comparisonDto;

    // Verify all events exist
    const events = await this.prisma.client.event.findMany({
      where: {
        id: {
          in: eventIds,
        },
      },
      include: {
        budgetItems: {
          include: {
            vendorLink: true,
          },
        },
        stakeholders: true,
      },
    });

    if (events.length !== eventIds.length) {
      const foundIds = events.map((e) => e.id);
      const missingIds = eventIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Events not found: ${missingIds.join(", ")}`);
    }

    // Get cached event metrics for all events
    const eventMetricsList = await this.prisma.client.eventMetrics.findMany({
      where: { eventId: { in: eventIds } },
    });
    const metricsMap = new Map(
      eventMetricsList.map((m) => [m.eventId, m]),
    );

    const comparison = events.map((event) => {
      // Try to use cached metrics first
      const eventMetrics = metricsMap.get(event.id);

      let totalsByCategory: Record<string, { estimated: number; actual: number }> = {};
      let totalEstimated = 0;
      let totalActual = 0;
      let variance = 0;
      let variancePercentage = 0;

      if (eventMetrics && eventMetrics.totalsByCategory) {
        // Use cached metrics
        totalsByCategory = eventMetrics.totalsByCategory as Record<string, { estimated: number; actual: number }>;
        totalEstimated = eventMetrics.totalEstimated ? Number(eventMetrics.totalEstimated) : 0;
        totalActual = eventMetrics.totalActual ? Number(eventMetrics.totalActual) : 0;
        variance = eventMetrics.variance ? Number(eventMetrics.variance) : 0;
        variancePercentage = eventMetrics.variancePercentage || 0;
      } else {
        // Fallback: Calculate from budget items
        const budgetItems = event.budgetItems || [];

        budgetItems.forEach((item) => {
          const category = item.category;
          if (!totalsByCategory[category]) {
            totalsByCategory[category] = { estimated: 0, actual: 0 };
          }

          // Handle Decimal type conversion (Prisma Decimal type)
          const estimated = item.estimatedCost 
            ? (typeof item.estimatedCost === 'object' && 'toNumber' in item.estimatedCost 
              ? item.estimatedCost.toNumber() 
              : Number(item.estimatedCost)) 
            : 0;
          const actual = item.actualCost 
            ? (typeof item.actualCost === 'object' && 'toNumber' in item.actualCost 
              ? item.actualCost.toNumber() 
              : Number(item.actualCost)) 
            : 0;

          totalsByCategory[category].estimated += estimated;
          totalsByCategory[category].actual += actual;
          totalEstimated += estimated;
          totalActual += actual;
        });

        variance = totalActual - totalEstimated;
        variancePercentage = totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;
      }
      const attendeeCount = event.stakeholders.length || 1;
      const costPerAttendee = attendeeCount > 0 ? totalActual / attendeeCount : 0;

      return {
        event: {
          id: event.id,
          name: event.name,
          client: event.location || null, // Map location to client for frontend compatibility
          status: event.status,
          startDate: event.startDate,
          endDate: event.endDate,
        },
        budget: {
          totalsByCategory,
          totalEstimated,
          totalActual,
          variance,
          variancePercentage: Number(variancePercentage.toFixed(2)),
          costPerAttendee: Number(costPerAttendee.toFixed(2)),
          attendeeCount,
        },
      };
    });

    // Calculate aggregate totals
    const aggregateTotals = comparison.reduce(
      (acc, curr) => {
        acc.totalEstimated += curr.budget.totalEstimated;
        acc.totalActual += curr.budget.totalActual;
        return acc;
      },
      { totalEstimated: 0, totalActual: 0 },
    );

    const aggregateVariance = aggregateTotals.totalActual - aggregateTotals.totalEstimated;
    const aggregateVariancePercentage =
      aggregateTotals.totalEstimated > 0
        ? (aggregateVariance / aggregateTotals.totalEstimated) * 100
        : 0;

    return {
      events: comparison,
      aggregate: {
        totalEstimated: aggregateTotals.totalEstimated,
        totalActual: aggregateTotals.totalActual,
        variance: aggregateVariance,
        variancePercentage: Number(aggregateVariancePercentage.toFixed(2)),
      },
      generatedAt: new Date(),
    };
  }

  async exportReport(
    format: "csv" | "excel" | "pdf",
    reportType: "summary" | "comparison",
    data: any,
    eventId?: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    switch (format) {
      case "csv":
        return this.exportToCSV(reportType, data, eventId);
      case "excel":
        return this.exportToExcel(reportType, data, eventId);
      case "pdf":
        return this.exportToPDF(reportType, data, eventId);
      default:
        throw new BadRequestException(`Unsupported export format: ${format}`);
    }
  }

  private async exportToCSV(
    reportType: "summary" | "comparison",
    data: any,
    eventId?: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    let csvContent = "";
    let filename = "";

    if (reportType === "summary") {
      filename = `event-summary-${eventId || "report"}-${Date.now()}.csv`;
      csvContent = "Event Summary Report\n\n";
      csvContent += `Event: ${data.event.name}\n`;
      csvContent += `Location: ${data.event.location || "N/A"}\n`;
      csvContent += `Status: ${data.event.status}\n\n`;

      csvContent += "Budget Summary\n";
      csvContent += `Total Estimated,${data.budget.summary.totalEstimated}\n`;
      csvContent += `Total Actual,${data.budget.summary.totalActual}\n`;
      csvContent += `Variance,${data.budget.summary.variance}\n`;
      csvContent += `Variance %,${data.budget.summary.variancePercentage}\n`;
      csvContent += `Cost per Attendee,${data.budget.costPerAttendee}\n\n`;

      csvContent += "Category Breakdown\n";
      csvContent += "Category,Estimated,Actual,Variance\n";
      Object.entries(data.budget.totalsByCategory).forEach(([category, totals]: [string, any]) => {
        csvContent += `${category},${totals.estimated},${totals.actual},${totals.variance}\n`;
      });
    } else {
      filename = `comparison-report-${Date.now()}.csv`;
      csvContent = "Event Comparison Report\n\n";

      csvContent += "Aggregate Summary\n";
      csvContent += `Total Estimated,${data.aggregate.totalEstimated}\n`;
      csvContent += `Total Actual,${data.aggregate.totalActual}\n`;
      csvContent += `Variance,${data.aggregate.variance}\n`;
      csvContent += `Variance %,${data.aggregate.variancePercentage}\n\n`;

      data.events.forEach((eventData: any, index: number) => {
        csvContent += `Event ${index + 1}: ${eventData.event.name}\n`;
        csvContent += `Total Estimated,${eventData.budget.totalEstimated}\n`;
        csvContent += `Total Actual,${eventData.budget.totalActual}\n`;
        csvContent += `Variance,${eventData.budget.variance}\n`;
        csvContent += `Variance %,${eventData.budget.variancePercentage}\n\n`;
      });
    }

    return {
      buffer: Buffer.from(csvContent, "utf-8"),
      filename,
      mimeType: "text/csv",
    };
  }

  private async exportToExcel(
    reportType: "summary" | "comparison",
    data: any,
    eventId?: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    if (!ExcelJS) {
      throw new BadRequestException("Excel export is not available. Please install exceljs package.");
    }
    const workbook = new ExcelJS.Workbook();
    let filename = "";

    if (reportType === "summary") {
      filename = `event-summary-${eventId || "report"}-${Date.now()}.xlsx`;
      const worksheet = workbook.addWorksheet("Event Summary");

      // Event Info
      worksheet.addRow(["Event Summary Report"]);
      worksheet.addRow([]);
      worksheet.addRow(["Event:", data.event.name]);
      worksheet.addRow(["Location:", data.event.location || "N/A"]);
      worksheet.addRow(["Status:", data.event.status]);
      worksheet.addRow([]);

      // Budget Summary
      worksheet.addRow(["Budget Summary"]);
      worksheet.addRow(["Total Estimated", data.budget.summary.totalEstimated]);
      worksheet.addRow(["Total Actual", data.budget.summary.totalActual]);
      worksheet.addRow(["Variance", data.budget.summary.variance]);
      worksheet.addRow(["Variance %", data.budget.summary.variancePercentage]);
      worksheet.addRow(["Cost per Attendee", data.budget.costPerAttendee]);
      worksheet.addRow([]);

      // Category Breakdown
      worksheet.addRow(["Category Breakdown"]);
      worksheet.addRow(["Category", "Estimated", "Actual", "Variance"]);
      Object.entries(data.budget.totalsByCategory).forEach(([category, totals]: [string, any]) => {
        worksheet.addRow([category, totals.estimated, totals.actual, totals.variance]);
      });
    } else {
      filename = `comparison-report-${Date.now()}.xlsx`;
      const worksheet = workbook.addWorksheet("Comparison");

      worksheet.addRow(["Event Comparison Report"]);
      worksheet.addRow([]);
      worksheet.addRow(["Aggregate Summary"]);
      worksheet.addRow(["Total Estimated", data.aggregate.totalEstimated]);
      worksheet.addRow(["Total Actual", data.aggregate.totalActual]);
      worksheet.addRow(["Variance", data.aggregate.variance]);
      worksheet.addRow(["Variance %", data.aggregate.variancePercentage]);
      worksheet.addRow([]);

      data.events.forEach((eventData: any, index: number) => {
        worksheet.addRow([]);
        worksheet.addRow([`Event ${index + 1}: ${eventData.event.name}`]);
        worksheet.addRow(["Total Estimated", eventData.budget.totalEstimated]);
        worksheet.addRow(["Total Actual", eventData.budget.totalActual]);
        worksheet.addRow(["Variance", eventData.budget.variance]);
        worksheet.addRow(["Variance %", eventData.budget.variancePercentage]);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer),
      filename,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  private async exportToPDF(
    reportType: "summary" | "comparison",
    data: any,
    eventId?: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    if (!PDFDocument) {
      throw new BadRequestException("PDF export is not available. Please install pdfkit package.");
    }
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks);
        let filename = "";

        if (reportType === "summary") {
          filename = `event-summary-${eventId || "report"}-${Date.now()}.pdf`;
        } else {
          filename = `comparison-report-${Date.now()}.pdf`;
        }

        resolve({
          buffer,
          filename,
          mimeType: "application/pdf",
        });
      });

      doc.on("error", reject);

      // Write content
      if (reportType === "summary") {
        doc.fontSize(20).text("Event Summary Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Event: ${data.event.name}`);
        doc.text(`Location: ${data.event.location || "N/A"}`);
        doc.text(`Status: ${data.event.status}`);
        doc.moveDown();

        doc.fontSize(16).text("Budget Summary");
        doc.fontSize(12);
        doc.text(`Total Estimated: $${data.budget.summary.totalEstimated.toFixed(2)}`);
        doc.text(`Total Actual: $${data.budget.summary.totalActual.toFixed(2)}`);
        doc.text(`Variance: $${data.budget.summary.variance.toFixed(2)}`);
        doc.text(`Variance %: ${data.budget.summary.variancePercentage}%`);
        doc.text(`Cost per Attendee: $${data.budget.costPerAttendee.toFixed(2)}`);
        doc.moveDown();

        doc.fontSize(16).text("Category Breakdown");
        doc.fontSize(12);
        Object.entries(data.budget.totalsByCategory).forEach(([category, totals]: [string, any]) => {
          doc.text(`${category}:`, { continued: true });
          doc.text(` Est: $${totals.estimated.toFixed(2)}, Act: $${totals.actual.toFixed(2)}, Var: $${totals.variance.toFixed(2)}`);
        });
      } else {
        doc.fontSize(20).text("Event Comparison Report", { align: "center" });
        doc.moveDown();

        doc.fontSize(16).text("Aggregate Summary");
        doc.fontSize(12);
        doc.text(`Total Estimated: $${data.aggregate.totalEstimated.toFixed(2)}`);
        doc.text(`Total Actual: $${data.aggregate.totalActual.toFixed(2)}`);
        doc.text(`Variance: $${data.aggregate.variance.toFixed(2)}`);
        doc.text(`Variance %: ${data.aggregate.variancePercentage}%`);
        doc.moveDown();

        data.events.forEach((eventData: any, index: number) => {
          doc.fontSize(14).text(`Event ${index + 1}: ${eventData.event.name}`);
          doc.fontSize(12);
          doc.text(`Total Estimated: $${eventData.budget.totalEstimated.toFixed(2)}`);
          doc.text(`Total Actual: $${eventData.budget.totalActual.toFixed(2)}`);
          doc.text(`Variance: $${eventData.budget.variance.toFixed(2)}`);
          doc.text(`Variance %: ${eventData.budget.variancePercentage}%`);
          doc.moveDown();
        });
      }

      doc.end();
    });
  }
}


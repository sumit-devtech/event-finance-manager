import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GenerateReportDto } from "./dto/generate-report.dto";
import { BudgetVsActualGenerator } from "./generators/budget-vs-actual.generator";
import { VendorReportGenerator } from "./generators/vendor-report.generator";
import { StakeholderSummaryGenerator } from "./generators/stakeholder-summary.generator";

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private budgetVsActualGenerator: BudgetVsActualGenerator,
    private vendorReportGenerator: VendorReportGenerator,
    private stakeholderSummaryGenerator: StakeholderSummaryGenerator,
  ) {}

  async findAll(eventId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    return this.prisma.client.report.findMany({
      where: { eventId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        files: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, organizationId: string) {
    const report = await this.prisma.client.report.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        files: true,
      },
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    if (report.event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this report");
    }

    return report;
  }

  async generateReport(dto: GenerateReportDto, userId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: dto.eventId },
      include: {
        budgetVersions: {
          where: { isFinal: true },
          include: {
            items: true,
          },
        },
        expenses: {
          where: { status: "approved" },
          include: {
            vendor: true,
          },
        },
        stakeholders: true,
        vendorContracts: {
          include: {
            vendor: true,
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

    let reportData: any;

    switch (dto.reportType) {
      case "budget-vs-actual":
        const budgetTotal = event.budgetVersions[0]?.items.reduce(
          (sum, item) => sum + (item.estimatedCost || 0),
          0,
        ) || 0;
        const actualTotal = event.expenses.reduce((sum, e) => sum + e.amount, 0);
        reportData = await this.budgetVsActualGenerator.generate({
          name: event.name,
          budgetTotal,
          actualTotal,
          lineItems: event.budgetVersions[0]?.items || [],
        });
        break;

      case "vendor-summary":
        const vendors = event.vendorContracts.map((contract) => ({
          vendor: contract.vendor.name,
          amount: contract.amount,
          contracts: 1,
        }));
        const totalVendorSpend = event.expenses
          .filter((e) => e.vendorId)
          .reduce((sum, e) => sum + e.amount, 0);
        reportData = await this.vendorReportGenerator.generate({
          name: event.name,
          vendors,
          totalVendorSpend,
        });
        break;

      case "stakeholder-summary":
        reportData = await this.stakeholderSummaryGenerator.generate({
          name: event.name,
          stakeholders: event.stakeholders,
          summary: {
            totalBudget: event.budgetVersions[0]?.items.reduce(
              (sum, item) => sum + (item.estimatedCost || 0),
              0,
            ) || 0,
            totalSpend: event.expenses.reduce((sum, e) => sum + e.amount, 0),
          },
        });
        break;
    }

    // Create report record
    const report = await this.prisma.client.report.create({
      data: {
        eventId: dto.eventId,
        reportType: dto.reportType,
        createdBy: userId,
      },
    });

    // In production, generate actual file and store URL
    // For now, store report data as a file record
    const file = await this.prisma.client.file.create({
      data: {
        reportId: report.id,
        fileUrl: `/reports/${report.id}/download`, // Mock URL
        fileType: "json", // In production: pdf, xlsx, etc.
      },
    });

    return {
      ...report,
      files: [file],
      data: reportData,
    };
  }
}


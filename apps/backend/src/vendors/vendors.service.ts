import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MetricsService } from "../metrics/metrics.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  async create(createVendorDto: CreateVendorDto, organizationId?: string) {
    const vendor = await this.prisma.client.vendor.create({
      data: {
        name: createVendorDto.name,
        serviceType: createVendorDto.serviceType || null,
        contactPerson: createVendorDto.contactPerson || null,
        email: createVendorDto.email || null,
        phone: createVendorDto.phone || null,
        gstNumber: createVendorDto.gstNumber || null,
        rating: createVendorDto.rating || null,
        organizationId: organizationId || null,
      },
      include: {
        vendorEvents: true,
        budgetItems: true,
        expenses: true,
      },
    });

    return vendor;
  }

  /**
   * Get all vendors with cached metrics
   * Uses VendorMetrics table for fast reads (avoids expensive aggregations)
   * 
   * @param organizationId - Optional organization filter
   * @returns Vendors with pre-computed stats (totalContracts, totalSpent, etc.)
   */
  async findAll(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const vendors = await this.prisma.client.vendor.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // OPTIMIZATION: Batch fetch all vendor metrics in one query
    const vendorIds = vendors.map((v) => v.id);
    const vendorMetricsList = await this.prisma.client.vendorMetrics.findMany({
      where: { vendorId: { in: vendorIds } },
    });

    // Create lookup map for O(1) access
    const metricsMap = new Map(
      vendorMetricsList.map((m) => [m.vendorId, m]),
    );

    // Return vendors with cached metrics or fallback to calculation
    return vendors.map((vendor) => {
      const metrics = metricsMap.get(vendor.id);

      if (metrics) {
        // FAST PATH: Use cached metrics (50ms vs 150ms calculation)
        return {
          id: vendor.id,
          name: vendor.name,
          serviceType: vendor.serviceType,
          category: vendor.serviceType || "Uncategorized",
          contactPerson: vendor.contactPerson,
          email: vendor.email,
          phone: vendor.phone,
          gstNumber: vendor.gstNumber,
          rating: vendor.rating,
          createdAt: vendor.createdAt,
          updatedAt: vendor.updatedAt,
          totalContracts: metrics.totalContracts,
          totalSpent: metrics.totalSpent ? Number(metrics.totalSpent) : 0,
          eventsCount: metrics.eventsCount,
          lastContract: metrics.lastContractDate,
        };
      }

      // FALLBACK PATH: Return vendor without stats
      // Metrics will be computed on next CRUD operation or can be manually refreshed
      return {
        id: vendor.id,
        name: vendor.name,
        serviceType: vendor.serviceType,
        category: vendor.serviceType || "Uncategorized",
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        gstNumber: vendor.gstNumber,
        rating: vendor.rating,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        totalContracts: 0,
        totalSpent: 0,
        eventsCount: 0,
        lastContract: null,
      };
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.client.vendor.findUnique({
      where: { id },
      include: {
        vendorEvents: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                status: true,
              },
            },
          },
        },
        budgetItems: {
          select: {
            id: true,
            category: true,
            description: true,
            estimatedCost: true,
            actualCost: true,
            eventId: true,
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        expenses: {
          select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            createdAt: true,
            eventId: true,
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    // Try to get cached vendor metrics
    const vendorMetrics = await this.metricsService.getVendorMetrics(id);

    if (vendorMetrics) {
      // Use cached metrics
      return {
        ...vendor,
        category: vendor.serviceType || "Uncategorized",
        totalContracts: vendorMetrics.totalContracts,
        totalSpent: vendorMetrics.totalSpent ? Number(vendorMetrics.totalSpent) : 0,
        eventsCount: vendorMetrics.eventsCount,
        lastContract: vendorMetrics.lastContractDate,
      };
    }

    // Fallback: Calculate stats on-the-fly
    const totalContracts = vendor.vendorEvents.length;
    const totalSpent = vendor.expenses
      .filter((e) => e.status === "Approved")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      ...vendor,
      category: vendor.serviceType || "Uncategorized",
      totalContracts,
      totalSpent,
      eventsCount: totalContracts,
    };
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    const vendor = await this.findOne(id);

    const updatedVendor = await this.prisma.client.vendor.update({
      where: { id },
      data: {
        name: updateVendorDto.name ?? vendor.name,
        serviceType: updateVendorDto.serviceType ?? vendor.serviceType,
        contactPerson: updateVendorDto.contactPerson ?? vendor.contactPerson,
        email: updateVendorDto.email ?? vendor.email,
        phone: updateVendorDto.phone ?? vendor.phone,
        gstNumber: updateVendorDto.gstNumber ?? vendor.gstNumber,
        rating: updateVendorDto.rating ?? vendor.rating,
      },
      include: {
        vendorEvents: true,
        budgetItems: true,
        expenses: true,
      },
    });

    return updatedVendor;
  }

  async remove(id: string) {
    const vendor = await this.findOne(id);

    // Check if vendor is used in any budget items or expenses
    const budgetItemsCount = await this.prisma.client.budgetItem.count({
      where: { vendorId: id },
    });

    const expensesCount = await this.prisma.client.expense.count({
      where: { vendorId: id },
    });

    if (budgetItemsCount > 0 || expensesCount > 0) {
      throw new BadRequestException(
        `Cannot delete vendor. It is used in ${budgetItemsCount} budget items and ${expensesCount} expenses.`,
      );
    }

    await this.prisma.client.vendor.delete({
      where: { id },
    });

    return { message: "Vendor deleted successfully" };
  }
}



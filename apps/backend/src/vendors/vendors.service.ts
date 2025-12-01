import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const vendors = await this.prisma.client.vendor.findMany({
      where,
      include: {
        vendorEvents: {
          select: {
            id: true,
            eventId: true,
            assignedAt: true,
          },
        },
        budgetItems: {
          select: {
            id: true,
            estimatedCost: true,
            actualCost: true,
          },
        },
        expenses: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate aggregated stats for each vendor
    return vendors.map((vendor) => {
      const totalContracts = vendor.vendorEvents.length;
      const totalSpent = vendor.expenses
        .filter((e) => e.status === "Approved")
        .reduce((sum, e) => sum + Number(e.amount), 0);

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
        totalContracts,
        totalSpent,
        eventsCount: totalContracts,
        lastContract:
          vendor.vendorEvents.length > 0
            ? vendor.vendorEvents[vendor.vendorEvents.length - 1].assignedAt
            : null,
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

    // Calculate stats
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



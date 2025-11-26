import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string, userOrgId?: string) {
    const organization = await this.prisma.client.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            events: true,
            vendors: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    // Ensure user has access to this organization
    if (userOrgId && organization.id !== userOrgId) {
      throw new ForbiddenException("Access denied to this organization");
    }

    return organization;
  }

  async update(id: string, dto: UpdateOrganizationDto, userOrgId: string) {
    // Ensure user belongs to this organization
    if (id !== userOrgId) {
      throw new ForbiddenException("Access denied to this organization");
    }

    const organization = await this.prisma.client.organization.update({
      where: { id },
      data: dto,
    });

    return organization;
  }

  async getStats(id: string, userOrgId: string) {
    // Ensure user belongs to this organization
    if (id !== userOrgId) {
      throw new ForbiddenException("Access denied to this organization");
    }

    const [events, vendors, users, expenses, subscriptions] = await Promise.all([
      this.prisma.client.event.count({
        where: { organizationId: id },
      }),
      this.prisma.client.vendor.count({
        where: { organizationId: id },
      }),
      this.prisma.client.user.count({
        where: { organizationId: id, isActive: true },
      }),
      this.prisma.client.expense.aggregate({
        where: {
          event: { organizationId: id },
          status: "approved",
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.client.subscription.findFirst({
        where: { organizationId: id, status: "active" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      events: {
        total: events,
      },
      vendors: {
        total: vendors,
      },
      users: {
        total: users,
      },
      expenses: {
        totalApproved: expenses._sum.amount || 0,
      },
      subscription: subscriptions
        ? {
            planName: subscriptions.planName,
            status: subscriptions.status,
            currentPeriodEnd: subscriptions.currentPeriodEnd,
          }
        : null,
    };
  }
}


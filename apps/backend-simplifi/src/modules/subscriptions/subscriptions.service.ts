import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findByOrganization(orgId: string, userOrgId: string) {
    if (orgId !== userOrgId) {
      throw new ForbiddenException("Access denied to this organization");
    }

    const subscription = await this.prisma.client.subscription.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      include: {
        history: {
          orderBy: { changedAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    return subscription;
  }

  async create(orgId: string, dto: CreateSubscriptionDto, userId: string, userOrgId: string) {
    if (orgId !== userOrgId) {
      throw new ForbiddenException("Access denied to this organization");
    }

    // Check if organization already has an active subscription
    const existing = await this.prisma.client.subscription.findFirst({
      where: {
        organizationId: orgId,
        status: "active",
      },
    });

    if (existing) {
      throw new BadRequestException("Organization already has an active subscription");
    }

    const currentPeriodStart = dto.currentPeriodStart
      ? new Date(dto.currentPeriodStart)
      : new Date();
    const currentPeriodEnd = dto.currentPeriodEnd
      ? new Date(dto.currentPeriodEnd)
      : this.calculatePeriodEnd(currentPeriodStart, dto.billingCycle);

    const subscription = await this.prisma.client.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          organizationId: orgId,
          planName: dto.planName,
          billingCycle: dto.billingCycle,
          status: "active",
          currentPeriodStart,
          currentPeriodEnd,
        },
      });

      // Create history record
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: sub.id,
          action: "create",
          newValue: {
            planName: dto.planName,
            billingCycle: dto.billingCycle,
            status: "active",
          },
          changedBy: userId,
        },
      });

      return sub;
    });

    return subscription;
  }

  async update(id: string, dto: UpdateSubscriptionDto, userId: string, userOrgId: string) {
    const subscription = await this.prisma.client.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    if (subscription.organizationId !== userOrgId) {
      throw new ForbiddenException("Access denied to this subscription");
    }

    const oldValue = {
      planName: subscription.planName,
      billingCycle: subscription.billingCycle,
      status: subscription.status,
    };

    const updated = await this.prisma.client.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id },
        data: {
          ...dto,
          currentPeriodStart: dto.currentPeriodStart
            ? new Date(dto.currentPeriodStart)
            : undefined,
          currentPeriodEnd: dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : undefined,
        },
      });

      // Determine action type
      let action = "update";
      if (dto.status === "cancelled" && subscription.status !== "cancelled") {
        action = "cancel";
      } else if (dto.planName && dto.planName !== subscription.planName) {
        action = dto.planName > subscription.planName ? "upgrade" : "downgrade";
      }

      // Create history record
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          action,
          oldValue,
          newValue: {
            planName: sub.planName,
            billingCycle: sub.billingCycle,
            status: sub.status,
          },
          changedBy: userId,
        },
      });

      return sub;
    });

    return updated;
  }

  async getHistory(id: string, userOrgId: string) {
    const subscription = await this.prisma.client.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    if (subscription.organizationId !== userOrgId) {
      throw new ForbiddenException("Access denied to this subscription");
    }

    const history = await this.prisma.client.subscriptionHistory.findMany({
      where: { subscriptionId: id },
      orderBy: { changedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return history;
  }

  async cancel(id: string, userId: string, userOrgId: string) {
    const subscription = await this.prisma.client.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    if (subscription.organizationId !== userOrgId) {
      throw new ForbiddenException("Access denied to this subscription");
    }

    return this.update(id, { status: "cancelled" }, userId, userOrgId);
  }

  private calculatePeriodEnd(startDate: Date, billingCycle: string): Date {
    const endDate = new Date(startDate);
    if (billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }
}


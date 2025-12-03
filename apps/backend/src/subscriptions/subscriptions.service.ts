import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionStatus, BillingCycle } from "@event-finance-manager/database";

export interface PlanLimits {
  maxEvents: number | null; // null = unlimited
  maxUsers?: number | null;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxEvents: 1,
    maxUsers: 1,
    features: ["basic_budgeting", "email_support"],
  },
  professional: {
    maxEvents: null, // unlimited
    maxUsers: 10,
    features: [
      "unlimited_events",
      "advanced_analytics",
      "team_collaboration",
      "budget_version_control",
      "expense_approval_workflows",
      "custom_reports",
      "priority_support",
    ],
  },
  enterprise: {
    maxEvents: null, // unlimited
    maxUsers: null, // unlimited
    features: [
      "unlimited_events",
      "unlimited_users",
      "advanced_analytics",
      "team_collaboration",
      "budget_version_control",
      "expense_approval_workflows",
      "custom_reports",
      "api_access",
      "custom_integrations",
      "dedicated_support",
      "sla_guarantee",
      "advanced_security",
    ],
  },
};

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get active subscription for an organization
   */
  async getActiveSubscription(organizationId: string) {
    const subscription = await this.prisma.client.subscription.findFirst({
      where: {
        organizationId,
        status: SubscriptionStatus.Active,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return subscription;
  }

  /**
   * Get subscription limits for an organization
   */
  async getSubscriptionLimits(organizationId: string): Promise<PlanLimits> {
    const subscription = await this.getActiveSubscription(organizationId);

    if (!subscription) {
      // Default to free plan if no subscription
      return PLAN_LIMITS.free;
    }

    const planName = subscription.planName.toLowerCase();
    return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
  }

  /**
   * Check if organization can create more events
   */
  async canCreateEvent(organizationId: string): Promise<{ allowed: boolean; reason?: string }> {
    const limits = await this.getSubscriptionLimits(organizationId);

    // Unlimited events
    if (limits.maxEvents === null) {
      return { allowed: true };
    }

    // Count existing events
    const eventCount = await this.prisma.client.event.count({
      where: {
        organizationId,
        status: {
          not: "Cancelled", // Don't count cancelled events
        },
      },
    });

    if (eventCount >= limits.maxEvents) {
      return {
        allowed: false,
        reason: `You have reached the limit of ${limits.maxEvents} event(s) for your current plan. Please upgrade to create more events.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Create or update subscription (for testing - direct DB update)
   */
  async createOrUpdateSubscription(
    organizationId: string,
    planName: string,
    billingCycle: BillingCycle,
    userId?: string,
  ) {
    // Validate plan name
    const planKey = planName.toLowerCase();
    if (!PLAN_LIMITS[planKey]) {
      throw new BadRequestException(`Invalid plan name: ${planName}`);
    }

    // Cancel existing active subscriptions
    await this.prisma.client.subscription.updateMany({
      where: {
        organizationId,
        status: SubscriptionStatus.Active,
      },
      data: {
        status: SubscriptionStatus.Cancelled,
      },
    });

    // Calculate period dates
    const now = new Date();
    const periodStart = now;
    let periodEnd: Date;

    if (billingCycle === BillingCycle.Monthly) {
      periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd = new Date(now);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create new subscription
    const subscription = await this.prisma.client.subscription.create({
      data: {
        organizationId,
        planName: planKey,
        billingCycle,
        status: SubscriptionStatus.Active,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    // Create history entry
    await this.prisma.client.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        action: "create",
        newValue: {
          planName: planKey,
          billingCycle,
          status: SubscriptionStatus.Active,
        },
        changedBy: userId,
      },
    });

    return subscription;
  }

  /**
   * Get subscription details with limits
   */
  async getSubscriptionDetails(organizationId: string) {
    const subscription = await this.getActiveSubscription(organizationId);
    const limits = await this.getSubscriptionLimits(organizationId);

    if (!subscription) {
      return {
        subscription: null,
        limits: PLAN_LIMITS.free,
        currentEventCount: 0,
      };
    }

    const eventCount = await this.prisma.client.event.count({
      where: {
        organizationId,
        status: {
          not: "Cancelled",
        },
      },
    });

    return {
      subscription,
      limits,
      currentEventCount: eventCount,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(organizationId: string, userId?: string) {
    const subscription = await this.getActiveSubscription(organizationId);

    if (!subscription) {
      throw new NotFoundException("No active subscription found");
    }

    const updated = await this.prisma.client.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.Cancelled,
      },
    });

    // Create history entry
    await this.prisma.client.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        action: "cancel",
        oldValue: {
          status: SubscriptionStatus.Active,
        },
        newValue: {
          status: SubscriptionStatus.Cancelled,
        },
        changedBy: userId,
      },
    });

    return updated;
  }
}


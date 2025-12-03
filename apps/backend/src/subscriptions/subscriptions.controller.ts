import { Controller, Get, Post, Delete, UseGuards, Request, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Roles(UserRole.Admin)
  async getSubscription(@Request() req) {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return {
        subscription: null,
        limits: { maxEvents: 1, features: [] },
        currentEventCount: 0,
      };
    }

    return this.subscriptionsService.getSubscriptionDetails(organizationId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Admin)
  async createSubscription(@Request() req, @Body() body: CreateSubscriptionDto) {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      throw new Error("User must belong to an organization");
    }

    // For testing: directly create subscription without payment
    return this.subscriptionsService.createOrUpdateSubscription(
      organizationId,
      body.planName,
      body.billingCycle,
      req.user.id,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.Admin)
  async cancelSubscription(@Request() req) {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      throw new Error("User must belong to an organization");
    }

    return this.subscriptionsService.cancelSubscription(organizationId, req.user.id);
  }

  @Get("limits")
  @Roles(UserRole.Admin, UserRole.EventManager)
  async getLimits(@Request() req) {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return { maxEvents: 1, features: [] };
    }

    return this.subscriptionsService.getSubscriptionLimits(organizationId);
  }
}


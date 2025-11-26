import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("organizations/:orgId/subscription")
  @Roles("admin", "manager")
  async findByOrganization(
    @Param("orgId") orgId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.findByOrganization(orgId, user.organizationId);
  }

  @Post("organizations/:orgId/subscription")
  @Roles("admin")
  async create(
    @Param("orgId") orgId: string,
    @Body() dto: CreateSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.create(orgId, dto, user.id, user.organizationId);
  }

  @Put("subscriptions/:id")
  @Roles("admin")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.update(id, dto, user.id, user.organizationId);
  }

  @Get("subscriptions/:id/history")
  @Roles("admin", "manager")
  async getHistory(@Param("id") id: string, @CurrentUser() user: any) {
    return this.subscriptionsService.getHistory(id, user.organizationId);
  }

  @Post("subscriptions/:id/cancel")
  @Roles("admin")
  async cancel(@Param("id") id: string, @CurrentUser() user: any) {
    return this.subscriptionsService.cancel(id, user.id, user.organizationId);
  }
}


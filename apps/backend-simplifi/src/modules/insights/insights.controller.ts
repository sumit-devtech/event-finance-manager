import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { InsightsService } from "./insights.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("v1/events/:eventId/insights")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @Roles("admin", "manager", "finance", "viewer")
  async getInsights(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.insightsService.getInsights(eventId, user.organizationId);
  }

  @Post("generate")
  @Roles("admin", "manager", "finance")
  async generateInsights(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.insightsService.generateInsights(eventId, user.organizationId);
  }
}


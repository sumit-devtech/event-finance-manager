import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { RoiService } from "./roi.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1/events/:eventId/roi")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoiController {
  constructor(private readonly roiService: RoiService) {}

  @Get()
  @Roles("admin", "manager", "finance", "viewer")
  async getROIMetrics(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.roiService.getROIMetrics(eventId, user.organizationId);
  }

  @Post("calculate")
  @Roles("admin", "manager", "finance")
  async calculateROI(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.roiService.calculateROI(eventId, user.organizationId);
  }
}


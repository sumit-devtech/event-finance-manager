import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  getStats(@Request() req) {
    return this.dashboardService.getDashboardStats(
      req.user?.id,
      req.user?.role,
      req.user?.organizationId,
    );
  }
}



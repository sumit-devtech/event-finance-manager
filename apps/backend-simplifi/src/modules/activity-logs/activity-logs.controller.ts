import { Controller, Get, Query, UseGuards, Param } from "@nestjs/common";
import { ActivityLogsService } from "./activity-logs.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get("events/:eventId/activity-logs")
  @Roles("admin", "manager", "finance", "viewer")
  async getEventActivityLogs(
    @Param("eventId") eventId: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.activityLogsService.getActivityLogs(eventId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get("activity-logs")
  @Roles("admin")
  async getAllActivityLogs(
    @CurrentUser() user: any,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    if (!user.organizationId) {
      return { logs: [], total: 0 };
    }
    return this.activityLogsService.getAllActivityLogs(user.organizationId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }
}


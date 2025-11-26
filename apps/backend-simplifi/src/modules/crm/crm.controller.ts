import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { SyncRequestDto } from "./dto/sync-request.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("v1/events/:eventId/crm-sync")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post()
  @Roles("admin", "manager")
  async syncEvent(
    @Param("eventId") eventId: string,
    @Body() dto: SyncRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.crmService.syncEvent(
      eventId,
      dto.crmSystem || "hubspot",
      user.organizationId,
    );
  }

  @Get()
  @Roles("admin", "manager", "finance", "viewer")
  async getSyncStatus(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.crmService.getSyncStatus(eventId, user.organizationId);
  }
}


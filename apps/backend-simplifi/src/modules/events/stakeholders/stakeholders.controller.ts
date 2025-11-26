import { Controller, Get, Post, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { EventsService } from "../events.service";
import { CreateStakeholderDto } from "../dto/create-stakeholder.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

@Controller("v1/events/:eventId/stakeholders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StakeholdersController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Roles("admin", "manager", "finance", "viewer")
  async getStakeholders(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.eventsService.getStakeholders(eventId, user.organizationId);
  }

  @Post()
  @Roles("admin", "manager")
  async addStakeholder(
    @Param("eventId") eventId: string,
    @Body() dto: CreateStakeholderDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.addStakeholder(eventId, dto, user.id, user.organizationId);
  }

  @Delete(":stakeholderId")
  @Roles("admin", "manager")
  async removeStakeholder(
    @Param("eventId") eventId: string,
    @Param("stakeholderId") stakeholderId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.removeStakeholder(eventId, stakeholderId, user.id, user.organizationId);
  }
}


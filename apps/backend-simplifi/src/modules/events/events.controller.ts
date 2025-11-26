import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { UpdateEventStatusDto } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1/events")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Roles("admin", "manager", "finance", "viewer")
  async findAll(
    @CurrentUser() user: any,
    @Query("status") status?: string,
    @Query("createdBy") createdBy?: string,
  ) {
    return this.eventsService.findAll(user.organizationId, { status, createdBy });
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(dto, user.id, user.organizationId);
  }

  @Get(":id")
  @Roles("admin", "manager", "finance", "viewer")
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.eventsService.findOne(id, user.organizationId);
  }

  @Put(":id")
  @Roles("admin", "manager")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(id, dto, user.organizationId);
  }

  @Put(":id/status")
  @Roles("admin", "manager")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateEventStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.updateStatus(id, dto, user.id, user.organizationId);
  }

  @Delete(":id")
  @Roles("admin")
  async delete(@Param("id") id: string, @CurrentUser() user: any) {
    return this.eventsService.delete(id, user.organizationId);
  }
}


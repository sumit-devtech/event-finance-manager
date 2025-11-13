import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotificationType } from "@prisma/client";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Request() req,
    @Query("read") read?: string,
    @Query("type") type?: NotificationType,
  ) {
    const filters: any = {};
    if (read !== undefined) {
      filters.read = read === "true";
    }
    if (type) {
      filters.type = type;
    }
    return this.notificationsService.findAll(req.user.id, filters);
  }

  @Get("unread")
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Put(":id/read")
  markAsRead(@Param("id") id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put("read-all")
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}


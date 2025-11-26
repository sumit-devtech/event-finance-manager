import { Controller, Get, Put, Query, Param, Body, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1/notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query("isRead") isRead?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.notificationsService.findAll(user.id, {
      isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get("unread")
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Put(":id/read")
  async markAsRead(@Param("id") id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Put("read-all")
  async markAllAsRead(@CurrentUser() user: any) {
    const result = await this.notificationsService.markAllAsRead(user.id);
    return { message: `${result.count} notifications marked as read` };
  }
}


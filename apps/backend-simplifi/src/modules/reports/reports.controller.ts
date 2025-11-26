import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { GenerateReportDto } from "./dto/generate-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("events/:eventId/reports")
  @Roles("admin", "manager", "finance", "viewer")
  async findAll(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.reportsService.findAll(eventId, user.organizationId);
  }

  @Post("events/:eventId/reports")
  @Roles("admin", "manager", "finance")
  async generateReport(
    @Param("eventId") eventId: string,
    @Body() dto: Omit<GenerateReportDto, "eventId">,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.generateReport({ ...dto, eventId }, user.id, user.organizationId);
  }

  @Get("reports/:id")
  @Roles("admin", "manager", "finance", "viewer")
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.reportsService.findOne(id, user.organizationId);
  }

  @Get("reports/:id/files")
  @Roles("admin", "manager", "finance", "viewer")
  async getFiles(@Param("id") id: string, @CurrentUser() user: any) {
    const report = await this.reportsService.findOne(id, user.organizationId);
    return report.files;
  }
}


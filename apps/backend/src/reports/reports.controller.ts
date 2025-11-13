import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { ReportsService } from "./reports.service";
import { ComparisonReportDto } from "./dto/comparison-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";

@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("event-summary/:eventId")
  async getEventSummary(@Param("eventId") eventId: string) {
    return this.reportsService.getEventSummary(eventId);
  }

  @Post("comparison")
  @HttpCode(HttpStatus.OK)
  async getComparisonReport(@Body() comparisonDto: ComparisonReportDto) {
    return this.reportsService.getComparisonReport(comparisonDto);
  }

  @Get("export/:format")
  async exportReport(
    @Param("format") format: string,
    @Query("type") type: "summary" | "comparison",
    @Res() res: Response,
    @Query("eventId") eventId?: string,
    @Query("eventIds") eventIds?: string,
  ) {
    if (!["csv", "excel", "pdf"].includes(format)) {
      throw new BadRequestException(`Unsupported format: ${format}. Supported formats: csv, excel, pdf`);
    }

    if (!type || !["summary", "comparison"].includes(type)) {
      throw new BadRequestException("Type parameter is required and must be 'summary' or 'comparison'");
    }

    let data: any;

    if (type === "summary") {
      if (!eventId) {
        throw new BadRequestException("eventId is required for summary reports");
      }
      data = await this.reportsService.getEventSummary(eventId);
    } else {
      if (!eventIds) {
        throw new BadRequestException("eventIds is required for comparison reports");
      }
      const eventIdsArray = eventIds.split(",").map((id) => id.trim());
      if (eventIdsArray.length < 2) {
        throw new BadRequestException("At least 2 event IDs are required for comparison reports");
      }
      data = await this.reportsService.getComparisonReport({ eventIds: eventIdsArray });
    }

    const exportResult = await this.reportsService.exportReport(
      format as "csv" | "excel" | "pdf",
      type,
      data,
      eventId,
    );

    res.setHeader("Content-Type", exportResult.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${exportResult.filename}"`);
    res.send(exportResult.buffer);
  }
}


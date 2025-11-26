import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1/organizations")
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.organizationsService.findOne(id, user.organizationId);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.update(id, dto, user.organizationId);
  }

  @Get(":id/stats")
  async getStats(@Param("id") id: string, @CurrentUser() user: any) {
    return this.organizationsService.getStats(id, user.organizationId);
  }
}


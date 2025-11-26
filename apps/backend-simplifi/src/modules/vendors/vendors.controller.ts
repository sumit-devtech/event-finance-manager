import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { VendorsService } from "./vendors.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("v1/vendors")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @Roles("admin", "manager", "finance", "viewer")
  async findAll(@CurrentUser() user: any) {
    return this.vendorsService.findAll(user.organizationId);
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() dto: CreateVendorDto, @CurrentUser() user: any) {
    return this.vendorsService.create(dto, user.organizationId);
  }

  @Get(":id")
  @Roles("admin", "manager", "finance", "viewer")
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.vendorsService.findOne(id, user.organizationId);
  }

  @Put(":id")
  @Roles("admin", "manager")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateVendorDto,
    @CurrentUser() user: any,
  ) {
    return this.vendorsService.update(id, dto, user.organizationId);
  }

  @Delete(":id")
  @Roles("admin")
  async delete(@Param("id") id: string, @CurrentUser() user: any) {
    return this.vendorsService.delete(id, user.organizationId);
  }

  @Post(":vendorId/events/:eventId")
  @Roles("admin", "manager")
  async assignToEvent(
    @Param("vendorId") vendorId: string,
    @Param("eventId") eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.vendorsService.assignToEvent(vendorId, eventId, user.organizationId);
  }
}


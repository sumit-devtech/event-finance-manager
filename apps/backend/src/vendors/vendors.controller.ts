import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { VendorsService } from "./vendors.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";

@Controller("vendors")
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  create(@Body() createVendorDto: CreateVendorDto, @Request() req) {
    return this.vendorsService.create(
      createVendorDto,
      req.user.organizationId,
    );
  }

  @Get()
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findAll(@Request() req) {
    return this.vendorsService.findAll(req.user.organizationId);
  }

  @Get(":id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string) {
    return this.vendorsService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  update(@Param("id") id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  remove(@Param("id") id: string) {
    return this.vendorsService.remove(id);
  }
}



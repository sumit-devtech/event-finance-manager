import { Controller, Get, Post, Put, Param, Body, UseGuards } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { CreateContractDto } from "../dto/create-contract.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

@Controller("v1")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get("vendors/:vendorId/contracts")
  @Roles("admin", "manager", "finance", "viewer")
  async findAll(@Param("vendorId") vendorId: string, @CurrentUser() user: any) {
    return this.contractsService.findAll(vendorId, user.organizationId);
  }

  @Post("vendors/:vendorId/contracts")
  @Roles("admin", "manager", "finance")
  async create(
    @Param("vendorId") vendorId: string,
    @Body() dto: Omit<CreateContractDto, "vendorId">,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.create({ ...dto, vendorId }, user.id, user.organizationId);
  }

  @Get("contracts/:id")
  @Roles("admin", "manager", "finance", "viewer")
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.contractsService.findOne(id, user.organizationId);
  }

  @Put("contracts/:id")
  @Roles("admin", "manager", "finance")
  async update(
    @Param("id") id: string,
    @Body() dto: Partial<CreateContractDto>,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.update(id, dto, user.organizationId);
  }
}


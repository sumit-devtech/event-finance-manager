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
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { InviteUserDto } from "./dto/invite-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1/users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("admin", "manager")
  async findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.organizationId);
  }

  @Post()
  @Roles("admin")
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user.organizationId);
  }

  @Post("invite")
  @Roles("admin", "manager")
  async invite(@Body() dto: InviteUserDto, @CurrentUser() user: any) {
    return this.usersService.invite(dto, user.organizationId);
  }

  @Get(":id")
  @Roles("admin", "manager")
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user.organizationId);
  }

  @Put(":id")
  @Roles("admin")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, dto, user.organizationId);
  }

  @Put(":id/role")
  @Roles("admin")
  async updateRole(
    @Param("id") id: string,
    @Body() body: { role: string },
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateRole(id, body.role, user.organizationId);
  }

  @Delete(":id")
  @Roles("admin")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.organizationId);
  }
}


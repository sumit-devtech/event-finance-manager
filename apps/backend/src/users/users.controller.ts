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
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { AssignEventDto } from "./dto/assign-event.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user.id, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req) {
    console.log('[UsersController] findAll - organizationId:', req.user.organizationId);
    return this.usersService.findAll(req.user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    return this.usersService.findOne(id, req.user.organizationId);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user.id, req.user.organizationId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @Request() req) {
    await this.usersService.remove(id, req.user.id, req.user.organizationId);
  }

  @Put(":id/role")
  assignRole(@Param("id") id: string, @Body() assignRoleDto: AssignRoleDto, @Request() req) {
    return this.usersService.assignRole(id, assignRoleDto, req.user.id, req.user.organizationId);
  }

  @Post(":id/events")
  @HttpCode(HttpStatus.CREATED)
  assignEvent(@Param("id") id: string, @Body() assignEventDto: AssignEventDto, @Request() req) {
    return this.usersService.assignEvent(id, assignEventDto, req.user.id, req.user.organizationId);
  }

  @Get(":id/activity-logs")
  getActivityLogs(@Param("id") id: string, @Query("eventId") eventId: string | undefined, @Request() req) {
    return this.usersService.getActivityLogs(id, eventId, req.user.organizationId);
  }
}


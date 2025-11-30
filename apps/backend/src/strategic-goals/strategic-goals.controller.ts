import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { StrategicGoalsService } from "./strategic-goals.service";
import { CreateStrategicGoalDto } from "./dto/create-strategic-goal.dto";
import { UpdateStrategicGoalDto } from "./dto/update-strategic-goal.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";

@Controller("events/:eventId/strategic-goals")
@UseGuards(JwtAuthGuard)
export class StrategicGoalsController {
  constructor(private readonly strategicGoalsService: StrategicGoalsService) {}

  @Get()
  findAll(@Param("eventId") eventId: string) {
    return this.strategicGoalsService.findAllByEvent(eventId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Admin, UserRole.EventManager)
  @UseGuards(RolesGuard)
  create(
    @Param("eventId") eventId: string,
    @Body() createGoalDto: CreateStrategicGoalDto,
  ) {
    return this.strategicGoalsService.create(eventId, createGoalDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.strategicGoalsService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.Admin, UserRole.EventManager)
  @UseGuards(RolesGuard)
  update(@Param("id") id: string, @Body() updateGoalDto: UpdateStrategicGoalDto) {
    return this.strategicGoalsService.update(id, updateGoalDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Admin, UserRole.EventManager)
  @UseGuards(RolesGuard)
  remove(@Param("id") id: string) {
    return this.strategicGoalsService.remove(id);
  }
}


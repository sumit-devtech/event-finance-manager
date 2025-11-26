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
import { BudgetsService } from "./budgets.service";
import { CreateBudgetVersionDto } from "./dto/create-budget-version.dto";
import { UpdateBudgetVersionDto } from "./dto/update-budget-version.dto";
import { CreateBudgetLineItemDto } from "./dto/create-budget-line-item.dto";
import { UpdateBudgetLineItemDto } from "./dto/update-budget-line-item.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("api/v1")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get("events/:eventId/budgets")
  @Roles("admin", "manager", "finance", "viewer")
  async findAll(@Param("eventId") eventId: string, @CurrentUser() user: any) {
    return this.budgetsService.findAll(eventId, user.organizationId);
  }

  @Post("events/:eventId/budgets")
  @Roles("admin", "manager", "finance")
  async create(
    @Param("eventId") eventId: string,
    @Body() dto: Omit<CreateBudgetVersionDto, "eventId">,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.create({ ...dto, eventId }, user.id, user.organizationId);
  }

  @Get("budgets/:budgetId")
  @Roles("admin", "manager", "finance", "viewer")
  async findOne(@Param("budgetId") budgetId: string, @CurrentUser() user: any) {
    return this.budgetsService.findOne(budgetId, user.organizationId);
  }

  @Put("budgets/:budgetId")
  @Roles("admin", "manager", "finance")
  async update(
    @Param("budgetId") budgetId: string,
    @Body() dto: UpdateBudgetVersionDto,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.update(budgetId, dto, user.id, user.organizationId);
  }

  @Put("budgets/:budgetId/finalize")
  @Roles("admin", "manager", "finance")
  async finalize(@Param("budgetId") budgetId: string, @CurrentUser() user: any) {
    return this.budgetsService.finalize(budgetId, user.id, user.organizationId);
  }

  @Post("budgets/:budgetId/clone")
  @Roles("admin", "manager", "finance")
  async clone(@Param("budgetId") budgetId: string, @CurrentUser() user: any) {
    return this.budgetsService.clone(budgetId, user.id, user.organizationId);
  }

  @Post("budgets/:budgetId/line-items")
  @Roles("admin", "manager", "finance")
  async addLineItem(
    @Param("budgetId") budgetId: string,
    @Body() dto: CreateBudgetLineItemDto,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.addLineItem(budgetId, dto, user.id, user.organizationId);
  }

  @Put("budgets/line-items/:itemId")
  @Roles("admin", "manager", "finance")
  async updateLineItem(
    @Param("itemId") itemId: string,
    @Body() dto: UpdateBudgetLineItemDto,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.updateLineItem(itemId, dto, user.id, user.organizationId);
  }

  @Delete("budgets/line-items/:itemId")
  @Roles("admin", "manager", "finance")
  async deleteLineItem(@Param("itemId") itemId: string, @CurrentUser() user: any) {
    return this.budgetsService.deleteLineItem(itemId, user.id, user.organizationId);
  }
}


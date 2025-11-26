import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { ApprovalService } from "./approval.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ApprovalActionDto } from "./dto/approval-action.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("v1")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly approvalService: ApprovalService,
  ) {}

  @Get("expenses")
  @Roles("admin", "manager", "finance", "viewer")
  async findAll(
    @CurrentUser() user: any,
    @Query("eventId") eventId?: string,
    @Query("status") status?: string,
    @Query("vendorId") vendorId?: string,
  ) {
    return this.expensesService.findAll(user.organizationId, { eventId, status, vendorId });
  }

  @Post("events/:eventId/expenses")
  @Roles("admin", "manager", "finance")
  async create(
    @Param("eventId") eventId: string,
    @Body() dto: Omit<CreateExpenseDto, "eventId">,
    @CurrentUser() user: any,
  ) {
    return this.expensesService.create({ ...dto, eventId }, user.id, user.organizationId);
  }

  @Get("expenses/:id")
  @Roles("admin", "manager", "finance", "viewer")
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.expensesService.findOne(id, user.organizationId);
  }

  @Put("expenses/:id")
  @Roles("admin", "manager", "finance")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser() user: any,
  ) {
    return this.expensesService.update(id, dto, user.organizationId);
  }

  @Delete("expenses/:id")
  @Roles("admin", "manager", "finance")
  async delete(@Param("id") id: string, @CurrentUser() user: any) {
    return this.expensesService.delete(id, user.organizationId);
  }

  @Post("expenses/:id/submit-approval")
  @Roles("admin", "manager", "finance")
  async submitForApproval(@Param("id") id: string, @CurrentUser() user: any) {
    return this.expensesService.submitForApproval(id, user.organizationId);
  }

  @Get("expenses/:id/approvals")
  @Roles("admin", "manager", "finance", "viewer")
  async getApprovalHistory(@Param("id") id: string, @CurrentUser() user: any) {
    // Verify expense exists and user has access
    await this.expensesService.findOne(id, user.organizationId);
    return this.approvalService.getApprovalHistory(id);
  }

  @Post("expenses/:id/approval")
  @Roles("admin", "manager", "finance")
  async handleApproval(
    @Param("id") id: string,
    @Body() dto: ApprovalActionDto,
    @CurrentUser() user: any,
  ) {
    // Verify approver matches current user
    if (dto.approverId !== user.id) {
      throw new BadRequestException("Approver ID must match current user");
    }
    return this.expensesService.handleApproval(id, dto, user.organizationId);
  }
}


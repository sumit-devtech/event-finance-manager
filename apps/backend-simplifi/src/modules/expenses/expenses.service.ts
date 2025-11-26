import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ActivityLogsService } from "../activity-logs/activity-logs.service";
import { ApprovalService } from "./approval.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ApprovalActionDto } from "./dto/approval-action.dto";

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
    private approvalService: ApprovalService,
  ) {}

  async findAll(
    organizationId: string,
    filters?: { eventId?: string; status?: string; vendorId?: string },
  ) {
    const where: any = {
      event: {
        organizationId,
      },
    };

    if (filters?.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }

    return this.prisma.client.expense.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        workflows: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
          orderBy: { actionAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, organizationId: string) {
    const expense = await this.prisma.client.expense.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        workflows: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
              },
            },
          },
          orderBy: { actionAt: "desc" },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException("Expense not found");
    }

    if (expense.event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this expense");
    }

    return expense;
  }

  async create(dto: CreateExpenseDto, userId: string, organizationId: string) {
    // Verify event exists and belongs to organization
    const event = await this.prisma.client.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const expense = await this.prisma.client.expense.create({
      data: {
        eventId: dto.eventId,
        title: dto.title,
        amount: dto.amount,
        vendorId: dto.vendorId,
        description: dto.description,
        createdBy: userId,
        status: "pending",
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(dto.eventId, userId, "expense.created", {
      expenseId: expense.id,
      title: expense.title,
      amount: expense.amount,
    });

    // Auto-submit for approval if amount exceeds threshold
    const autoApproveThreshold = 1000; // $1,000
    if (dto.amount >= autoApproveThreshold) {
      await this.submitForApproval(expense.id, organizationId);
    }

    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto, organizationId: string) {
    const expense = await this.findOne(id, organizationId);

    // Don't allow updating approved expenses
    if (expense.status === "approved") {
      throw new BadRequestException("Cannot update approved expense");
    }

    const updated = await this.prisma.client.expense.update({
      where: { id },
      data: dto,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(expense.eventId, null, "expense.updated", {
      expenseId: id,
      changes: dto,
    });

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const expense = await this.findOne(id, organizationId);

    // Don't allow deleting approved expenses
    if (expense.status === "approved") {
      throw new BadRequestException("Cannot delete approved expense");
    }

    await this.prisma.client.expense.delete({
      where: { id },
    });

    // Log activity
    await this.activityLogsService.logActivity(expense.eventId, null, "expense.deleted", {
      expenseId: id,
      title: expense.title,
    });

    return { message: "Expense deleted successfully" };
  }

  async submitForApproval(expenseId: string, organizationId: string) {
    const expense = await this.findOne(expenseId, organizationId);

    if (expense.status !== "pending") {
      throw new BadRequestException("Expense is already submitted for approval");
    }

    // Determine approvers
    const approverIds = await this.approvalService.determineApprovers(expense, organizationId);

    if (approverIds.length === 0) {
      throw new BadRequestException("No approvers found for this expense");
    }

    // Notify approvers
    await this.approvalService.notifyApprovers(expense, approverIds);

    // Update expense status
    const updated = await this.prisma.client.expense.update({
      where: { id: expenseId },
      data: { status: "under_review" },
    });

    // Log activity
    await this.activityLogsService.logActivity(expense.eventId, null, "expense.submitted_for_approval", {
      expenseId,
      approverCount: approverIds.length,
    });

    return updated;
  }

  async handleApproval(expenseId: string, dto: ApprovalActionDto, organizationId: string) {
    const expense = await this.findOne(expenseId, organizationId);

    if (expense.status === "approved" || expense.status === "rejected") {
      throw new BadRequestException("Expense has already been processed");
    }

    const result = await this.prisma.client.$transaction(async (tx) => {
      // Create approval workflow record
      const workflow = await tx.approvalWorkflow.create({
        data: {
          expenseId,
          approverId: dto.approverId,
          action: dto.action,
          comments: dto.comments,
        },
      });

      // Update expense status
      const updatedExpense = await tx.expense.update({
        where: { id: expenseId },
        data: { status: dto.action === "approved" ? "approved" : "rejected" },
      });

      return { workflow, expense: updatedExpense };
    });

    // Log activity
    await this.activityLogsService.logActivity(expense.eventId, dto.approverId, `expense.${dto.action}`, {
      expenseId,
      approverId: dto.approverId,
      comments: dto.comments,
    });

    // TODO: Notify expense creator about approval/rejection
    // TODO: Update ROI metrics if approved

    return result;
  }

  async calculateEventActualSpend(eventId: string): Promise<number> {
    const result = await this.prisma.client.expense.aggregate({
      where: {
        eventId,
        status: "approved",
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }
}


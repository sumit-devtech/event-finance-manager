import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ApproveExpenseDto, ExpenseAction } from "./dto/approve-expense.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { BudgetItemsService } from "../budget-items/budget-items.service";
import { UserRole } from "../auth/types/user-role.enum";
import { ExpenseStatus, NotificationType } from "@event-finance-manager/database";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => BudgetItemsService))
    private readonly budgetItemsService: BudgetItemsService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string, organizationId?: string) {
    // Verify event exists
    const event = await this.prisma.client.event.findUnique({
      where: { id: createExpenseDto.eventId },
      select: { id: true, name: true, budget: true, organizationId: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${createExpenseDto.eventId} not found`);
    }

    // If budgetItemId is provided, verify it exists and belongs to the event
    if (createExpenseDto.budgetItemId) {
      const budgetItem = await this.prisma.client.budgetItem.findUnique({
        where: { id: createExpenseDto.budgetItemId },
        select: { id: true, eventId: true, category: true },
      });

      if (!budgetItem) {
        throw new NotFoundException(`Budget item with ID ${createExpenseDto.budgetItemId} not found`);
      }

      if (budgetItem.eventId !== createExpenseDto.eventId) {
        throw new BadRequestException("Budget item does not belong to the specified event");
      }

      // Ensure category matches if provided
      if (createExpenseDto.category && budgetItem.category !== createExpenseDto.category) {
        throw new BadRequestException("Expense category does not match budget item category");
      }
    }

    const expense = await this.prisma.client.expense.create({
      data: {
        eventId: createExpenseDto.eventId,
        organizationId: organizationId || event.organizationId,
        category: createExpenseDto.category,
        budgetItemId: createExpenseDto.budgetItemId || null,
        title: createExpenseDto.title,
        amount: createExpenseDto.amount,
        description: createExpenseDto.description || null,
        vendor: createExpenseDto.vendor || null,
        vendorId: createExpenseDto.vendorId || null,
        status: ExpenseStatus.Pending,
        createdBy: userId,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        budgetItem: {
          select: {
            id: true,
            category: true,
            description: true,
          },
        },
      },
    });

    // Create activity log
    await this.createActivityLog(userId, "expense.created", {
      expenseId: expense.id,
      eventId: expense.eventId,
      amount: expense.amount,
    });

    // Notify event manager and admin about new expense
    await this.notifyExpenseCreated(expense.eventId, expense.id, expense.title, expense.amount);

    return expense;
  }

  async findAll(filters?: {
    eventId?: string;
    status?: ExpenseStatus;
    category?: string;
    organizationId?: string;
  }) {
    const where: any = {};

    if (filters?.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    const expenses = await this.prisma.client.expense.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        budgetItem: {
          select: {
            id: true,
            category: true,
            description: true,
          },
        },
        vendorLink: {
          select: {
            id: true,
            name: true,
          },
        },
        workflows: {
          include: {
            approver: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            actionAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return expenses;
  }

  async findOne(id: string) {
    const expense = await this.prisma.client.expense.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            budget: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        budgetItem: {
          select: {
            id: true,
            category: true,
            description: true,
            estimatedCost: true,
            actualCost: true,
          },
        },
        vendorLink: {
          select: {
            id: true,
            name: true,
          },
        },
        receiptFiles: {
          select: {
            id: true,
            filename: true,
            path: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
          },
        },
        workflows: {
          include: {
            approver: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            actionAt: "desc",
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    const expense = await this.findOne(id);

    // Only allow updates if expense is pending
    if (expense.status !== ExpenseStatus.Pending) {
      throw new BadRequestException("Can only update pending expenses");
    }

    // Only creator can update their own expense
    if (expense.createdBy !== userId) {
      throw new ForbiddenException("You can only update your own expenses");
    }

    // If budgetItemId is being updated, verify it exists
    if (updateExpenseDto.budgetItemId) {
      const budgetItem = await this.prisma.client.budgetItem.findUnique({
        where: { id: updateExpenseDto.budgetItemId },
        select: { id: true, eventId: true, category: true },
      });

      if (!budgetItem) {
        throw new NotFoundException(`Budget item with ID ${updateExpenseDto.budgetItemId} not found`);
      }

      if (budgetItem.eventId !== expense.eventId) {
        throw new BadRequestException("Budget item does not belong to the expense's event");
      }
    }

    const updatedExpense = await this.prisma.client.expense.update({
      where: { id },
      data: {
        ...updateExpenseDto,
        budgetItemId: updateExpenseDto.budgetItemId || expense.budgetItemId,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        budgetItem: {
          select: {
            id: true,
            category: true,
            description: true,
          },
        },
      },
    });

    // Create activity log
    await this.createActivityLog(userId, "expense.updated", {
      expenseId: updatedExpense.id,
      eventId: updatedExpense.eventId,
    });

    return updatedExpense;
  }

  async remove(id: string, userId: string) {
    const expense = await this.findOne(id);

    // Only allow deletion if expense is pending
    if (expense.status !== ExpenseStatus.Pending) {
      throw new BadRequestException("Can only delete pending expenses");
    }

    // Only creator or admin can delete
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (expense.createdBy !== userId && user?.role !== UserRole.Admin) {
      throw new ForbiddenException("You can only delete your own expenses or must be an admin");
    }

    await this.prisma.client.expense.delete({
      where: { id },
    });

    // Create activity log
    await this.createActivityLog(userId, "expense.deleted", {
      expenseId: expense.id,
      eventId: expense.eventId,
    });
  }

  async approveOrReject(
    id: string,
    approveExpenseDto: ApproveExpenseDto,
    userId: string,
    userRole: UserRole,
  ) {
    const expense = await this.findOne(id);

    // Only pending expenses can be approved/rejected
    if (expense.status !== ExpenseStatus.Pending) {
      throw new BadRequestException("Can only approve or reject pending expenses");
    }

    // Check permissions - Manager or Admin can approve
    if (userRole !== UserRole.Admin && userRole !== UserRole.EventManager) {
      throw new ForbiddenException("Only managers and admins can approve expenses");
    }

    // Two-level approval workflow: Manager approves first, then Admin final approval
    // Check existing approvals
    const existingApprovals = expense.workflows.filter((w) => w.action === "approved");
    const hasManagerApproval = existingApprovals.some((w) => {
      return w.approver?.role === UserRole.EventManager;
    });
    const hasAdminApproval = existingApprovals.some((w) => {
      return w.approver?.role === UserRole.Admin;
    });

    let newStatus: ExpenseStatus = expense.status;
    let shouldUpdateBudget = false;

    // Handle rejection - either Manager or Admin can reject immediately
    if (approveExpenseDto.action === ExpenseAction.Reject) {
      newStatus = ExpenseStatus.Rejected;
    }
    // Handle approval
    else if (approveExpenseDto.action === ExpenseAction.Approve) {
      if (userRole === UserRole.EventManager) {
        // Manager approval - keep as Pending, wait for Admin
        if (hasManagerApproval) {
          throw new BadRequestException("Manager has already approved this expense");
        }
        newStatus = ExpenseStatus.Pending; // Still pending, waiting for Admin
      } else if (userRole === UserRole.Admin) {
        // Admin approval - final approval
        if (!hasManagerApproval) {
          throw new BadRequestException("Manager must approve before Admin can give final approval");
        }
        if (hasAdminApproval) {
          throw new BadRequestException("Admin has already approved this expense");
        }
        newStatus = ExpenseStatus.Approved; // Final approval
        shouldUpdateBudget = true;
      }
    }

    // Create approval workflow record
    await this.prisma.client.approvalWorkflow.create({
      data: {
        expenseId: id,
        approverId: userId,
        action: approveExpenseDto.action === ExpenseAction.Approve ? "approved" : "rejected",
        comments: approveExpenseDto.comments || null,
      },
    });

    // Update expense status
    const updatedExpense = await this.prisma.client.expense.update({
      where: { id },
      data: {
        status: newStatus,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        budgetItem: {
          select: {
            id: true,
            category: true,
            description: true,
          },
        },
      },
    });

    // If finally approved, validate against category budget and update budget item actualCost
    if (shouldUpdateBudget && newStatus === ExpenseStatus.Approved) {
      // Check if expense exceeds category budget
      if (expense.category) {
        await this.validateCategoryBudget(expense.eventId, expense.category, expense.amount, expense.budgetItemId);
      }
      await this.updateBudgetItemActualCost(expense);
    }

    // Create activity log
    await this.createActivityLog(userId, `expense.${approveExpenseDto.action}`, {
      expenseId: expense.id,
      eventId: expense.eventId,
      action: approveExpenseDto.action,
    });

    // Notify creator about approval/rejection
    if (expense.createdBy) {
      let notificationTitle = "";
      let notificationMessage = "";

      if (approveExpenseDto.action === ExpenseAction.Reject) {
        notificationTitle = "Expense Rejected";
        notificationMessage = `Your expense "${expense.title}" has been rejected.${approveExpenseDto.comments ? ` Comments: ${approveExpenseDto.comments}` : ""}`;
      } else if (userRole === UserRole.EventManager) {
        notificationTitle = "Expense Approved by Manager";
        notificationMessage = `Your expense "${expense.title}" has been approved by the manager and is pending final admin approval.`;
      } else if (userRole === UserRole.Admin) {
        notificationTitle = "Expense Approved";
        notificationMessage = `Your expense "${expense.title}" has been fully approved and the budget has been updated.`;
      }

      await this.notificationsService.createNotification({
        userId: expense.createdBy,
        organizationId: expense.organizationId || undefined,
        type: approveExpenseDto.action === ExpenseAction.Approve ? NotificationType.Success : NotificationType.Warning,
        title: notificationTitle,
        message: notificationMessage,
        metadata: {
          expenseId: expense.id,
          eventId: expense.eventId,
          action: approveExpenseDto.action,
        },
      });
    }

    // If manager approved, notify admins for final approval
    if (approveExpenseDto.action === ExpenseAction.Approve && userRole === UserRole.EventManager && newStatus === ExpenseStatus.Pending) {
      await this.notifyAdminsForFinalApproval(expense.eventId, expense.id, expense.title);
    }

    return updatedExpense;
  }

  async uploadFile(expenseId: string, file: { originalname: string; buffer: Buffer; mimetype: string; size: number }, userId: string) {
    const expense = await this.findOne(expenseId);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000000000);
    const fileExtension = path.extname(file.originalname);
    const filename = `file-${timestamp}-${randomSuffix}${fileExtension}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Create file record
    const fileRecord = await this.prisma.client.file.create({
      data: {
        expenseId: expenseId,
        filename: file.originalname,
        path: filePath,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    // Create activity log
    await this.createActivityLog(userId, "expense.file.uploaded", {
      expenseId: expense.id,
      fileId: fileRecord.id,
      filename: file.originalname,
    });

    return fileRecord;
  }

  async deleteFile(expenseId: string, fileId: string, userId: string) {
    const expense = await this.findOne(expenseId);

    const file = await this.prisma.client.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.expenseId !== expenseId) {
      throw new NotFoundException("File not found or does not belong to this expense");
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file record
    await this.prisma.client.file.delete({
      where: { id: fileId },
    });

    // Create activity log
    await this.createActivityLog(userId, "expense.file.deleted", {
      expenseId: expense.id,
      fileId: file.id,
    });
  }

  async findByEvent(eventId: string) {
    return this.findAll({ eventId });
  }

  private async updateBudgetItemActualCost(expense: any) {
    if (!expense.budgetItemId) {
      return;
    }

    // Get current budget item
    const budgetItem = await this.prisma.client.budgetItem.findUnique({
      where: { id: expense.budgetItemId },
      select: { id: true, actualCost: true },
    });

    if (!budgetItem) {
      return;
    }

    // Calculate new actualCost (sum of all approved expenses for this budget item)
    const approvedExpenses = await this.prisma.client.expense.findMany({
      where: {
        budgetItemId: expense.budgetItemId,
        status: ExpenseStatus.Approved,
      },
      select: {
        amount: true,
      },
    });

    const totalActualCost = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Update budget item
    await this.prisma.client.budgetItem.update({
      where: { id: expense.budgetItemId },
      data: {
        actualCost: totalActualCost,
      },
    });
  }

  private async createActivityLog(userId: string, action: string, details: any) {
    try {
      const expense = details.expenseId
        ? await this.prisma.client.expense.findUnique({
            where: { id: details.expenseId },
            select: { organizationId: true, eventId: true },
          })
        : null;

      await this.prisma.client.activityLog.create({
        data: {
          userId,
          organizationId: expense?.organizationId || null,
          eventId: expense?.eventId || details.eventId || null,
          action,
          details: details as any,
        },
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error("Failed to create activity log:", error);
    }
  }

  private async validateCategoryBudget(eventId: string, category: string, expenseAmount: number, budgetItemId?: string | null) {
    try {
      const categoryTotals = await this.budgetItemsService.getCategoryTotals(eventId);
      const categoryTotal = categoryTotals[category];

      if (categoryTotal) {
        // Check if expense would exceed remaining budget
        if (expenseAmount > categoryTotal.remaining) {
          // This is a warning, not an error - allow approval but notify
          console.warn(
            `Expense of $${expenseAmount} exceeds remaining category budget of $${categoryTotal.remaining} for ${category}`
          );
          // Could create a notification here for over-budget expenses
        }
      }
    } catch (error) {
      // Log error but don't fail the approval
      console.error("Failed to validate category budget:", error);
    }
  }

  private async notifyAdminsForFinalApproval(eventId: string, expenseId: string, title: string) {
    try {
      const event = await this.prisma.client.event.findUnique({
        where: { id: eventId },
        include: {
          organization: {
            include: {
              users: {
                where: {
                  role: UserRole.Admin,
                  isActive: true,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!event || !event.organization?.users) {
        return;
      }

      // Notify all admins
      for (const admin of event.organization.users) {
        await this.notificationsService.createNotification({
          userId: admin.id,
          organizationId: event.organizationId || undefined,
          type: NotificationType.Info,
          title: "Expense Pending Final Approval",
          message: `An expense "${title}" has been approved by the manager and requires your final approval.`,
          metadata: {
            expenseId,
            eventId,
          },
        });
      }
    } catch (error) {
      console.error("Failed to send admin notifications:", error);
    }
  }

  private async notifyExpenseCreated(eventId: string, expenseId: string, title: string, amount: number) {
    try {
      // Get event manager and admin users
      const event = await this.prisma.client.event.findUnique({
        where: { id: eventId },
        include: {
          assignments: {
            where: {
              role: "Manager",
            },
            include: {
              user: {
                select: {
                  id: true,
                  role: true,
                },
              },
            },
          },
          organization: {
            include: {
              users: {
                where: {
                  role: UserRole.Admin,
                  isActive: true,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        return;
      }

      // Notify managers
      for (const assignment of event.assignments) {
        if (assignment.user) {
          await this.notificationsService.createNotification({
            userId: assignment.user.id,
            organizationId: event.organizationId || undefined,
            type: NotificationType.Info,
            title: "New Expense Submitted",
            message: `A new expense "${title}" for $${amount.toFixed(2)} has been submitted and requires your approval.`,
            metadata: {
              expenseId,
              eventId,
            },
          });
        }
      }

      // Notify admins
      if (event.organization?.users) {
        for (const admin of event.organization.users) {
          await this.notificationsService.createNotification({
            userId: admin.id,
            organizationId: event.organizationId || undefined,
            type: NotificationType.Info,
            title: "New Expense Submitted",
            message: `A new expense "${title}" for $${amount.toFixed(2)} has been submitted and requires approval.`,
            metadata: {
              expenseId,
              eventId,
            },
          });
        }
      }
    } catch (error) {
      // Log error but don't fail the operation
      console.error("Failed to send expense notifications:", error);
    }
  }
}


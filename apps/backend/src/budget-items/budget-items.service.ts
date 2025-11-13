import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetItemDto, BudgetItemCategory } from "./dto/create-budget-item.dto";
import { UpdateBudgetItemDto } from "./dto/update-budget-item.dto";
import { NotificationsService } from "../notifications/notifications.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class BudgetItemsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAllByEvent(eventId: string) {
    // Verify event exists
    await this.verifyEventExists(eventId);

    return this.prisma.client.budgetItem.findMany({
      where: { eventId },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const budgetItem = await this.prisma.client.budgetItem.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        files: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!budgetItem) {
      throw new NotFoundException(`Budget item with ID ${id} not found`);
    }

    return budgetItem;
  }

  async create(eventId: string, createBudgetItemDto: CreateBudgetItemDto, userId: string) {
    // Verify event exists
    await this.verifyEventExists(eventId);

    const budgetItem = await this.prisma.client.budgetItem.create({
      data: {
        eventId,
        category: createBudgetItemDto.category,
        description: createBudgetItemDto.description,
        estimatedCost: createBudgetItemDto.estimatedCost
          ? createBudgetItemDto.estimatedCost
          : null,
        actualCost: createBudgetItemDto.actualCost ? createBudgetItemDto.actualCost : null,
        vendor: createBudgetItemDto.vendor,
      },
      include: {
        files: true,
      },
    });

    // Check for over-budget alerts
    await this.checkOverBudgetAlerts(eventId, userId);

    // Create activity log
    await this.createActivityLog(userId, "budget-item.created", {
      budgetItemId: budgetItem.id,
      eventId,
      category: budgetItem.category,
    }, eventId);

    return budgetItem;
  }

  async update(id: string, updateBudgetItemDto: UpdateBudgetItemDto, userId: string) {
    const budgetItem = await this.findOne(id);
    const eventId = budgetItem.eventId;

    const updateData: any = {};
    if (updateBudgetItemDto.category !== undefined) {
      updateData.category = updateBudgetItemDto.category;
    }
    if (updateBudgetItemDto.description !== undefined) {
      updateData.description = updateBudgetItemDto.description;
    }
    if (updateBudgetItemDto.estimatedCost !== undefined) {
      updateData.estimatedCost = updateBudgetItemDto.estimatedCost;
    }
    if (updateBudgetItemDto.actualCost !== undefined) {
      updateData.actualCost = updateBudgetItemDto.actualCost;
    }
    if (updateBudgetItemDto.vendor !== undefined) {
      updateData.vendor = updateBudgetItemDto.vendor;
    }

    const updatedBudgetItem = await this.prisma.client.budgetItem.update({
      where: { id },
      data: updateData,
      include: {
        files: true,
      },
    });

    // Check for over-budget alerts
    await this.checkOverBudgetAlerts(eventId, userId);

    // Create activity log
    await this.createActivityLog(userId, "budget-item.updated", {
      budgetItemId: id,
      eventId,
      changes: Object.keys(updateData),
    }, eventId);

    return updatedBudgetItem;
  }

  async remove(id: string, userId: string): Promise<void> {
    const budgetItem = await this.findOne(id);
    const eventId = budgetItem.eventId;

    await this.prisma.client.budgetItem.delete({
      where: { id },
    });

    // Check for over-budget alerts
    await this.checkOverBudgetAlerts(eventId, userId);

    // Create activity log
    await this.createActivityLog(userId, "budget-item.deleted", {
      budgetItemId: id,
      eventId,
      category: budgetItem.category,
    }, eventId);
  }

  async getBudgetTotals(eventId: string) {
    // Verify event exists
    await this.verifyEventExists(eventId);

    const budgetItems = await this.prisma.client.budgetItem.findMany({
      where: { eventId },
    });

    // Calculate totals per category
    const totalsByCategory: Record<string, { estimated: number; actual: number }> = {};
    let totalEstimated = 0;
    let totalActual = 0;

    budgetItems.forEach((item) => {
      const category = item.category;
      if (!totalsByCategory[category]) {
        totalsByCategory[category] = { estimated: 0, actual: 0 };
      }

      const estimated = item.estimatedCost ? Number(item.estimatedCost) : 0;
      const actual = item.actualCost ? Number(item.actualCost) : 0;

      totalsByCategory[category].estimated += estimated;
      totalsByCategory[category].actual += actual;
      totalEstimated += estimated;
      totalActual += actual;
    });

    // Calculate variance
    const variance = totalActual - totalEstimated;
    const variancePercentage =
      totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;

    return {
      totalsByCategory,
      summary: {
        totalEstimated,
        totalActual,
        variance,
        variancePercentage: Number(variancePercentage.toFixed(2)),
      },
    };
  }

  async getVariance(eventId: string) {
    const totals = await this.getBudgetTotals(eventId);
    return {
      variance: totals.summary.variance,
      variancePercentage: totals.summary.variancePercentage,
      isOverBudget: totals.summary.variance > 0,
    };
  }

  async uploadFile(
    budgetItemId: string,
    file: { originalname: string; path: string; mimetype: string; size: number },
    userId: string,
  ) {
    const budgetItem = await this.findOne(budgetItemId);
    const eventId = budgetItem.eventId;

    const fileRecord = await this.prisma.client.file.create({
      data: {
        budgetItemId,
        eventId,
        filename: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    // Create activity log
    await this.createActivityLog(userId, "budget-item.file.uploaded", {
      budgetItemId,
      eventId,
      fileId: fileRecord.id,
      filename: file.originalname,
    }, eventId);

    return fileRecord;
  }

  async deleteFile(budgetItemId: string, fileId: string, userId: string) {
    const budgetItem = await this.findOne(budgetItemId);
    const eventId = budgetItem.eventId;

    const file = await this.prisma.client.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.budgetItemId !== budgetItemId) {
      throw new NotFoundException("File not found");
    }

    // Delete physical file
    const filePath = path.resolve(file.path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete physical file: ${filePath}`, error);
      }
    }

    await this.prisma.client.file.delete({
      where: { id: fileId },
    });

    // Create activity log
    await this.createActivityLog(userId, "budget-item.file.deleted", {
      budgetItemId,
      eventId,
      fileId,
      filename: file.filename,
    }, eventId);
  }

  private async verifyEventExists(eventId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
  }

  private async checkOverBudgetAlerts(eventId: string, userId: string) {
    const variance = await this.getVariance(eventId);

    if (variance.isOverBudget) {
      // Get event details
      const event = await this.prisma.client.event.findUnique({
        where: { id: eventId },
        select: { name: true },
      });

      // Get all users assigned to the event (Admin, EventManager, Finance roles)
      const assignments = await this.prisma.client.eventAssignment.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      // Also include Finance role users and Admins
      const financeUsers = await this.prisma.client.user.findMany({
        where: {
          role: {
            in: ["Finance", "Admin"],
          },
        },
        select: {
          id: true,
        },
      });

      const userIds = new Set([
        ...assignments.map((a) => a.user.id),
        ...financeUsers.map((u) => u.id),
      ]);

      // Create notifications for relevant users using NotificationsService
      for (const targetUserId of userIds) {
        await this.notificationsService.createOverBudgetAlertNotification(
          targetUserId,
          eventId,
          event?.name || "Unknown Event",
          variance.variance,
          variance.variancePercentage,
        );
      }

      // Create activity log
      await this.createActivityLog(userId, "budget.over-budget.alert", {
        eventId,
        variance: variance.variance,
        variancePercentage: variance.variancePercentage,
      }, eventId);
    }
  }

  private async createActivityLog(
    userId: string,
    action: string,
    details: any,
    eventId?: string,
  ) {
    await this.prisma.client.activityLog.create({
      data: {
        userId,
        action,
        details,
        eventId,
      },
    });
  }
}


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

    const budgetItems = await this.prisma.client.budgetItem.findMany({
      where: { eventId },
      include: {
        vendorLink: true,
        assignedUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        strategicGoal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal fields to numbers for JSON serialization and include user info
    return budgetItems.map((item: any) => {
      const result: any = {
        ...item,
        estimatedCost: item.estimatedCost ? (typeof item.estimatedCost === 'object' && 'toNumber' in item.estimatedCost 
          ? item.estimatedCost.toNumber() 
          : Number(item.estimatedCost)) 
          : null,
        actualCost: item.actualCost ? (typeof item.actualCost === 'object' && 'toNumber' in item.actualCost 
          ? item.actualCost.toNumber() 
          : Number(item.actualCost)) 
          : null,
        assignedUserId: item.assignedUserId,
      };

      // Keep assignedUser as an object (not a string) for frontend compatibility
      if (item.assignedUser) {
        result.assignedUser = {
          id: item.assignedUser.id,
          fullName: item.assignedUser.fullName,
          email: item.assignedUser.email,
        };
      } else {
        result.assignedUser = null;
      }

      // Keep strategicGoal as an object (not just title) for frontend compatibility
      if (item.strategicGoal) {
        result.strategicGoal = {
          id: item.strategicGoal.id,
          title: item.strategicGoal.title,
        };
      } else {
        result.strategicGoal = null;
      }

      return result;
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
        vendorLink: true,
        assignedUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        strategicGoal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!budgetItem) {
      throw new NotFoundException(`Budget item with ID ${id} not found`);
    }

    // Convert Decimal fields to numbers for JSON serialization and include user info
    const budgetItemWithRelations = budgetItem as any;
    const result: any = {
      ...budgetItemWithRelations,
      estimatedCost: budgetItemWithRelations.estimatedCost ? (typeof budgetItemWithRelations.estimatedCost === 'object' && 'toNumber' in budgetItemWithRelations.estimatedCost 
        ? budgetItemWithRelations.estimatedCost.toNumber() 
        : Number(budgetItemWithRelations.estimatedCost)) 
        : null,
      actualCost: budgetItemWithRelations.actualCost ? (typeof budgetItemWithRelations.actualCost === 'object' && 'toNumber' in budgetItemWithRelations.actualCost 
        ? budgetItemWithRelations.actualCost.toNumber() 
        : Number(budgetItemWithRelations.actualCost)) 
        : null,
      assignedUserId: budgetItemWithRelations.assignedUserId,
    };

    // Keep assignedUser as an object (not a string) for frontend compatibility
    if (budgetItemWithRelations.assignedUser) {
      result.assignedUser = {
        id: budgetItemWithRelations.assignedUser.id,
        fullName: budgetItemWithRelations.assignedUser.fullName,
        email: budgetItemWithRelations.assignedUser.email,
      };
    } else {
      result.assignedUser = null;
    }

    // Keep strategicGoal as an object (not just title) for frontend compatibility
    if (budgetItemWithRelations.strategicGoal) {
      result.strategicGoal = {
        id: budgetItemWithRelations.strategicGoal.id,
        title: budgetItemWithRelations.strategicGoal.title,
      };
    } else {
      result.strategicGoal = null;
    }

    return result;
  }

  async create(eventId: string, createBudgetItemDto: CreateBudgetItemDto, userId: string) {
    // Verify event exists
    await this.verifyEventExists(eventId);

    const budgetItemData: any = {
      eventId: eventId,
      category: createBudgetItemDto.category,
      description: createBudgetItemDto.description || createBudgetItemDto.category,
      vendor: createBudgetItemDto.vendor || null,
      estimatedCost: createBudgetItemDto.estimatedCost
        ? Number(createBudgetItemDto.estimatedCost)
        : null,
      actualCost: createBudgetItemDto.actualCost ? Number(createBudgetItemDto.actualCost) : null,
      status: createBudgetItemDto.status || 'Pending',
    };
    
    // Add optional fields if they exist in the schema
    if (createBudgetItemDto.subcategory !== undefined) {
      budgetItemData.subcategory = createBudgetItemDto.subcategory || null;
    }
    if (createBudgetItemDto.notes !== undefined) {
      budgetItemData.notes = createBudgetItemDto.notes || null;
    }
    if (createBudgetItemDto.assignedUserId !== undefined) {
      budgetItemData.assignedUserId = createBudgetItemDto.assignedUserId || null;
    }
    if (createBudgetItemDto.strategicGoalId !== undefined) {
      budgetItemData.strategicGoalId = createBudgetItemDto.strategicGoalId || null;
    }
    if (userId) {
      budgetItemData.lastEditedBy = userId;
      budgetItemData.lastEditedAt = new Date();
    }
    
    const budgetItem = await this.prisma.client.budgetItem.create({
      data: budgetItemData as any,
      include: {
        vendorLink: true,
      },
    });

    // Check for over-budget alerts
    await this.checkOverBudgetAlerts(eventId, userId);

    // Get event details for activity log
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: { name: true },
    });

    // Create activity log
    await this.createActivityLog(userId, "budget-item.created", {
      budgetItemId: budgetItem.id,
      description: budgetItem.description,
      eventId,
      eventName: event?.name,
      category: budgetItem.category,
    }, eventId);

    // Convert Decimal fields to numbers for JSON serialization
    return {
      ...budgetItem,
      estimatedCost: budgetItem.estimatedCost ? (typeof budgetItem.estimatedCost === 'object' && 'toNumber' in budgetItem.estimatedCost 
        ? budgetItem.estimatedCost.toNumber() 
        : Number(budgetItem.estimatedCost)) 
        : null,
      actualCost: budgetItem.actualCost ? (typeof budgetItem.actualCost === 'object' && 'toNumber' in budgetItem.actualCost 
        ? budgetItem.actualCost.toNumber() 
        : Number(budgetItem.actualCost)) 
        : null,
    };
  }

  async update(id: string, updateBudgetItemDto: UpdateBudgetItemDto, userId: string) {
    const budgetItem = await this.findOne(id);
    const eventId = budgetItem.eventId;

    const updateData: any = {};
    const changedFields: string[] = [];

    // Compare and track only changed fields
    if (updateBudgetItemDto.category !== undefined && updateBudgetItemDto.category !== budgetItem.category) {
      updateData.category = updateBudgetItemDto.category;
      changedFields.push('category');
    }
    if (updateBudgetItemDto.subcategory !== undefined && updateBudgetItemDto.subcategory !== (budgetItem as any).subcategory) {
      updateData.subcategory = updateBudgetItemDto.subcategory || null;
      changedFields.push('subcategory');
    }
    if (updateBudgetItemDto.description !== undefined && updateBudgetItemDto.description !== budgetItem.description) {
      updateData.description = updateBudgetItemDto.description;
      changedFields.push('description');
    }
    if (updateBudgetItemDto.estimatedCost !== undefined) {
      const newValue = updateBudgetItemDto.estimatedCost ? Number(updateBudgetItemDto.estimatedCost) : null;
      const existingValue = budgetItem.estimatedCost ? Number(budgetItem.estimatedCost) : null;
      if (newValue !== existingValue) {
        updateData.estimatedCost = newValue;
        changedFields.push('estimatedCost');
      }
    }
    if (updateBudgetItemDto.actualCost !== undefined) {
      const newValue = updateBudgetItemDto.actualCost ? Number(updateBudgetItemDto.actualCost) : null;
      const existingValue = budgetItem.actualCost ? Number(budgetItem.actualCost) : null;
      if (newValue !== existingValue) {
        updateData.actualCost = newValue;
        changedFields.push('actualCost');
      }
    }
    if (updateBudgetItemDto.vendor !== undefined && updateBudgetItemDto.vendor !== budgetItem.vendor) {
      updateData.vendor = updateBudgetItemDto.vendor || null;
      changedFields.push('vendor');
    }
    if (updateBudgetItemDto.status !== undefined && updateBudgetItemDto.status !== (budgetItem as any).status) {
      updateData.status = updateBudgetItemDto.status;
      changedFields.push('status');
    }
    if (updateBudgetItemDto.notes !== undefined && updateBudgetItemDto.notes !== (budgetItem as any).notes) {
      updateData.notes = updateBudgetItemDto.notes || null;
      changedFields.push('notes');
    }
    if (updateBudgetItemDto.assignedUserId !== undefined && updateBudgetItemDto.assignedUserId !== (budgetItem as any).assignedUserId) {
      updateData.assignedUserId = updateBudgetItemDto.assignedUserId || null;
      changedFields.push('assignedUserId');
    }
    if (updateBudgetItemDto.strategicGoalId !== undefined && updateBudgetItemDto.strategicGoalId !== (budgetItem as any).strategicGoalId) {
      updateData.strategicGoalId = updateBudgetItemDto.strategicGoalId || null;
      changedFields.push('strategicGoalId');
    }

    // Always update audit fields when there are changes
    if (changedFields.length > 0) {
      updateData.lastEditedBy = userId;
      updateData.lastEditedAt = new Date();
    }

    // If no changes, return existing budget item
    if (changedFields.length === 0) {
      return budgetItem;
    }

    const updatedBudgetItem = await this.prisma.client.budgetItem.update({
      where: { id },
      data: updateData as any,
      include: {
        vendorLink: true,
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const serializedItem = {
      ...updatedBudgetItem,
      estimatedCost: updatedBudgetItem.estimatedCost ? (typeof updatedBudgetItem.estimatedCost === 'object' && 'toNumber' in updatedBudgetItem.estimatedCost 
        ? updatedBudgetItem.estimatedCost.toNumber() 
        : Number(updatedBudgetItem.estimatedCost)) 
        : null,
      actualCost: updatedBudgetItem.actualCost ? (typeof updatedBudgetItem.actualCost === 'object' && 'toNumber' in updatedBudgetItem.actualCost 
        ? updatedBudgetItem.actualCost.toNumber() 
        : Number(updatedBudgetItem.actualCost)) 
        : null,
    };

    // Check for over-budget alerts
    await this.checkOverBudgetAlerts(eventId, userId);

    // Get event details for activity log
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: { name: true },
    });

    // Create activity log with only changed fields
    await this.createActivityLog(userId, "budget-item.updated", {
      budgetItemId: id,
      description: updatedBudgetItem.description,
      eventId,
      eventName: event?.name,
      changes: changedFields,
    }, eventId);

    return serializedItem;
  }

  async remove(id: string, userId: string): Promise<void> {
    const budgetItem = await this.findOne(id);
    const eventId = budgetItem.eventId;

    await this.prisma.client.budgetItem.delete({
      where: { id },
    });

    // Check for over-budget alerts
    await this.checkOverBudgetAlerts(eventId, userId);

    // Get event details for activity log
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: { name: true },
    });

    // Create activity log
    await this.createActivityLog(userId, "budget-item.deleted", {
      budgetItemId: id,
      description: budgetItem.description,
      eventId,
      eventName: event?.name,
      category: budgetItem.category,
    }, eventId);
  }

  async getBudgetTotals(eventId: string) {
    // Verify event exists
    await this.verifyEventExists(eventId);

    // Get budget items directly from event
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
    
    const fileRecord = await this.prisma.client.file.create({
      data: {
        budgetItemId: budgetItemId,
        eventId: budgetItem.eventId,
        filename: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
    
    return fileRecord;
  }

  async deleteFile(budgetItemId: string, fileId: string, userId: string) {
    const budgetItem = await this.findOne(budgetItemId);
    
    const file = await this.prisma.client.file.findFirst({
      where: {
        id: fileId,
        budgetItemId: budgetItemId,
      },
    });
    
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found for this budget item`);
    }
    
    // Delete physical file if it exists
    try {
      if (require("fs").existsSync(file.path)) {
        require("fs").unlinkSync(file.path);
      }
    } catch (error) {
      console.error(`Failed to delete physical file: ${file.path}`, error);
    }
    
    await this.prisma.client.file.delete({
      where: { id: fileId },
    });
    
    return { message: "File deleted successfully" };
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
      // Get event creator and assigned users
      const event = await this.prisma.client.event.findUnique({
        where: { id: eventId },
        select: {
          name: true,
          createdBy: true,
          assignments: {
            select: {
              userId: true,
            },
          },
        },
      });

      // Get Finance/Admin users
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
        ...(event?.createdBy ? [event.createdBy] : []),
        ...(event?.assignments?.map((a) => a.userId) || []),
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

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetItemDto, BudgetItemCategory } from "./dto/create-budget-item.dto";
import { UpdateBudgetItemDto } from "./dto/update-budget-item.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { UserRole } from "../auth/types/user-role.enum";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class BudgetItemsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAllByEvent(eventId: string, userId?: string, userRole?: any) {
    // Verify event exists and user has access
    await this.verifyEventExistsAndAccess(eventId, userId, userRole);

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

  async findOne(id: string, userId?: string, userRole?: any) {
    const budgetItem = await this.prisma.client.budgetItem.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            status: true,
            createdBy: true,
            assignments: {
              where: userId ? { userId: userId } : undefined,
              select: { userId: true },
            },
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

    // Check access to the event
    if (userId && userRole) {
      const event = budgetItem.event as any;
      if (userRole === UserRole.Admin || userRole === 'Admin') {
        // Admin has full access
      } else {
        const isCreator = event.createdBy === userId;
        const isAssigned = event.assignments && event.assignments.length > 0;
        
        if (!isCreator && !isAssigned) {
          throw new NotFoundException(`Budget item with ID ${id} not found`); // Return 404 to hide existence
        }
      }
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

    // Validate budget totals before creating
    if (createBudgetItemDto.estimatedCost) {
      await this.validateBudgetTotals(eventId, createBudgetItemDto.estimatedCost);
    }

    const budgetItemData: any = {
      eventId: eventId,
      category: createBudgetItemDto.category,
      description: createBudgetItemDto.description || createBudgetItemDto.category,
      vendor: createBudgetItemDto.vendor || null,
      vendorId: createBudgetItemDto.vendorId || null,
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
    const eventDetails = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: { name: true },
    });

    // Create activity log
    await this.createActivityLog(userId, "budget-item.created", {
      budgetItemId: budgetItem.id,
      description: budgetItem.description,
      eventId,
      eventName: eventDetails?.name,
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

  async update(id: string, updateBudgetItemDto: UpdateBudgetItemDto, userId: string, userRole?: any) {
    // Verify access before allowing update
    const budgetItem = await this.findOne(id, userId, userRole);
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
        // Validate budget totals before updating
        const difference = (newValue || 0) - (existingValue || 0);
        if (difference > 0) {
          await this.validateBudgetTotals(eventId, difference, id);
        }
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
    if (updateBudgetItemDto.vendorId !== undefined && updateBudgetItemDto.vendorId !== (budgetItem as any).vendorId) {
      updateData.vendorId = updateBudgetItemDto.vendorId || null;
      changedFields.push('vendorId');
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

  async remove(id: string, userId: string, userRole?: any): Promise<void> {
    // Verify access before allowing deletion
    const budgetItem = await this.findOne(id, userId, userRole);
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
      select: {
        id: true,
        name: true,
        budget: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event;
  }

  private async verifyEventExistsAndAccess(eventId: string, userId?: string, userRole?: any) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        budget: true,
        createdBy: true,
        assignments: userId ? {
          where: { userId: userId },
          select: { userId: true },
        } : undefined,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (userId && userRole) {
      if (userRole === UserRole.Admin || userRole === 'Admin') {
        return; // Admin has full access
      }

      const isCreator = event.createdBy === userId;
      const isAssigned = event.assignments && (event.assignments as any[]).length > 0;

      if (!isCreator && !isAssigned) {
        throw new NotFoundException(`Event with ID ${eventId} not found`); // Return 404 to hide existence
      }
    }
  }

  async validateBudgetTotals(eventId: string, additionalAmount: number = 0, excludeBudgetItemId?: string) {
    const event = await this.verifyEventExists(eventId);

    // If event has no budget set, skip validation
    if (!event.budget) {
      return;
    }

    // Get all budget items for the event (excluding the one being updated if provided)
    const where: any = { eventId };
    if (excludeBudgetItemId) {
      where.id = { not: excludeBudgetItemId };
    }

    const budgetItems = await this.prisma.client.budgetItem.findMany({
      where,
      select: {
        estimatedCost: true,
      },
    });

    // Calculate current total
    let currentTotal = 0;
    budgetItems.forEach((item) => {
      if (item.estimatedCost) {
        const cost = typeof item.estimatedCost === 'object' && 'toNumber' in item.estimatedCost
          ? item.estimatedCost.toNumber()
          : Number(item.estimatedCost);
        currentTotal += cost;
      }
    });

    // Add the additional amount (for new items or updates)
    const newTotal = currentTotal + additionalAmount;
    const eventBudget = typeof event.budget === 'object' && 'toNumber' in event.budget
      ? event.budget.toNumber()
      : Number(event.budget);

    // Check if total exceeds event budget
    if (newTotal > eventBudget) {
      throw new BadRequestException(
        `Total budget items ($${newTotal.toFixed(2)}) exceeds event budget ($${eventBudget.toFixed(2)}) by $${(newTotal - eventBudget).toFixed(2)}`
      );
    }
  }

  async getCategoryTotals(eventId: string) {
    await this.verifyEventExists(eventId);

    const budgetItems = await this.prisma.client.budgetItem.findMany({
      where: { eventId },
      select: {
        category: true,
        estimatedCost: true,
        actualCost: true,
      },
    });

    const totalsByCategory: Record<string, { estimated: number; actual: number; remaining: number }> = {};

    budgetItems.forEach((item) => {
      const category = item.category;
      if (!totalsByCategory[category]) {
        totalsByCategory[category] = { estimated: 0, actual: 0, remaining: 0 };
      }

      const estimated = item.estimatedCost
        ? (typeof item.estimatedCost === 'object' && 'toNumber' in item.estimatedCost
          ? item.estimatedCost.toNumber()
          : Number(item.estimatedCost))
        : 0;
      const actual = item.actualCost
        ? (typeof item.actualCost === 'object' && 'toNumber' in item.actualCost
          ? item.actualCost.toNumber()
          : Number(item.actualCost))
        : 0;

      totalsByCategory[category].estimated += estimated;
      totalsByCategory[category].actual += actual;
      totalsByCategory[category].remaining = totalsByCategory[category].estimated - totalsByCategory[category].actual;
    });

    // Calculate utilization percentage
    Object.keys(totalsByCategory).forEach((category) => {
      const total = totalsByCategory[category];
      total.remaining = total.estimated - total.actual;
    });

    return totalsByCategory;
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

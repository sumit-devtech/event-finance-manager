import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ActivityLogsService } from "../activity-logs/activity-logs.service";
import { CreateBudgetVersionDto } from "./dto/create-budget-version.dto";
import { UpdateBudgetVersionDto } from "./dto/update-budget-version.dto";
import { CreateBudgetLineItemDto } from "./dto/create-budget-line-item.dto";
import { UpdateBudgetLineItemDto } from "./dto/update-budget-line-item.dto";

@Injectable()
export class BudgetsService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async findAll(eventId: string, organizationId: string) {
    // Verify event exists and belongs to organization
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    return this.prisma.client.budgetVersion.findMany({
      where: { eventId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        items: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { versionNumber: "desc" },
    });
  }

  async findOne(budgetId: string, organizationId: string) {
    const budget = await this.prisma.client.budgetVersion.findUnique({
      where: { id: budgetId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        items: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException("Budget version not found");
    }

    if (budget.event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this budget");
    }

    return budget;
  }

  async create(dto: CreateBudgetVersionDto, userId: string, organizationId: string) {
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

    // Check if version number already exists
    const existing = await this.prisma.client.budgetVersion.findFirst({
      where: {
        eventId: dto.eventId,
        versionNumber: dto.versionNumber,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Budget version ${dto.versionNumber} already exists for this event`,
      );
    }

    // Calculate estimatedCost if not provided
    const itemsWithCosts = dto.items.map((item) => {
      let estimatedCost = item.estimatedCost;
      if (!estimatedCost && item.quantity && item.unitCost) {
        estimatedCost = item.quantity * item.unitCost;
      }
      return {
        ...item,
        estimatedCost: estimatedCost || 0,
      };
    });

    const budget = await this.prisma.client.$transaction(async (tx) => {
      const budgetVersion = await tx.budgetVersion.create({
        data: {
          eventId: dto.eventId,
          versionNumber: dto.versionNumber,
          notes: dto.notes,
          createdBy: userId,
          isFinal: false,
        },
      });

      // Create line items
      await Promise.all(
        itemsWithCosts.map((item) =>
          tx.budgetLineItem.create({
            data: {
              budgetVersionId: budgetVersion.id,
              category: item.category,
              itemName: item.itemName,
              vendorId: item.vendorId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              estimatedCost: item.estimatedCost,
              notes: item.notes,
            },
          }),
        ),
      );

      return budgetVersion;
    });

    // Log activity
    await this.activityLogsService.logActivity(dto.eventId, userId, "budget.created", {
      budgetVersionId: budget.id,
      versionNumber: dto.versionNumber,
      itemsCount: dto.items.length,
    });

    return this.findOne(budget.id, organizationId);
  }

  async update(budgetId: string, dto: UpdateBudgetVersionDto, userId: string, organizationId: string) {
    const budget = await this.findOne(budgetId, organizationId);

    const updated = await this.prisma.client.$transaction(async (tx) => {
      // If marking as final, unmark all other versions
      if (dto.isFinal === true) {
        await tx.budgetVersion.updateMany({
          where: {
            eventId: budget.eventId,
            id: { not: budgetId },
          },
          data: { isFinal: false },
        });
      }

      const updatedBudget = await tx.budgetVersion.update({
        where: { id: budgetId },
        data: dto,
      });

      return updatedBudget;
    });

    // Log activity
    await this.activityLogsService.logActivity(budget.eventId, userId, "budget.updated", {
      budgetVersionId: budgetId,
      changes: dto,
    });

    return this.findOne(budgetId, organizationId);
  }

  async finalize(budgetId: string, userId: string, organizationId: string) {
    return this.update(budgetId, { isFinal: true }, userId, organizationId);
  }

  async clone(budgetId: string, userId: string, organizationId: string) {
    const budget = await this.findOne(budgetId, organizationId);

    // Find the highest version number
    const versions = await this.prisma.client.budgetVersion.findMany({
      where: { eventId: budget.eventId },
      orderBy: { versionNumber: "desc" },
      take: 1,
    });

    const nextVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

    const cloned = await this.prisma.client.$transaction(async (tx) => {
      const newBudget = await tx.budgetVersion.create({
        data: {
          eventId: budget.eventId,
          versionNumber: nextVersionNumber,
          notes: `Cloned from version ${budget.versionNumber}`,
          createdBy: userId,
          isFinal: false,
        },
      });

      // Clone all line items
      await Promise.all(
        budget.items.map((item) =>
          tx.budgetLineItem.create({
            data: {
              budgetVersionId: newBudget.id,
              category: item.category,
              itemName: item.itemName,
              vendorId: item.vendorId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              estimatedCost: item.estimatedCost,
              actualCost: item.actualCost,
              notes: item.notes,
            },
          }),
        ),
      );

      return newBudget;
    });

    // Log activity
    await this.activityLogsService.logActivity(budget.eventId, userId, "budget.cloned", {
      sourceBudgetVersionId: budgetId,
      newBudgetVersionId: cloned.id,
      newVersionNumber: nextVersionNumber,
    });

    return this.findOne(cloned.id, organizationId);
  }

  async addLineItem(
    budgetId: string,
    dto: CreateBudgetLineItemDto,
    userId: string,
    organizationId: string,
  ) {
    const budget = await this.findOne(budgetId, organizationId);

    // Calculate estimatedCost if not provided
    let estimatedCost = dto.estimatedCost;
    if (!estimatedCost && dto.quantity && dto.unitCost) {
      estimatedCost = dto.quantity * dto.unitCost;
    }

    const item = await this.prisma.client.budgetLineItem.create({
      data: {
        budgetVersionId: budgetId,
        category: dto.category,
        itemName: dto.itemName,
        vendorId: dto.vendorId,
        quantity: dto.quantity,
        unitCost: dto.unitCost,
        estimatedCost: estimatedCost || 0,
        notes: dto.notes,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(budget.eventId, userId, "budget.line_item.added", {
      budgetVersionId: budgetId,
      itemId: item.id,
      itemName: dto.itemName,
    });

    return item;
  }

  async updateLineItem(
    itemId: string,
    dto: UpdateBudgetLineItemDto,
    userId: string,
    organizationId: string,
  ) {
    const item = await this.prisma.client.budgetLineItem.findUnique({
      where: { id: itemId },
      include: {
        budgetVersion: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException("Budget line item not found");
    }

    if (item.budgetVersion.event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this item");
    }

    // Recalculate estimatedCost if quantity or unitCost changed
    let estimatedCost = dto.estimatedCost;
    if (!estimatedCost && (dto.quantity !== undefined || dto.unitCost !== undefined)) {
      const quantity = dto.quantity !== undefined ? dto.quantity : item.quantity;
      const unitCost = dto.unitCost !== undefined ? dto.unitCost : item.unitCost;
      if (quantity && unitCost) {
        estimatedCost = quantity * unitCost;
      }
    }

    const updated = await this.prisma.client.budgetLineItem.update({
      where: { id: itemId },
      data: {
        ...dto,
        estimatedCost: estimatedCost !== undefined ? estimatedCost : undefined,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(
      item.budgetVersion.eventId,
      userId,
      "budget.line_item.updated",
      {
        itemId,
        changes: dto,
      },
    );

    return updated;
  }

  async deleteLineItem(itemId: string, userId: string, organizationId: string) {
    const item = await this.prisma.client.budgetLineItem.findUnique({
      where: { id: itemId },
      include: {
        budgetVersion: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException("Budget line item not found");
    }

    if (item.budgetVersion.event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this item");
    }

    await this.prisma.client.budgetLineItem.delete({
      where: { id: itemId },
    });

    // Log activity
    await this.activityLogsService.logActivity(
      item.budgetVersion.eventId,
      userId,
      "budget.line_item.deleted",
      {
        itemId,
        itemName: item.itemName,
      },
    );

    return { message: "Budget line item deleted successfully" };
  }
}


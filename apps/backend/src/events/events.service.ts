import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, EventStatus } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AssignUserDto } from "./dto/assign-user.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { NotificationsService } from "../notifications/notifications.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    const { startDate, endDate, ...data } = createEventDto;

    const event = await this.prisma.client.event.create({
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    // Create activity log
    await this.createActivityLog(userId, "event.created", {
      eventId: event.id,
      eventName: event.name,
    });

    return event;
  }

  async findAll(filters?: {
    status?: EventStatus;
    client?: string;
    department?: string;
    startDateFrom?: string;
    startDateTo?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    // Handle client and department filters (both filter the client field)
    // If both are provided, we'll prioritize department, otherwise use whichever is provided
    if (filters?.department) {
      where.client = {
        contains: filters.department,
        mode: "insensitive",
      };
    } else if (filters?.client) {
      where.client = {
        contains: filters.client,
        mode: "insensitive",
      };
    }

    if (filters?.startDateFrom || filters?.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) {
        where.startDate.gte = new Date(filters.startDateFrom);
      }
      if (filters.startDateTo) {
        where.startDate.lte = new Date(filters.startDateTo);
      }
    }

    return this.prisma.client.event.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            budgetItems: true,
            activityLogs: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        budgetItems: true,
        files: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
          },
        },
        _count: {
          select: {
            files: true,
            budgetItems: true,
            activityLogs: true,
            aiSuggestions: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    const { startDate, endDate, ...data } = updateEventDto;

    // Check if event exists
    const existingEvent = await this.findOne(id);

    const updateData: any = {};
    const changedFields: string[] = [];

    // Helper function to normalize values for comparison (empty string -> null)
    const normalize = (value: any): any => {
      if (value === "" || value === undefined) return null;
      return value;
    };

    // Compare and track only changed fields
    if (data.name !== undefined) {
      const normalizedName = normalize(data.name);
      const existingName = normalize(existingEvent.name);
      if (normalizedName !== existingName) {
        updateData.name = data.name;
        changedFields.push('name');
      }
    }
    if (data.description !== undefined) {
      const normalizedDesc = normalize(data.description);
      const existingDesc = normalize(existingEvent.description);
      if (normalizedDesc !== existingDesc) {
        updateData.description = data.description;
        changedFields.push('description');
      }
    }
    if (data.client !== undefined) {
      const normalizedClient = normalize(data.client);
      const existingClient = normalize(existingEvent.client);
      if (normalizedClient !== existingClient) {
        updateData.client = data.client;
        changedFields.push('client');
      }
    }
    if (data.status !== undefined && data.status !== existingEvent.status) {
      updateData.status = data.status;
      changedFields.push('status');
    }
    if (startDate !== undefined) {
      const newStartDate = startDate ? new Date(startDate) : null;
      const existingStartDate = existingEvent.startDate ? new Date(existingEvent.startDate) : null;
      if (newStartDate?.getTime() !== existingStartDate?.getTime()) {
        updateData.startDate = newStartDate;
        changedFields.push('startDate');
      }
    }
    if (endDate !== undefined) {
      const newEndDate = endDate ? new Date(endDate) : null;
      const existingEndDate = existingEvent.endDate ? new Date(existingEvent.endDate) : null;
      if (newEndDate?.getTime() !== existingEndDate?.getTime()) {
        updateData.endDate = newEndDate;
        changedFields.push('endDate');
      }
    }

    // If no changes, return existing event
    if (changedFields.length === 0) {
      return existingEvent;
    }

    const updatedEvent = await this.prisma.client.event.update({
      where: { id },
      data: updateData,
    });

    // Create activity log with only changed fields (use keys from updateData as source of truth)
    await this.createActivityLog(userId, "event.updated", {
      eventId: id,
      eventName: updatedEvent.name,
      changes: Object.keys(updateData),
    }, id);

    return updatedEvent;
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id);
    const eventName = event.name;

    await this.prisma.client.event.delete({
      where: { id },
    });

    // Create activity log
    await this.createActivityLog(userId, "event.deleted", {
      eventId: id,
      eventName,
    });
  }

  async findByStatus(status: EventStatus) {
    return this.prisma.client.event.findMany({
      where: { status },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, userId: string) {
    const event = await this.findOne(id);
    const oldStatus = event.status;

    if (oldStatus === updateStatusDto.status) {
      return this.findOne(id);
    }

    await this.prisma.client.event.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });

    // Create notification if event is completed
    if (updateStatusDto.status === EventStatus.Completed) {
      const assignments = await this.prisma.client.eventAssignment.findMany({
        where: { eventId: id },
        select: { userId: true },
      });

      for (const assignment of assignments) {
        await this.notificationsService.createEventCompletionNotification(
          assignment.userId,
          id,
          event.name,
        );
      }
    }

    // Create activity log (event is already fetched above)
    await this.createActivityLog(userId, "event.status.updated", {
      eventId: id,
      eventName: event.name,
      oldStatus,
      newStatus: updateStatusDto.status,
    }, id);

    return this.findOne(id);
  }

  async assignUser(eventId: string, assignUserDto: AssignUserDto, userId: string) {
    // Verify event exists
    await this.findOne(eventId);

    // Verify user exists
    const user = await this.prisma.client.user.findUnique({
      where: { id: assignUserDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${assignUserDto.userId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.client.eventAssignment.findUnique({
      where: {
        userId_eventId: {
          userId: assignUserDto.userId,
          eventId: eventId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException("User is already assigned to this event");
    }

    const event = await this.findOne(eventId);
    
    const assignment = await this.prisma.client.eventAssignment.create({
      data: {
        userId: assignUserDto.userId,
        eventId: eventId,
        role: assignUserDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create notification for assigned user
    await this.notificationsService.createEventAssignedNotification(
      assignUserDto.userId,
      eventId,
      event.name,
    );

    // Get user details for activity log
    const assignedUser = await this.prisma.client.user.findUnique({
      where: { id: assignUserDto.userId },
      select: { name: true, email: true },
    });

    // Create activity log
    await this.createActivityLog(userId, "event.user.assigned", {
      eventId,
      eventName: event.name,
      userId: assignUserDto.userId,
      userName: assignedUser?.name || assignedUser?.email || assignUserDto.userId,
      role: assignUserDto.role,
    }, eventId);

    return assignment;
  }

  async unassignUser(eventId: string, userId: string, adminUserId: string) {
    // Verify event exists
    await this.findOne(eventId);

    // Verify assignment exists
    const assignment = await this.prisma.client.eventAssignment.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException("User is not assigned to this event");
    }

    await this.prisma.client.eventAssignment.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    // Get user and event details for activity log
    const unassignedUser = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const event = await this.findOne(eventId);

    // Create activity log
    await this.createActivityLog(adminUserId, "event.user.unassigned", {
      eventId,
      eventName: event.name,
      userId,
      userName: unassignedUser?.name || unassignedUser?.email || userId,
    }, eventId);
  }

  async uploadFile(
    eventId: string,
    file: { originalname: string; path: string; mimetype: string; size: number },
    userId: string,
  ) {
    // Verify event exists and get name
    const event = await this.findOne(eventId);

    const fileRecord = await this.prisma.client.file.create({
      data: {
        eventId,
        filename: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    // Create activity log
    await this.createActivityLog(userId, "event.file.uploaded", {
      eventId,
      eventName: event.name,
      fileId: fileRecord.id,
      filename: file.originalname,
    }, eventId);

    return fileRecord;
  }

  async deleteFile(eventId: string, fileId: string, userId: string) {
    // Verify event exists
    await this.findOne(eventId);

    const file = await this.prisma.client.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.eventId !== eventId) {
      throw new NotFoundException("File not found");
    }

    // Delete physical file
    const filePath = path.resolve(file.path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        // Log error but continue with database deletion
        console.error(`Failed to delete physical file: ${filePath}`, error);
      }
    }

    await this.prisma.client.file.delete({
      where: { id: fileId },
    });

    // Get event details for activity log
    const event = await this.findOne(eventId);

    // Create activity log
    await this.createActivityLog(userId, "event.file.deleted", {
      eventId,
      eventName: event.name,
      fileId,
      filename: file.filename,
    }, eventId);
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

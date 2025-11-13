import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, EventStatus } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AssignUserDto } from "./dto/assign-user.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

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
    startDateFrom?: string;
    startDateTo?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.client) {
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

    const updateData: any = { ...data };
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }

    const updatedEvent = await this.prisma.client.event.update({
      where: { id },
      data: updateData,
    });

    // Create activity log
    await this.createActivityLog(userId, "event.updated", {
      eventId: id,
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

    // Create activity log
    await this.createActivityLog(userId, "event.status.updated", {
      eventId: id,
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

    // Create activity log
    await this.createActivityLog(userId, "event.user.assigned", {
      eventId,
      userId: assignUserDto.userId,
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

    // Create activity log
    await this.createActivityLog(adminUserId, "event.user.unassigned", {
      eventId,
      userId,
    }, eventId);
  }

  async uploadFile(
    eventId: string,
    file: { originalname: string; path: string; mimetype: string; size: number },
    userId: string,
  ) {
    // Verify event exists
    await this.findOne(eventId);

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

    // Create activity log
    await this.createActivityLog(userId, "event.file.deleted", {
      eventId,
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

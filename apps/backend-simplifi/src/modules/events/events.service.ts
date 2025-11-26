import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ActivityLogsService } from "../activity-logs/activity-logs.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { UpdateEventStatusDto } from "./dto/update-status.dto";
import { CreateStakeholderDto } from "./dto/create-stakeholder.dto";

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async findAll(organizationId: string, filters?: { status?: string; createdBy?: string }) {
    const where: any = {
      organizationId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.createdBy) {
      where.createdBy = filters.createdBy;
    }

    return this.prisma.client.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            budgetVersions: true,
            expenses: true,
            stakeholders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        stakeholders: true,
        budgetVersions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        roiMetrics: true,
        crmSync: true,
        _count: {
          select: {
            expenses: true,
            vendorContracts: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    return event;
  }

  async create(dto: CreateEventDto, userId: string, organizationId: string) {
    const event = await this.prisma.client.event.create({
      data: {
        name: dto.name,
        location: dto.location,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        eventType: dto.eventType,
        description: dto.description,
        organizationId: dto.organizationId || organizationId,
        createdBy: userId,
        status: "draft",
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(event.id, userId, "event.created", {
      eventName: event.name,
    });

    return event;
  }

  async update(id: string, dto: UpdateEventDto, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const updated = await this.prisma.client.event.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(id, null, "event.updated", {
      changes: dto,
    });

    return updated;
  }

  async updateStatus(id: string, dto: UpdateEventStatusDto, userId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const updated = await this.prisma.client.event.update({
      where: { id },
      data: { status: dto.status },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(id, userId, "event.status_changed", {
      oldStatus: event.status,
      newStatus: dto.status,
    });

    // TODO: Notify stakeholders about status change

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    await this.prisma.client.event.delete({
      where: { id },
    });

    return { message: "Event deleted successfully" };
  }

  async getStakeholders(eventId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    return this.prisma.client.eventStakeholder.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addStakeholder(
    eventId: string,
    dto: CreateStakeholderDto,
    userId: string,
    organizationId: string,
  ) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const stakeholder = await this.prisma.client.eventStakeholder.create({
      data: {
        eventId,
        name: dto.name,
        role: dto.role,
        email: dto.email,
        phone: dto.phone,
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(eventId, userId, "stakeholder.added", {
      stakeholderName: dto.name,
    });

    // TODO: Notify stakeholder if email provided

    return stakeholder;
  }

  async removeStakeholder(
    eventId: string,
    stakeholderId: string,
    userId: string,
    organizationId: string,
  ) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const stakeholder = await this.prisma.client.eventStakeholder.findUnique({
      where: { id: stakeholderId },
    });

    if (!stakeholder || stakeholder.eventId !== eventId) {
      throw new NotFoundException("Stakeholder not found");
    }

    await this.prisma.client.eventStakeholder.delete({
      where: { id: stakeholderId },
    });

    // Log activity
    await this.activityLogsService.logActivity(eventId, userId, "stakeholder.removed", {
      stakeholderName: stakeholder.name,
    });

    return { message: "Stakeholder removed successfully" };
  }
}


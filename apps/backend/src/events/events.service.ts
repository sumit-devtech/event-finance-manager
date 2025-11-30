import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, EventStatus } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AssignUserDto } from "./dto/assign-user.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { UserRole } from "../auth/types/user-role.enum";
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
    const { startDate, endDate, client, budget, attendees, ...data } = createEventDto;

    const eventData: any = {
      ...data,
      location: createEventDto.location || client || null, // Map client to location for backward compatibility
      eventType: createEventDto.eventType || createEventDto.type || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: budget !== undefined ? budget : null,
      attendees: attendees !== undefined ? attendees : null,
      createdBy: userId,
    };
    
    // Add type alias if eventType is set (for backward compatibility)
    if (eventData.eventType) {
      eventData.type = eventData.eventType;
    }
    
    const event = await this.prisma.client.event.create({
      data: eventData,
    });

    // If managerId is provided, assign manager
    if (createEventDto.managerId) {
      const manager = await this.prisma.client.user.findUnique({
        where: { id: createEventDto.managerId },
        select: { id: true, role: true },
      });

      if (!manager) {
        throw new NotFoundException(`Manager with ID ${createEventDto.managerId} not found`);
      }

      if (manager.role !== UserRole.EventManager) {
        throw new BadRequestException("Only users with EventManager role can be assigned as manager");
      }

      await this.prisma.client.eventAssignment.create({
        data: {
          userId: createEventDto.managerId,
          eventId: event.id,
          role: "Manager",
        },
      });
    }

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
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    // Note: simlifidb schema doesn't have 'client' field
    // Using location or description for filtering instead
    if (filters?.department) {
      where.location = {
        contains: filters.department,
        mode: "insensitive",
      };
    } else if (filters?.client) {
      where.location = {
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

    // Optimize: Use select instead of include, limit relations
    const events = await this.prisma.client.event.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: filters?.limit || 50, // Default limit to prevent fetching too many
      skip: filters?.offset || 0,
      select: {
        id: true,
        name: true,
        location: true,
        startDate: true,
        endDate: true,
        eventType: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        createdBy: true,
        venue: true,
        attendees: true,
        budget: true,
        client: true,
        organizer: true,
        // Only include minimal assignment data
        assignments: {
          select: {
            id: true,
            userId: true,
            role: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
          take: 5, // Limit to first 5 assignments
        },
        // Only count stakeholders, don't fetch all
        _count: {
          select: {
            budgetItems: true,
            expenses: true,
            activityLogs: true,
            files: true,
            stakeholders: true,
          },
        },
      },
    });

    // Transform the response to match frontend expectations
    return events.map((event) => {
      // Convert Decimal budget to number
      const budget = event.budget 
        ? (typeof event.budget === 'object' && 'toNumber' in event.budget 
          ? event.budget.toNumber() 
          : Number(event.budget))
        : null;

      // Build the response object explicitly to ensure all fields are included
      const response: any = {
        id: event.id,
        name: event.name,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        eventType: event.eventType,
        description: event.description,
        status: event.status,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        organizationId: event.organizationId,
        createdBy: event.createdBy,
        venue: event.venue ?? null,
        attendees: event.attendees ?? null,
        budget: budget,
        client: event.client ?? null, // Use actual client field, preserve null
        organizer: event.organizer ?? null,
        assignments: event.assignments.map((assignment) => {
          if (!assignment.user) {
            return {
              ...assignment,
              user: null,
            };
          }
          const { fullName, ...userRest } = assignment.user;
          return {
            ...assignment,
            user: {
              ...userRest,
              name: fullName || null, // Map fullName to name, remove fullName
            },
          };
        }),
        _count: event._count,
      };
      
      return response;
    });
  }

  async findOne(id: string, includeDetails: boolean = false) {
    // Optimize: Only fetch full details when needed
    const event = await this.prisma.client.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        startDate: true,
        endDate: true,
        eventType: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        createdBy: true,
        assignments: {
          select: {
            id: true,
            userId: true,
            role: true,
            assignedAt: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        stakeholders: includeDetails ? {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        } : {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
          take: 10, // Limit stakeholders if not full details
        },
        budgetItems: includeDetails ? {
          select: {
            id: true,
            category: true,
            description: true,
            estimatedCost: true,
            actualCost: true,
            vendor: true,
            createdAt: true,
            updatedAt: true,
          },
        } : false,
        expenses: includeDetails ? {
          select: {
            id: true,
            amount: true,
            title: true,
            description: true,
            status: true,
            createdAt: true,
          },
          take: 20, // Limit expenses if not full details
        } : false,
        files: includeDetails ? {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
          },
          take: 10, // Limit files
        } : false,
        _count: {
          select: {
            budgetItems: true,
            expenses: true,
            activityLogs: true,
            files: true,
            stakeholders: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Transform the response to match frontend expectations
    // Handle conditional fields based on includeDetails
    const transformedEvent = {
      ...event,
      client: event.location || null, // Map location to client for backward compatibility
      assignments: (event.assignments || []).map((assignment) => {
        if (!assignment.user) {
          return {
            ...assignment,
            user: null,
          };
        }
        return {
          ...assignment,
          user: {
            id: assignment.user.id,
            email: assignment.user.email,
            role: assignment.user.role,
            name: assignment.user.fullName, // Map fullName to name
          },
        };
      }),
    };

    return transformedEvent;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    const { startDate, endDate, client, location, budget, attendees, eventType, type, ...data } = updateEventDto;

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
    // Note: simlifidb schema uses 'location' instead of 'client'
    // Support both for backward compatibility
    const locationValue = location !== undefined ? location : client;
    if (locationValue !== undefined) {
      const normalizedLocation = normalize(locationValue);
      const existingLocation = normalize((existingEvent as any).location);
      if (normalizedLocation !== existingLocation) {
        updateData.location = locationValue;
        changedFields.push('location');
      }
    }
    if (data.venue !== undefined) {
      const normalizedVenue = normalize(data.venue);
      const existingVenue = normalize((existingEvent as any).venue);
      if (normalizedVenue !== existingVenue) {
        updateData.venue = data.venue;
        changedFields.push('venue');
      }
    }
    if (data.organizer !== undefined) {
      const normalizedOrganizer = normalize(data.organizer);
      const existingOrganizer = normalize((existingEvent as any).organizer);
      if (normalizedOrganizer !== existingOrganizer) {
        updateData.organizer = data.organizer;
        changedFields.push('organizer');
      }
    }
    const eventTypeValue = eventType !== undefined ? eventType : type;
    if (eventTypeValue !== undefined) {
      const normalizedEventType = normalize(eventTypeValue);
      const existingEventType = normalize((existingEvent as any).eventType || (existingEvent as any).type);
      if (normalizedEventType !== existingEventType) {
        updateData.eventType = eventTypeValue;
        updateData.type = eventTypeValue;
        changedFields.push('eventType');
      }
    }
    if (attendees !== undefined) {
      const normalizedAttendees = normalize(attendees);
      const existingAttendees = normalize((existingEvent as any).attendees);
      if (normalizedAttendees !== existingAttendees) {
        updateData.attendees = attendees;
        changedFields.push('attendees');
      }
    }
    if (budget !== undefined) {
      const normalizedBudget = normalize(budget);
      const existingBudget = normalize((existingEvent as any).budget);
      if (normalizedBudget !== existingBudget) {
        updateData.budget = budget;
        changedFields.push('budget');
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
    // Note: simlifidb doesn't have eventAssignment, using creator instead
    if (updateStatusDto.status === EventStatus.Completed && event.createdBy) {
      await this.notificationsService.createEventCompletionNotification(
        event.createdBy,
        id,
        event.name,
      );
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
    const event = await this.findOne(eventId);

    // Verify user exists
    const user = await this.prisma.client.user.findUnique({
      where: { id: assignUserDto.userId },
      select: { fullName: true, email: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${assignUserDto.userId} not found`);
    }

    // If assigning as Manager, validate user has EventManager role
    if (assignUserDto.role === "Manager" && user.role !== UserRole.EventManager) {
      throw new BadRequestException("Only users with EventManager role can be assigned as Manager");
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
      // Update existing assignment
      const assignment = await this.prisma.client.eventAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          role: assignUserDto.role,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Transform fullName to name for frontend compatibility
      return {
        ...assignment,
        user: assignment.user ? {
          ...assignment.user,
          name: assignment.user.fullName || null,
        } : null,
      };
    }

    // Create new assignment
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
            fullName: true,
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

    // Create activity log
    await this.createActivityLog(userId, "event.user.assigned", {
      eventId,
      eventName: event.name,
      userId: assignUserDto.userId,
      userName: user.fullName || user.email,
      role: assignUserDto.role,
    }, eventId);

    // Transform fullName to name for frontend compatibility
    return {
      ...assignment,
      user: assignment.user ? {
        ...assignment.user,
        name: assignment.user.fullName || null,
      } : null,
    };
  }

  async getEventManager(eventId: string) {
    const assignment = await this.prisma.client.eventAssignment.findFirst({
      where: {
        eventId,
        role: "Manager",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!assignment || !assignment.user) {
      return null;
    }

    return {
      ...assignment.user,
      name: assignment.user.fullName || null,
    };
  }

  async unassignUser(eventId: string, userId: string, adminUserId: string) {
    const event = await this.findOne(eventId);

    // Verify user exists
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Find assignment
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
      where: { id: assignment.id },
    });

    // Create activity log
    await this.createActivityLog(adminUserId, "event.user.unassigned", {
      eventId,
      eventName: event.name,
      userId,
      userName: user.fullName || user.email || userId,
    }, eventId);
  }

  async uploadFile(
    eventId: string,
    file: { originalname: string; path: string; mimetype: string; size: number },
    userId: string,
  ) {
    const event = await this.findOne(eventId);
    
    const fileRecord = await this.prisma.client.file.create({
      data: {
        eventId: eventId,
        filename: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
    
    await this.createActivityLog(userId, "file_uploaded", {
      eventId,
      fileId: fileRecord.id,
      filename: file.originalname,
    });
    
    return fileRecord;
  }

  async deleteFile(eventId: string, fileId: string, userId: string) {
    const event = await this.findOne(eventId);
    
    const file = await this.prisma.client.file.findFirst({
      where: {
        id: fileId,
        eventId: eventId,
      },
    });
    
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found for this event`);
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
    
    await this.createActivityLog(userId, "file_deleted", {
      eventId,
      fileId,
      filename: file.filename,
    });
    
    return { message: "File deleted successfully" };
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

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { AssignEventDto } from "./dto/assign-event.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            events: true,
            activityLogs: true,
            notifications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        events: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            events: true,
            activityLogs: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto, adminUserId: string) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.client.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role || "Viewer",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create activity log
    await this.createActivityLog(adminUserId, "user.created", {
      userId: user.id,
      userName: user.name || user.email,
      email: user.email,
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, adminUserId: string) {
    const user = await this.findOne(id);

    const updateData: any = {};
    const changes: any = {};

    if (updateUserDto.email !== undefined) {
      if (updateUserDto.email !== user.email) {
        const existingUser = await this.prisma.client.user.findUnique({
          where: { email: updateUserDto.email },
        });
        if (existingUser && existingUser.id !== id) {
          throw new ConflictException("User with this email already exists");
        }
        updateData.email = updateUserDto.email;
        changes.email = { from: user.email, to: updateUserDto.email };
      }
    }

    if (updateUserDto.password !== undefined) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      changes.password = "updated";
    }

    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
      changes.name = { from: user.name, to: updateUserDto.name };
    }

    if (updateUserDto.role !== undefined && updateUserDto.role !== user.role) {
      updateData.role = updateUserDto.role;
      changes.role = { from: user.role, to: updateUserDto.role };
    }

    if (Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }

    const updatedUser = await this.prisma.client.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create activity log - only include fields that actually changed
    const changedFieldNames = Object.keys(changes);
    await this.createActivityLog(adminUserId, "user.updated", {
      userId: id,
      userName: updatedUser.name || updatedUser.email,
      changes: changedFieldNames,
    });

    return updatedUser;
  }

  async remove(id: string, adminUserId: string) {
    const user = await this.findOne(id);
    const userEmail = user.email;

    await this.prisma.client.user.delete({
      where: { id },
    });

    // Create activity log
    await this.createActivityLog(adminUserId, "user.deleted", {
      userId: id,
      email: userEmail,
    });
  }

  async assignRole(userId: string, assignRoleDto: AssignRoleDto, adminUserId: string) {
    const user = await this.findOne(userId);
    const oldRole = user.role;

    if (oldRole === assignRoleDto.role) {
      return this.findOne(userId);
    }

    await this.prisma.client.user.update({
      where: { id: userId },
      data: { role: assignRoleDto.role },
    });

    // Get user details for activity log
    const targetUser = await this.findOne(userId);

    // Create activity log
    await this.createActivityLog(adminUserId, "user.role.assigned", {
      userId,
      userName: targetUser.name || targetUser.email,
      oldRole,
      newRole: assignRoleDto.role,
    });

    return this.findOne(userId);
  }

  async assignEvent(userId: string, assignEventDto: AssignEventDto, adminUserId: string) {
    // Verify user exists
    await this.findOne(userId);

    // Verify event exists
    const event = await this.prisma.client.event.findUnique({
      where: { id: assignEventDto.eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${assignEventDto.eventId} not found`);
    }

    // Create or update event assignment
    const assignment = await this.prisma.client.eventAssignment.upsert({
      where: {
        userId_eventId: {
          userId,
          eventId: assignEventDto.eventId,
        },
      },
      create: {
        userId,
        eventId: assignEventDto.eventId,
        role: assignEventDto.role,
      },
      update: {
        role: assignEventDto.role,
      },
    });

    // Get user details for activity log
    const assignedUser = await this.findOne(userId);

    // Create activity log
    await this.createActivityLog(
      adminUserId,
      "user.event.assigned",
      {
        userId,
        userName: assignedUser.name || assignedUser.email,
        eventId: assignEventDto.eventId,
        eventName: event.name,
        role: assignEventDto.role,
      },
      assignEventDto.eventId,
    );

    return assignment;
  }

  async getActivityLogs(userId: string, eventId?: string) {
    // Verify user exists
    await this.findOne(userId);

    const where: any = { userId };
    if (eventId) {
      where.eventId = eventId;
    }

    return this.prisma.client.activityLog.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
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


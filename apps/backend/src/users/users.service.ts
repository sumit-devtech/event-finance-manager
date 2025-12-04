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
import { EmailService } from "../notifications/email.service";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async findAll() {
    const users = await this.prisma.client.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        events: {
          select: {
            eventId: true,
          },
        },
        _count: {
          select: {
            createdEvents: true,
            events: true, // Count assigned events (EventAssignment relation)
            activityLogs: true,
            notifications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Transform fullName to name for frontend compatibility
    // Also include assignedEventIds to avoid N+1 queries in frontend
    const transformed = users.map((user) => {
      const { fullName, _count, events, ...rest } = user;
      return {
        ...rest,
        name: fullName || null, // Map fullName to name, remove fullName from response
        assignedEventIds: events.map((e) => e.eventId), // Extract event IDs for filtering
        _count: {
          events: (_count.events || 0), // Count assigned events (EventAssignment relation)
          activityLogs: _count.activityLogs || 0,
          notifications: _count.notifications || 0,
        },
      };
    });
    
    return transformed;
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        createdEvents: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        events: {
          select: {
            eventId: true,
          },
        },
        _count: {
          select: {
            createdEvents: true,
            events: true, // Count assigned events (EventAssignment relation)
            activityLogs: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Transform fullName to name for frontend compatibility
    // Also transform _count.events to _count.events (already correct)
    // Include assignedEventIds for filtering
    const { fullName, _count, events, ...rest } = user;
    const transformed = {
      ...rest,
      name: fullName || null, // Map fullName to name, remove fullName from response
      assignedEventIds: events.map((e) => e.eventId), // Extract event IDs for filtering
      _count: {
        events: (_count.events || 0), // Count assigned events (EventAssignment relation)
        activityLogs: _count.activityLogs || 0,
        notifications: _count.notifications || 0,
      },
    };
    
    //console.log("findOne - User transformed:", JSON.stringify(transformed, null, 2));
    //console.log("findOne - Original fullName:", user.fullName);
    
    return transformed;
  }

  async create(createUserDto: CreateUserDto, adminUserId: string, organizationId?: string) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Generate email verification token
    const emailVerificationToken = randomUUID();
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours expiry

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.client.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        fullName: createUserDto.name || "",
        role: createUserDto.role || "Viewer",
        organizationId: organizationId || null,
        isActive: false, // Inactive until email verified
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send verification email
    const verificationUrl = `${this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173"}/auth/verify-email?token=${emailVerificationToken}`;
    
    try {
      console.log("Sending verification email to", createUserDto.email);
      await this.emailService.sendNotificationEmail({
        to: createUserDto.email,
        name: createUserDto.name || createUserDto.email.split("@")[0],
        type: "Info" as any,
        title: "Welcome! Verify Your Email Address",
        message: `You have been invited to join the Event Finance Manager platform.\n\nPlease click the link below to verify your email address and activate your account:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
        metadata: {
          verificationUrl,
          token: emailVerificationToken,
        },
      });
      console.log("Verification email sent to", createUserDto.email);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail user creation if email fails - user can request resend
    }

    // Create activity log
    await this.createActivityLog(adminUserId, "user.created", {
      userId: user.id,
      userName: user.fullName || user.email,
      email: user.email,
    }, undefined, organizationId);

    // Transform fullName to name for frontend compatibility
    const { fullName, ...rest } = user;
    return {
      ...rest,
      name: fullName || null, // Map fullName to name, remove fullName from response
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, adminUserId: string) {
    // Get raw user data from database (not transformed)
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

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
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      changes.password = "updated";
    }

    if (updateUserDto.name !== undefined) {
      // Always update the name, even if it's the same or empty
      const newName = updateUserDto.name || "";
      const oldName = user.fullName || "";
      
      // Only add to updateData if it's different
      if (newName !== oldName) {
        updateData.fullName = newName;
        changes.name = { from: oldName, to: newName };
      }
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
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create activity log - only include fields that actually changed
    const changedFieldNames = Object.keys(changes);
    await this.createActivityLog(adminUserId, "user.updated", {
      userId: id,
      userName: updatedUser.fullName || updatedUser.email,
      changes: changedFieldNames,
    });

    // Transform fullName to name for frontend compatibility
    const { fullName, ...rest } = updatedUser;
    return {
      ...rest,
      name: fullName || null, // Map fullName to name, remove fullName from response
    };
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
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { role: true, fullName: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const oldRole = user.role;

    if (oldRole === assignRoleDto.role) {
      return this.findOne(userId);
    }

    await this.prisma.client.user.update({
      where: { id: userId },
      data: { role: assignRoleDto.role },
    });

    // Create activity log
    await this.createActivityLog(adminUserId, "user.role.assigned", {
      userId,
      userName: user.fullName || user.email,
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

    // Get user info for activity log
    const assignedUser = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });

    if (!assignedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.client.eventAssignment.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: assignEventDto.eventId,
        },
      },
    });

    let assignment;
    if (existingAssignment) {
      assignment = await this.prisma.client.eventAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          role: assignEventDto.role,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    } else {
      assignment = await this.prisma.client.eventAssignment.create({
        data: {
          userId: userId,
          eventId: assignEventDto.eventId,
          role: assignEventDto.role,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    }

    // Create activity log
    await this.createActivityLog(
      adminUserId,
      "user.event.assigned",
      {
        userId,
        userName: assignedUser.fullName || assignedUser.email,
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
            fullName: true,
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
    organizationId?: string,
  ) {
    await this.prisma.client.activityLog.create({
      data: {
        userId,
        action,
        details,
        eventId,
        organizationId,
      },
    });
  }
}


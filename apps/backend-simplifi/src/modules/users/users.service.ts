import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { InviteUserDto } from "./dto/invite-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.client.user.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this user");
    }

    return user;
  }

  async create(dto: CreateUserDto, currentUserOrgId: string) {
    // Check if email already exists
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Use current user's organization if not specified
    const organizationId = dto.organizationId || currentUserOrgId;

    if (!organizationId) {
      throw new BadRequestException("Organization ID is required");
    }

    // Verify organization exists
    const organization = await this.prisma.client.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    // Generate temporary password (in production, send invitation email)
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        organizationId,
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    // TODO: Send invitation email with tempPassword

    return user;
  }

  async invite(dto: InviteUserDto, currentUserOrgId: string) {
    // Check if email already exists
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    if (!currentUserOrgId) {
      throw new BadRequestException("User must belong to an organization");
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        organizationId: currentUserOrgId,
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    // TODO: Send invitation email with tempPassword

    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserOrgId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.organizationId !== currentUserOrgId) {
      throw new ForbiddenException("Access denied to this user");
    }

    const updatedUser = await this.prisma.client.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async updateRole(id: string, role: string, currentUserOrgId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.organizationId !== currentUserOrgId) {
      throw new ForbiddenException("Access denied to this user");
    }

    const validRoles = ["admin", "manager", "finance", "viewer"];
    if (!validRoles.includes(role)) {
      throw new BadRequestException("Invalid role");
    }

    const updatedUser = await this.prisma.client.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string, currentUserOrgId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.organizationId !== currentUserOrgId) {
      throw new ForbiddenException("Access denied to this user");
    }

    // Soft delete by setting isActive to false
    const updatedUser = await this.prisma.client.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    return updatedUser;
  }
}


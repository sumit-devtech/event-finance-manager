import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    // Create organization and admin user in transaction
    const result = await this.prisma.client.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          industry: dto.industry,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: dto.adminEmail,
          fullName: dto.adminFullName,
          passwordHash,
          role: "admin",
          organizationId: organization.id,
          isActive: true,
        },
      });

      return { organization, user };
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.user.id);

    return {
      ...tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        organizationId: result.user.organizationId || undefined,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is inactive");
    }

    const tokens = await this.generateTokens(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId || undefined,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        organizationId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return user;
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("JWT_EXPIRES_IN") || "7d",
    });

    // Optional: Implement refresh token logic here
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "30d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}


import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../notifications/email.service";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { SubscriptionStatus, BillingCycle } from "@event-finance-manager/database";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });
    console.log("user", user);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException("Please verify your email before logging in");
    }
    
    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException("Your account is inactive. Please contact support.");
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<{ message: string; email: string }> {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Generate email verification token
    const emailVerificationToken = randomUUID();
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours expiry

    // Generate organization name from email domain or use default
    const emailDomain = registerDto.email.split("@")[1];
    const organizationName = `${registerDto.name || emailDomain.split(".")[0]}'s Organization`;

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create everything in a transaction
    const result = await this.prisma.client.$transaction(async (tx) => {
      // 1. Create Organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      // 2. Create User (as Admin, inactive until email verified)
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          passwordHash: hashedPassword,
          fullName: registerDto.name || registerDto.email.split("@")[0],
          role: "Admin", // First user is Admin
          organizationId: organization.id,
          isActive: false, // Inactive until email verified
          emailVerified: false,
          emailVerificationToken,
          emailVerificationExpires,
        },
      });

      // 3. Create Free Subscription
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planName: "free",
          billingCycle: BillingCycle.Monthly,
          status: SubscriptionStatus.Active,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      // 4. Create Subscription History
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          action: "create",
          newValue: {
            planName: "free",
            billingCycle: BillingCycle.Monthly,
            status: SubscriptionStatus.Active,
          },
          changedBy: user.id,
        },
      });

      // 5. Create Activity Log
      await tx.activityLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: "user.registered",
          details: {
            email: user.email,
            fullName: user.fullName,
          },
        },
      });

      return { user, organization };
    });

    // Send verification email
    const verificationUrl = `${this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173"}/auth/verify-email?token=${emailVerificationToken}`;
    
    try {
       console.log("Sending verification email to", registerDto.email);
       await this.emailService.sendNotificationEmail({
         to: registerDto.email,
         name: registerDto.name || registerDto.email.split("@")[0],
         type: "Info" as any,
         title: "Verify Your Email Address",
         message: `Please click the link below to verify your email address and activate your account:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
         metadata: {
           verificationUrl,
           token: emailVerificationToken,
         },
       });
       console.log("Verification email sent to", registerDto.email);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail registration if email fails - user can request resend
    }

    return {
      message: "Registration successful. Please check your email to verify your account.",
      email: registerDto.email,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET") || "refresh-secret-key",
      });

      const user = await this.prisma.client.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          organizationId: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // In a production system, you might want to:
    // 1. Store refresh tokens in a database and invalidate them
    // 2. Use a token blacklist/redis cache
    // For now, we'll just return success
    // The client should delete the tokens on their end
    return { message: "Logged out successfully" };
  }

  async verifyEmail(token: string): Promise<AuthResponseDto> {
    const user = await this.prisma.client.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException("Invalid verification token");
    }

    if (user.emailVerified) {
      throw new BadRequestException("Email already verified");
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException("Verification token has expired. Please request a new one.");
    }

    // Update user to verified and active
    const updatedUser = await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        organizationId: true,
      },
    });

    // Create activity log
    if (updatedUser.organizationId) {
      await this.prisma.client.activityLog.create({
        data: {
          organizationId: updatedUser.organizationId,
          userId: updatedUser.id,
          action: "user.email_verified",
          details: {
            email: updatedUser.email,
          },
        },
      });
    }

    return this.generateTokens(updatedUser);
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: "If an account exists with this email, a verification link has been sent." };
    }

    if (user.emailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    // Generate new verification token
    const emailVerificationToken = randomUUID();
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Send verification email
    const verificationUrl = `${this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173"}/auth/verify-email?token=${emailVerificationToken}`;
    
    try {
      await this.emailService.sendNotificationEmail({
        to: user.email,
        name: user.fullName || user.email.split("@")[0],
        type: "Info" as any,
        title: "Verify Your Email Address",
        message: `Please click the link below to verify your email address and activate your account:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
        metadata: {
          verificationUrl,
          token: emailVerificationToken,
        },
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new BadRequestException("Failed to send verification email. Please try again later.");
    }

    return { message: "Verification email sent. Please check your inbox." };
  }

  private generateTokens(user: any): AuthResponseDto {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId || null,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("JWT_EXPIRES_IN") || "1h",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET") || "refresh-secret-key",
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d",
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName || null,
        role: user.role,
        organizationId: user.organizationId || null,
      },
    };
  }
}


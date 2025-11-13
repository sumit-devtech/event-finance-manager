import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "../../auth/types/user-role.enum";

@Injectable()
export class EventAssignmentGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const eventId = request.params.id;
    const method = request.method;

    // Admin can always access
    if (user.role === UserRole.Admin) {
      return true;
    }

    // For GET requests, allow all authenticated users to view
    if (method === "GET") {
      return true;
    }

    // EventManager can only edit assigned events
    if (user.role === UserRole.EventManager) {
      if (!eventId) {
        return true; // Allow creating events
      }

      const assignment = await this.prisma.client.eventAssignment.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: eventId,
          },
        },
      });

      if (!assignment) {
        throw new ForbiddenException("You can only edit events assigned to you");
      }
    }

    // Finance and Viewer roles cannot edit events
    if ([UserRole.Finance, UserRole.Viewer].includes(user.role)) {
      throw new ForbiddenException("You do not have permission to edit events");
    }

    return true;
  }
}


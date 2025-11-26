import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.orgId || request.body?.organizationId;

    if (!user || !user.organizationId) {
      throw new ForbiddenException("User must belong to an organization");
    }

    if (organizationId && user.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this organization");
    }

    return true;
  }
}


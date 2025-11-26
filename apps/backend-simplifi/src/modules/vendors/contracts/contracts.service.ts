import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { ActivityLogsService } from "../../activity-logs/activity-logs.service";
import { CreateContractDto } from "../dto/create-contract.dto";

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async findAll(vendorId: string, organizationId: string) {
    const vendor = await this.prisma.client.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    if (vendor.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this vendor");
    }

    return this.prisma.client.vendorContract.findMany({
      where: { vendorId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, organizationId: string) {
    const contract = await this.prisma.client.vendorContract.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    if (
      contract.vendor.organizationId !== organizationId ||
      contract.event.organizationId !== organizationId
    ) {
      throw new ForbiddenException("Access denied to this contract");
    }

    return contract;
  }

  async create(dto: CreateContractDto, userId: string, organizationId: string) {
    // Verify vendor and event belong to organization
    const [vendor, event] = await Promise.all([
      this.prisma.client.vendor.findUnique({ where: { id: dto.vendorId } }),
      this.prisma.client.event.findUnique({ where: { id: dto.eventId } }),
    ]);

    if (!vendor || vendor.organizationId !== organizationId) {
      throw new NotFoundException("Vendor not found or access denied");
    }

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException("Event not found or access denied");
    }

    const contract = await this.prisma.client.vendorContract.create({
      data: {
        vendorId: dto.vendorId,
        eventId: dto.eventId,
        amount: dto.amount,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        terms: dto.terms,
        contractFileUrl: dto.contractFileUrl,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(dto.eventId, userId, "contract.created", {
      contractId: contract.id,
      vendorId: dto.vendorId,
      amount: dto.amount,
    });

    return contract;
  }

  async update(
    id: string,
    dto: Partial<CreateContractDto>,
    organizationId: string,
  ) {
    const contract = await this.findOne(id, organizationId);

    const updated = await this.prisma.client.vendorContract.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.activityLogsService.logActivity(contract.eventId, null, "contract.updated", {
      contractId: id,
      changes: dto,
    });

    return updated;
  }
}


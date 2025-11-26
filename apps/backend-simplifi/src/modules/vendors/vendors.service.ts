import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.client.vendor.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            vendorEvents: true,
            contracts: true,
            expenses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, organizationId: string) {
    const vendor = await this.prisma.client.vendor.findUnique({
      where: { id },
      include: {
        vendorEvents: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        contracts: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    if (vendor.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this vendor");
    }

    return vendor;
  }

  async create(dto: CreateVendorDto, organizationId: string) {
    const vendor = await this.prisma.client.vendor.create({
      data: {
        name: dto.name,
        serviceType: dto.serviceType,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        gstNumber: dto.gstNumber,
        rating: dto.rating,
        organizationId: dto.organizationId || organizationId,
      },
    });

    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto, organizationId: string) {
    const vendor = await this.findOne(id, organizationId);

    const updated = await this.prisma.client.vendor.update({
      where: { id },
      data: dto,
    });

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const vendor = await this.findOne(id, organizationId);

    await this.prisma.client.vendor.delete({
      where: { id },
    });

    return { message: "Vendor deleted successfully" };
  }

  async assignToEvent(vendorId: string, eventId: string, organizationId: string) {
    // Verify vendor and event belong to organization
    const [vendor, event] = await Promise.all([
      this.prisma.client.vendor.findUnique({ where: { id: vendorId } }),
      this.prisma.client.event.findUnique({ where: { id: eventId } }),
    ]);

    if (!vendor || vendor.organizationId !== organizationId) {
      throw new NotFoundException("Vendor not found or access denied");
    }

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException("Event not found or access denied");
    }

    // Check if already assigned
    const existing = await this.prisma.client.vendorEvent.findFirst({
      where: {
        vendorId,
        eventId,
      },
    });

    if (existing) {
      throw new ConflictException("Vendor is already assigned to this event");
    }

    const vendorEvent = await this.prisma.client.vendorEvent.create({
      data: {
        vendorId,
        eventId,
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

    return vendorEvent;
  }
}


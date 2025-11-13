import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, EventStatus } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const { startDate, endDate, ...data } = createEventDto;

    return this.prisma.client.event.create({
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.client.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        budgetItems: true,
        _count: {
          select: {
            files: true,
            activityLogs: true,
            aiSuggestions: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const { startDate, endDate, ...data } = updateEventDto;

    // Check if event exists
    await this.findOne(id);

    return this.prisma.client.event.update({
      where: { id },
      data: {
        ...data,
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Check if event exists
    await this.findOne(id);

    await this.prisma.client.event.delete({
      where: { id },
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
}


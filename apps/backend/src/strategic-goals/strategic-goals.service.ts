import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStrategicGoalDto } from "./dto/create-strategic-goal.dto";
import { UpdateStrategicGoalDto } from "./dto/update-strategic-goal.dto";

@Injectable()
export class StrategicGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByEvent(eventId: string) {
    // Verify event exists
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const goals = await this.prisma.client.strategicGoal.findMany({
      where: { eventId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return goals;
  }

  async findOne(id: string) {
    const goal = await this.prisma.client.strategicGoal.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        budgetItems: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    if (!goal) {
      throw new NotFoundException(`Strategic goal with ID ${id} not found`);
    }

    return goal;
  }

  async create(eventId: string, createGoalDto: CreateStrategicGoalDto) {
    // Verify event exists
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const goal = await this.prisma.client.strategicGoal.create({
      data: {
        eventId,
        title: createGoalDto.title,
        description: createGoalDto.description || null,
        targetValue: createGoalDto.targetValue || null,
        currentValue: createGoalDto.currentValue || null,
        unit: createGoalDto.unit || null,
        deadline: createGoalDto.deadline ? new Date(createGoalDto.deadline) : null,
        status: createGoalDto.status || "not-started",
        priority: createGoalDto.priority || "medium",
      },
    });

    return goal;
  }

  async update(id: string, updateGoalDto: UpdateStrategicGoalDto) {
    const goal = await this.findOne(id);

    const updateData: any = {};

    if (updateGoalDto.title !== undefined) {
      updateData.title = updateGoalDto.title;
    }
    if (updateGoalDto.description !== undefined) {
      updateData.description = updateGoalDto.description || null;
    }
    if (updateGoalDto.targetValue !== undefined) {
      updateData.targetValue = updateGoalDto.targetValue || null;
    }
    if (updateGoalDto.currentValue !== undefined) {
      updateData.currentValue = updateGoalDto.currentValue || null;
    }
    if (updateGoalDto.unit !== undefined) {
      updateData.unit = updateGoalDto.unit || null;
    }
    if (updateGoalDto.deadline !== undefined) {
      updateData.deadline = updateGoalDto.deadline ? new Date(updateGoalDto.deadline) : null;
    }
    if (updateGoalDto.status !== undefined) {
      updateData.status = updateGoalDto.status;
    }
    if (updateGoalDto.priority !== undefined) {
      updateData.priority = updateGoalDto.priority;
    }

    const updatedGoal = await this.prisma.client.strategicGoal.update({
      where: { id },
      data: updateData,
    });

    return updatedGoal;
  }

  async remove(id: string): Promise<void> {
    const goal = await this.findOne(id);

    await this.prisma.client.strategicGoal.delete({
      where: { id },
    });
  }
}


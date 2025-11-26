import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { HubSpotProvider } from "./providers/hubspot.provider";
import { SalesforceProvider } from "./providers/salesforce.provider";
import { ActivityLogsService } from "../activity-logs/activity-logs.service";

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
    private hubspotProvider: HubSpotProvider,
    private salesforceProvider: SalesforceProvider,
    private activityLogsService: ActivityLogsService,
  ) {}

  async buildPayloadForEvent(eventId: string): Promise<any> {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      include: {
        expenses: {
          where: { status: "approved" },
        },
        roiMetrics: true,
        stakeholders: true,
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    // Aggregate expenses
    const totalSpend = event.expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      eventId: event.id,
      eventName: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      totalSpend,
      stakeholders: event.stakeholders.map((s) => ({
        name: s.name,
        email: s.email,
        role: s.role,
      })),
      roiMetrics: event.roiMetrics
        ? {
            leadsGenerated: event.roiMetrics.leadsGenerated,
            conversions: event.roiMetrics.conversions,
            revenueGenerated: event.roiMetrics.revenueGenerated,
          }
        : null,
    };
  }

  async syncEvent(eventId: string, crmSystem: string = "hubspot", organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const payload = await this.buildPayloadForEvent(eventId);

    let response: any;
    try {
      if (crmSystem === "hubspot") {
        response = await this.hubspotProvider.syncEvent(eventId, payload);
      } else if (crmSystem === "salesforce") {
        response = await this.salesforceProvider.syncEvent(eventId, payload);
      } else {
        throw new BadRequestException(`Unsupported CRM system: ${crmSystem}`);
      }

      // Update or create CRMSync record
      const syncStatus = response.success ? "success" : "failed";
      const crmSync = await this.prisma.client.cRMSync.upsert({
        where: { eventId },
        update: {
          crmSystem,
          syncStatus,
          lastSyncedAt: new Date(),
          data: response,
        },
        create: {
          eventId,
          crmSystem,
          syncStatus,
          lastSyncedAt: new Date(),
          data: response,
        },
      });

      // Log activity
      await this.activityLogsService.logActivity(eventId, null, "crm.synced", {
        crmSystem,
        status: syncStatus,
      });

      return crmSync;
    } catch (error) {
      // Store failure
      const crmSync = await this.prisma.client.cRMSync.upsert({
        where: { eventId },
        update: {
          crmSystem,
          syncStatus: "failed",
          lastSyncedAt: new Date(),
          data: { error: error instanceof Error ? error.message : String(error) },
        },
        create: {
          eventId,
          crmSystem,
          syncStatus: "failed",
          lastSyncedAt: new Date(),
          data: { error: error instanceof Error ? error.message : String(error) },
        },
      });

      throw error;
    }
  }

  async getSyncStatus(eventId: string, organizationId: string) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException("Access denied to this event");
    }

    const crmSync = await this.prisma.client.cRMSync.findUnique({
      where: { eventId },
    });

    return crmSync || null;
  }
}


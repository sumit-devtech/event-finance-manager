import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class ApprovalService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async determineApprovers(expense: any, organizationId: string): Promise<string[]> {
    // Simple role-based approver selection
    // In production, this could be more sophisticated (threshold-based, custom rules, etc.)
    const approvers = await this.prisma.client.user.findMany({
      where: {
        organizationId,
        role: { in: ["admin", "finance", "manager"] },
        isActive: true,
      },
      select: {
        id: true,
        role: true,
      },
    });

    // For expenses above certain threshold, require admin approval
    const threshold = 10000; // $10,000
    if (expense.amount > threshold) {
      return approvers.filter((a) => a.role === "admin").map((a) => a.id);
    }

    // Otherwise, finance or manager can approve
    return approvers.filter((a) => ["finance", "manager"].includes(a.role)).map((a) => a.id);
  }

  async notifyApprovers(expense: any, approverIds: string[]) {
    if (approverIds.length === 0) {
      return;
    }

    await this.notificationsService.notifyApproversForExpense(expense, approverIds);
  }

  async getApprovalHistory(expenseId: string) {
    return this.prisma.client.approvalWorkflow.findMany({
      where: { expenseId },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { actionAt: "desc" },
    });
  }
}


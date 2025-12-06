import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ExpenseStatus } from "@event-finance-manager/database";

/**
 * MetricsService - Pre-computed Metrics Management
 * 
 * This service maintains pre-computed metrics in database tables for fast read operations.
 * Metrics are recalculated synchronously after every CRUD operation to ensure real-time
 * accuracy for modals and detail views.
 * 
 * Key Design Principles:
 * - Synchronous updates: CRUD operations wait for metrics recompute (ensures immediate consistency)
 * - Fallback strategy: Services check metrics tables first, calculate on-the-fly if missing
 * - Multi-level metrics: Organization (DashboardMetrics), Event (EventMetrics), Vendor (VendorMetrics)
 * - Error resilience: Metrics recompute failures don't break CRUD operations
 */
@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // Organization-Level Metrics (Dashboard)
  // ============================================================================

  /**
   * Recomputes dashboard metrics for an organization
   * Called after: Event CRUD operations, Expense status changes
   * 
   * @param organizationId - Organization ID to compute metrics for
   */
  async recomputeDashboardMetrics(organizationId: string) {
    // Get all events for organization
    const events = await this.prisma.client.event.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true, // Include name for recent events display
        startDate: true,
        createdAt: true,
        status: true,
      },
    });

    // Get all budget items for organization
    const budgetItems = await this.prisma.client.budgetItem.findMany({
      where: {
        event: { organizationId },
      },
      select: {
        estimatedCost: true,
        createdAt: true,
      },
    });

    // Get all expenses for organization
    const expenses = await this.prisma.client.expense.findMany({
      where: { organizationId },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const totalBudget = budgetItems.reduce(
      (sum, item) => sum + (item.estimatedCost ? Number(item.estimatedCost) : 0),
      0,
    );

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const pendingApprovals = expenses.filter((e) => e.status === ExpenseStatus.Pending).length;

    // Get event metrics to count over-budget events
    const eventMetrics = await this.prisma.client.eventMetrics.findMany({
      where: {
        event: { organizationId },
      },
      select: {
        isOverBudget: true,
      },
    });

    const overBudgetEvents = eventMetrics.filter((m) => m.isOverBudget).length;

    // Get upcoming events (startDate > now)
    const now = new Date();
    const upcomingEvents = events.filter(
      (e) => e.startDate && new Date(e.startDate) > now,
    ).length;

    // Get recent events (last 5, sorted by createdAt)
    // Include name for frontend display
    const recentEvents = events
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        name: e.name, // Include name for display
        createdAt: e.createdAt,
        status: e.status,
      }));

    // Calculate stats
    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter((e) => e.status === "Active").length,
      completedEvents: events.filter((e) => e.status === "Completed").length,
      planningEvents: events.filter((e) => e.status === "Planning").length,
      cancelledEvents: events.filter((e) => e.status === "Cancelled").length,
    };

    // Calculate monthly budget/spent data (last 6 months)
    const currentMonth = new Date().getMonth();
    const MONTH_NAMES = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyData: Record<string, { budget: number; spent: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData[MONTH_NAMES[monthIndex]] = { budget: 0, spent: 0 };
    }

    // Aggregate budget items by month
    budgetItems.forEach((item) => {
      const itemDate = item.createdAt;
      const monthName = MONTH_NAMES[new Date(itemDate).getMonth()];
      if (monthlyData[monthName]) {
        monthlyData[monthName].budget += item.estimatedCost ? Number(item.estimatedCost) : 0;
      }
    });

    // Aggregate expenses by month
    expenses.forEach((expense) => {
      const expenseDate = expense.createdAt;
      const monthName = MONTH_NAMES[new Date(expenseDate).getMonth()];
      if (monthlyData[monthName]) {
        monthlyData[monthName].spent += expense.amount;
      }
    });

    const budgetData = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, budget: data.budget || 0, spent: data.spent || 0 }))
      .sort(
        (a, b) =>
          MONTH_NAMES.indexOf(a.month as typeof MONTH_NAMES[number]) -
          MONTH_NAMES.indexOf(b.month as typeof MONTH_NAMES[number]),
      );

    // Calculate expense categories
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      const category = "Miscellaneous"; // Default category
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const totalBudgetForCategories = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0,
    );
    const expenseCategories =
      totalBudgetForCategories > 0
        ? Object.entries(categoryTotals)
            .map(([name, value]) => ({
              name,
              value: Math.round((value / totalBudgetForCategories) * 100),
            }))
            .sort((a, b) => b.value - a.value)
        : [];

    // Upsert dashboard metrics (creates if doesn't exist, updates if exists)
    // This ensures idempotency - safe to call multiple times
    await this.prisma.client.dashboardMetrics.upsert({
      where: { organizationId },
      update: {
        totalBudget,
        totalExpenses,
        pendingApprovals,
        overBudgetEvents,
        upcomingEvents,
        recentEvents: recentEvents as any,
        chartsJson: {
          budgetData,
          expenseCategories,
        } as any,
        statsJson: stats as any,
        lastComputedAt: new Date(),
      },
      create: {
        organizationId,
        totalBudget,
        totalExpenses,
        pendingApprovals,
        overBudgetEvents,
        upcomingEvents,
        recentEvents: recentEvents as any,
        chartsJson: {
          budgetData,
          expenseCategories,
        } as any,
        statsJson: stats as any,
        lastComputedAt: new Date(),
      },
    });
  }

  /**
   * Retrieves cached dashboard metrics for an organization
   * Returns null if metrics haven't been computed yet (triggers fallback calculation)
   * 
   * @param organizationId - Organization ID
   * @returns Cached dashboard metrics or null
   */
  async getDashboardMetrics(organizationId: string) {
    return this.prisma.client.dashboardMetrics.findUnique({
      where: { organizationId },
    });
  }

  // ============================================================================
  // Event-Level Metrics
  // ============================================================================

  /**
   * Recomputes event-level metrics for a specific event
   * Called after: Event CRUD, BudgetItem CRUD, Expense CRUD
   * 
   * Also triggers dashboard metrics recompute for the event's organization
   * 
   * @param eventId - Event ID to compute metrics for
   */
  async recomputeEventMetrics(eventId: string) {
    // Get event
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Get all budget items for event
    const budgetItems = await this.prisma.client.budgetItem.findMany({
      where: { eventId },
      select: {
        category: true,
        estimatedCost: true,
        actualCost: true,
      },
    });

    // Get all expenses for event
    const expenses = await this.prisma.client.expense.findMany({
      where: { eventId },
      select: {
        amount: true,
        status: true,
      },
    });

    // Calculate totals
    let totalBudget = 0;
    let totalEstimated = 0;
    let totalActual = 0;
    const totalsByCategory: Record<string, { estimated: number; actual: number }> = {};

    budgetItems.forEach((item) => {
      const category = item.category;
      if (!totalsByCategory[category]) {
        totalsByCategory[category] = { estimated: 0, actual: 0 };
      }

      const estimated = item.estimatedCost ? Number(item.estimatedCost) : 0;
      const actual = item.actualCost ? Number(item.actualCost) : 0;

      totalsByCategory[category].estimated += estimated;
      totalsByCategory[category].actual += actual;
      totalEstimated += estimated;
      totalActual += actual;
    });

    totalBudget = totalEstimated;

    // Calculate spent (sum of approved expenses)
    const totalSpent = expenses
      .filter((e) => e.status === ExpenseStatus.Approved)
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate variance
    const variance = totalActual - totalEstimated;
    const variancePercentage = totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;
    const isOverBudget = variance > 0;

    // Count expenses by status
    const pendingExpensesCount = expenses.filter((e) => e.status === ExpenseStatus.Pending)
      .length;
    const approvedExpensesCount = expenses.filter((e) => e.status === ExpenseStatus.Approved)
      .length;
    const rejectedExpensesCount = expenses.filter((e) => e.status === ExpenseStatus.Rejected)
      .length;

    // Upsert event metrics (creates if doesn't exist, updates if exists)
    await this.prisma.client.eventMetrics.upsert({
      where: { eventId },
      update: {
        organizationId: event.organizationId,
        totalBudget,
        totalSpent,
        totalEstimated,
        totalActual,
        variance,
        variancePercentage: Number(variancePercentage.toFixed(2)),
        isOverBudget,
        totalsByCategory: totalsByCategory as any,
        pendingExpensesCount,
        approvedExpensesCount,
        rejectedExpensesCount,
        budgetItemsCount: budgetItems.length,
        lastComputedAt: new Date(),
      },
      create: {
        eventId,
        organizationId: event.organizationId,
        totalBudget,
        totalSpent,
        totalEstimated,
        totalActual,
        variance,
        variancePercentage: Number(variancePercentage.toFixed(2)),
        isOverBudget,
        totalsByCategory: totalsByCategory as any,
        pendingExpensesCount,
        approvedExpensesCount,
        rejectedExpensesCount,
        budgetItemsCount: budgetItems.length,
        lastComputedAt: new Date(),
      },
    });

    // Cascade: Also update dashboard metrics for the organization
    // This ensures dashboard always reflects latest event-level changes
    if (event.organizationId) {
      await this.recomputeDashboardMetrics(event.organizationId);
    }
  }

  /**
   * Retrieves cached event metrics
   * Returns null if metrics haven't been computed yet (triggers fallback calculation)
   * 
   * @param eventId - Event ID
   * @returns Cached event metrics or null
   */
  async getEventMetrics(eventId: string) {
    return this.prisma.client.eventMetrics.findUnique({
      where: { eventId },
    });
  }

  /**
   * Bulk recomputes event metrics for all events in an organization
   * Useful for initial setup or data migration scenarios
   * 
   * @param organizationId - Organization ID
   */
  async recomputeEventMetricsForOrganization(organizationId: string) {
    const events = await this.prisma.client.event.findMany({
      where: { organizationId },
      select: { id: true },
    });

    // Process sequentially to avoid overwhelming the database
    for (const event of events) {
      await this.recomputeEventMetrics(event.id);
    }
  }

  // ============================================================================
  // Vendor-Level Metrics
  // ============================================================================

  /**
   * Recomputes vendor-level metrics for a specific vendor
   * Called after: Vendor-event assignments, Expense-vendor links, BudgetItem-vendor links
   * 
   * @param vendorId - Vendor ID to compute metrics for
   */
  async recomputeVendorMetrics(vendorId: string) {
    // Get vendor
    const vendor = await this.prisma.client.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!vendor) {
      throw new Error(`Vendor with ID ${vendorId} not found`);
    }

    // Get vendor events
    const vendorEvents = await this.prisma.client.vendorEvent.findMany({
      where: { vendorId },
      select: {
        assignedAt: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    // Get vendor expenses (approved only)
    const expenses = await this.prisma.client.expense.findMany({
      where: {
        vendorId,
        status: ExpenseStatus.Approved,
      },
      select: {
        amount: true,
      },
    });

    const totalContracts = vendorEvents.length;
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const lastContractDate =
      vendorEvents.length > 0 ? vendorEvents[0].assignedAt : null;

    // Upsert vendor metrics (creates if doesn't exist, updates if exists)
    await this.prisma.client.vendorMetrics.upsert({
      where: { vendorId },
      update: {
        organizationId: vendor.organizationId,
        totalContracts,
        totalSpent,
        eventsCount: totalContracts,
        lastContractDate,
        lastComputedAt: new Date(),
      },
      create: {
        vendorId,
        organizationId: vendor.organizationId,
        totalContracts,
        totalSpent,
        eventsCount: totalContracts,
        lastContractDate,
        lastComputedAt: new Date(),
      },
    });
  }

  /**
   * Retrieves cached vendor metrics
   * Returns null if metrics haven't been computed yet (triggers fallback calculation)
   * 
   * @param vendorId - Vendor ID
   * @returns Cached vendor metrics or null
   */
  async getVendorMetrics(vendorId: string) {
    return this.prisma.client.vendorMetrics.findUnique({
      where: { vendorId },
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Recomputes all metrics for an organization (dashboard, events, vendors)
   * Useful for initial setup, data migration, or manual refresh
   * 
   * @param organizationId - Organization ID
   */
  async recomputeAllMetrics(organizationId: string) {
    await this.recomputeEventMetricsForOrganization(organizationId);
    await this.recomputeDashboardMetrics(organizationId);

    // Recompute vendor metrics for organization
    const vendors = await this.prisma.client.vendor.findMany({
      where: { organizationId },
      select: { id: true },
    });

    for (const vendor of vendors) {
      await this.recomputeVendorMetrics(vendor.id);
    }
  }

  /**
   * Convenience method: Recomputes metrics for a specific event
   * Alias for recomputeEventMetrics() - kept for backward compatibility
   * 
   * @param eventId - Event ID
   */
  async recomputeMetricsForEvent(eventId: string) {
    await this.recomputeEventMetrics(eventId);
  }
}


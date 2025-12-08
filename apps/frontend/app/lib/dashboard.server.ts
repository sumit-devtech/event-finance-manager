/**
 * Server-side utilities for dashboard data fetching and transformations
 * All critical calculations happen here (server-side only for security)
 */

import { api } from "~/lib/api";
import type { ApiEvent } from "~/components/dashboard/types";
import { INITIAL_DATA_LIMITS, MONTH_NAMES, CATEGORY_COLORS } from "~/components/dashboard/constants";

/**
 * Fetch events data from API
 * @param token - Authentication token
 * @returns Array of events from API
 */
export async function fetchEventsData(token?: string): Promise<ApiEvent[]> {
  try {
    const events = await api.get<ApiEvent[]>("/events", {
      token: token || undefined,
    });
    return events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Calculate statistics from events array
 * @param events - Array of events
 * @returns Calculated statistics
 */
export function calculateStats(events: ApiEvent[]) {
  const now = new Date();
  
  const upcomingEvents = events
    .filter((e) => e.startDate && new Date(e.startDate) > now)
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    })
    .slice(0, INITIAL_DATA_LIMITS.EVENTS);

  const recentEvents = events
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, INITIAL_DATA_LIMITS.RECENT_EVENTS);

  return {
    totalEvents: events.length,
    activeEvents: events.filter((e) => e.status === "Active").length,
    completedEvents: events.filter((e) => e.status === "Completed").length,
    planningEvents: events.filter((e) => e.status === "Planning").length,
    cancelledEvents: events.filter((e) => e.status === "Cancelled").length,
    totalBudgetItems: events.reduce((sum, e) => sum + e._count.budgetItems, 0),
    upcomingEvents,
    recentEvents,
  };
}

/**
 * Fetch budget items for events and calculate totals
 * @param events - Array of events
 * @param token - Authentication token
 * @returns Events with budget and spent calculated
 */
export async function fetchBudgetData(
  events: ApiEvent[],
  token?: string
): Promise<{
  eventsWithBudget: ApiEvent[];
  budgetData: Array<{ month: string; budget: number; spent: number }>;
  expenseCategories: Array<{ name: string; value: number; color: string }>;
}> {
  let eventsWithBudget = events;
  let budgetData: Array<{ month: string; budget: number; spent: number }> = [];
  let expenseCategories: Array<{ name: string; value: number; color: string }> = [];

  try {
    // Fetch budget items for ALL events in parallel
    const budgetItemsResults = await Promise.allSettled(
      events.map((event) =>
        api
          .get<
            Array<{
              estimatedCost: number | string;
              actualCost: number | string;
              category?: string;
              eventId?: string;
              createdAt?: string;
            }>
          >(`/events/${event.id}/budget-items`, {
            token: token || undefined,
          })
          .catch(() => [])
      )
    );

    // Add budget and spent to each event
    eventsWithBudget = events.map((event, index) => {
      let eventBudget = 0;
      let eventSpent = 0;

      if (
        budgetItemsResults[index]?.status === "fulfilled" &&
        Array.isArray(budgetItemsResults[index].value)
      ) {
        budgetItemsResults[index].value.forEach(
          (item: { estimatedCost: number | string; actualCost: number | string }) => {
            const estimated =
              typeof item.estimatedCost === "number"
                ? item.estimatedCost
                : typeof item.estimatedCost === "string"
                  ? parseFloat(item.estimatedCost)
                  : 0;
            const actual =
              typeof item.actualCost === "number"
                ? item.actualCost
                : typeof item.actualCost === "string"
                  ? parseFloat(item.actualCost)
                  : 0;

            eventBudget += estimated || 0;
            eventSpent += actual || 0;
          }
        );
      }

      return {
        ...event,
        budget: eventBudget,
        spent: eventSpent,
      };
    });

    // Extract all budget items for chart data
    const allBudgetItems: Array<{
      estimatedCost: number | string;
      actualCost: number | string;
      category?: string;
      eventId?: string;
      createdAt?: string;
    }> = [];
    budgetItemsResults.forEach((result) => {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        allBudgetItems.push(...result.value);
      }
    });

    // Fetch expenses for first 5 events only (to limit API calls)
    const eventsToProcess = events.slice(0, 5);
    const expenseResults = await Promise.allSettled(
      eventsToProcess.map((event) =>
        api
          .get<any>(`/events/${event.id}?includeDetails=true`, {
            token: token || undefined,
          })
          .catch(() => null)
      )
    );

    // Extract expenses
    const allExpenses: Array<{ amount: number | string; createdAt?: string }> = [];
    expenseResults.forEach((result) => {
      if (
        result.status === "fulfilled" &&
        result.value?.expenses &&
        Array.isArray(result.value.expenses)
      ) {
        allExpenses.push(...result.value.expenses);
      }
    });

    // Calculate monthly budget/spent data (last 6 months)
    const currentMonth = new Date().getMonth();
    const monthlyData: Record<string, { budget: number; spent: number }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData[MONTH_NAMES[monthIndex]] = { budget: 0, spent: 0 };
    }

    // Aggregate budget items by month
    allBudgetItems.forEach((item) => {
      const event = events.find((e) => item.eventId === e.id);

      let itemDate: Date;
      if (event?.startDate) {
        itemDate = new Date(event.startDate);
      } else if (item.createdAt) {
        itemDate = new Date(item.createdAt);
      } else {
        itemDate = new Date();
      }

      const monthName = MONTH_NAMES[itemDate.getMonth()];
      if (monthlyData[monthName]) {
        const estimated =
          typeof item.estimatedCost === "number"
            ? item.estimatedCost
            : typeof item.estimatedCost === "string"
              ? parseFloat(item.estimatedCost)
              : 0;
        monthlyData[monthName].budget += estimated || 0;
      } else {
        const currentMonthName = MONTH_NAMES[currentMonth];
        const estimated =
          typeof item.estimatedCost === "number"
            ? item.estimatedCost
            : typeof item.estimatedCost === "string"
              ? parseFloat(item.estimatedCost)
              : 0;
        monthlyData[currentMonthName].budget += estimated || 0;
      }
    });

    // Aggregate expenses by month
    allExpenses.forEach((expense) => {
      const expenseDate = expense.createdAt ? new Date(expense.createdAt) : new Date();
      const monthName = MONTH_NAMES[expenseDate.getMonth()];
      if (monthlyData[monthName]) {
        const amount =
          typeof expense.amount === "number"
            ? expense.amount
            : typeof expense.amount === "string"
              ? parseFloat(expense.amount)
              : 0;
        monthlyData[monthName].spent += amount || 0;
      } else {
        const currentMonthName = MONTH_NAMES[currentMonth];
        const amount =
          typeof expense.amount === "number"
            ? expense.amount
            : typeof expense.amount === "string"
              ? parseFloat(expense.amount)
              : 0;
        monthlyData[currentMonthName].spent += amount || 0;
      }
    });

    // Convert to array format
    budgetData = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, budget: data.budget || 0, spent: data.spent || 0 }))
      .sort((a, b) => {
        return MONTH_NAMES.indexOf(a.month as typeof MONTH_NAMES[number]) - MONTH_NAMES.indexOf(b.month as typeof MONTH_NAMES[number]);
      });

    // Calculate expense categories
    const categoryTotals: Record<string, number> = {};

    allBudgetItems.forEach((item) => {
      const category = item.category || "Miscellaneous";
      const estimated =
        typeof item.estimatedCost === "number"
          ? item.estimatedCost
          : typeof item.estimatedCost === "string"
            ? parseFloat(item.estimatedCost)
            : 0;

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += estimated || 0;
    });

    allExpenses.forEach((expense) => {
      const category = "Miscellaneous";
      const amount =
        typeof expense.amount === "number"
          ? expense.amount
          : typeof expense.amount === "string"
            ? parseFloat(expense.amount)
            : 0;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    });

    const totalBudget = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    if (totalBudget > 0) {
      expenseCategories = Object.entries(categoryTotals)
        .map(([name, value]) => ({
          name,
          value: Math.round((value / totalBudget) * 100),
          color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Miscellaneous,
        }))
        .sort((a, b) => b.value - a.value);
    }
  } catch (err) {
    console.warn("Could not fetch budget/expense data for charts:", err);
  }

  return { eventsWithBudget, budgetData, expenseCategories };
}

/**
 * Fetch alerts based on events and expenses
 * @param events - Array of events with budget data
 * @param token - Authentication token
 * @returns Array of alerts
 */
export async function fetchAlerts(
  events: ApiEvent[],
  token?: string
): Promise<
  Array<{
    id: string;
    type: string;
    message: string;
    count?: number;
    urgent: boolean;
    details?: string;
  }>
> {
  const alerts: Array<{
    id: string;
    type: string;
    message: string;
    count?: number;
    urgent: boolean;
    details?: string;
  }> = [];

  // 1. Pending expense approvals
  try {
    const allExpensesForAlerts: Array<{ status: string; amount: number | string }> = [];
    const expenseResultsForAlerts = await Promise.allSettled(
      events.slice(0, 10).map((event) =>
        api
          .get<any>(`/events/${event.id}?includeDetails=true`, {
            token: token || undefined,
          })
          .catch(() => null)
      )
    );

    expenseResultsForAlerts.forEach((result) => {
      if (
        result.status === "fulfilled" &&
        result.value?.expenses &&
        Array.isArray(result.value.expenses)
      ) {
        allExpensesForAlerts.push(...result.value.expenses);
      }
    });

    const pendingExpenses = allExpensesForAlerts.filter(
      (expense) => expense.status === "Pending"
    );
    if (pendingExpenses.length > 0) {
      alerts.push({
        id: "pending-expenses",
        type: "approval",
        message: `${pendingExpenses.length} expense approval${pendingExpenses.length > 1 ? "s" : ""} pending`,
        count: pendingExpenses.length,
        urgent: pendingExpenses.length >= 3,
      });
    }
  } catch (err) {
    console.warn("Could not fetch expenses for alerts:", err);
  }

  // 2. Events over budget
  events.forEach((event) => {
    const budget = event.budget || 0;
    const spent = event.spent || 0;
    if (budget > 0 && spent > budget) {
      const percentage = Math.round((spent / budget) * 100);
      alerts.push({
        id: `over-budget-${event.id}`,
        type: "overspending",
        message: `${event.name} is ${percentage}% over budget`,
        count: 1,
        urgent: percentage > 90,
      });
    }
  });

  // 3. Fetch notifications from API
  try {
    const notifications = await api.get<Array<{ type: string; title: string; message: string | null }>>("/notifications?read=false", {
      token: token || undefined,
    });

    if (Array.isArray(notifications) && notifications.length > 0) {
      const errorNotifications = notifications.filter((n) => n.type === "Error");
      const warningNotifications = notifications.filter((n) => n.type === "Warning");

      if (errorNotifications.length > 0) {
        const firstNotification = errorNotifications[0];
        alerts.push({
          id: "notifications-error",
          type: "notification",
          message: `${errorNotifications.length} urgent notification${errorNotifications.length > 1 ? "s" : ""}`,
          count: errorNotifications.length,
          urgent: true,
          details: firstNotification.title || firstNotification.message || undefined,
        });
      }

      if (warningNotifications.length > 0 && errorNotifications.length === 0) {
        const firstNotification = warningNotifications[0];
        alerts.push({
          id: "notifications-warning",
          type: "notification",
          message: `${warningNotifications.length} notification${warningNotifications.length > 1 ? "s" : ""} require attention`,
          count: warningNotifications.length,
          urgent: false,
          details: firstNotification.title || firstNotification.message || undefined,
        });
      }
    }
  } catch (err) {
    console.warn("Could not fetch notifications:", err);
  }

  // Limit alerts to top 5 for performance
  return alerts.slice(0, INITIAL_DATA_LIMITS.ALERTS);
}


import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import type { User } from "~/lib/auth";
import { Dashboard } from "~/components/Dashboard";
import { demoDashboardEvents, demoDashboardBudgetData, demoDashboardExpenseCategories, demoDashboardAlerts } from "~/lib/demoData";

interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  budget?: number;
  spent?: number;
  _count: {
    files: number;
    budgetItems: number;
    activityLogs: number;
  };
}

interface LoaderData {
  user: User;
  events: Event[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    planningEvents: number;
    cancelledEvents: number;
    totalBudgetItems: number;
    upcomingEvents: Event[];
    recentEvents: Event[];
  };
  budgetData: Array<{ month: string; budget: number; spent: number }>;
  expenseCategories: Array<{ name: string; value: number; color: string }>;
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    count?: number;
    urgent: boolean;
  }>;
}

/**
 * Loader - fetch dashboard data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user (components handle null user)
  if (isDemo) {
    const now = new Date();
    const upcomingEvents = demoDashboardEvents
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5);

    const recentEvents = demoDashboardEvents
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);

    return json<LoaderData>({
      user: null as any, // null user in demo mode
      events: demoDashboardEvents,
      stats: {
        totalEvents: 12,
        activeEvents: 6,
        completedEvents: 3,
        planningEvents: 3,
        cancelledEvents: 0,
        totalBudgetItems: 120,
        upcomingEvents,
        recentEvents,
      },
      budgetData: demoDashboardBudgetData,
      expenseCategories: demoDashboardExpenseCategories,
      alerts: demoDashboardAlerts,
    });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch all events for statistics
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
    });

    const now = new Date();
    const upcomingEvents = events
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5);

    const recentEvents = events
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);

    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter((e) => e.status === "Active").length,
      completedEvents: events.filter((e) => e.status === "Completed").length,
      planningEvents: events.filter((e) => e.status === "Planning").length,
      cancelledEvents: events.filter((e) => e.status === "Cancelled").length,
      totalBudgetItems: events.reduce((sum, e) => sum + e._count.budgetItems, 0),
      upcomingEvents,
      recentEvents,
    };

    // Fetch budget items for ALL events to calculate totals
    let budgetData: Array<{ month: string; budget: number; spent: number }> = [];
    let expenseCategories: Array<{ name: string; value: number; color: string }> = [];
    let eventsWithBudget = events; // Default to events without budget if fetch fails
    let alerts: Array<{ id: string; type: string; message: string; count?: number; urgent: boolean }> = [];
    
    // Initialize alerts array to ensure it's always defined

    try {
      // Fetch budget items for ALL events in parallel to calculate totals
      const budgetItemsResults = await Promise.allSettled(
        events.map((event) =>
          api.get<Array<{ estimatedCost: number | string; actualCost: number | string; category?: string; eventId?: string; createdAt?: string }>>(`/events/${event.id}/budget-items`, {
            token: token || undefined,
          }).catch((err) => {
            console.warn(`Could not fetch budget items for event ${event.id}:`, err);
            return [];
          })
        )
      );

      // Add budget and spent to each event for Dashboard component
      eventsWithBudget = events.map((event, index) => {
        let eventBudget = 0;
        let eventSpent = 0;
        
        if (budgetItemsResults[index]?.status === 'fulfilled' && Array.isArray(budgetItemsResults[index].value)) {
          budgetItemsResults[index].value.forEach((item: { estimatedCost: number | string; actualCost: number | string }) => {
            // Handle Decimal type conversion
            const estimated = typeof item.estimatedCost === 'number' ? item.estimatedCost : 
                             (typeof item.estimatedCost === 'string' ? parseFloat(item.estimatedCost) : 0);
            const actual = typeof item.actualCost === 'number' ? item.actualCost : 
                          (typeof item.actualCost === 'string' ? parseFloat(item.actualCost) : 0);
            
            eventBudget += estimated || 0;
            eventSpent += actual || 0;
          });
        }
        
        return {
          ...event,
          budget: eventBudget,
          spent: eventSpent,
        };
      });

      // Extract budget items for chart data (from ALL events - we already fetched them)
      const allBudgetItems: Array<{ estimatedCost: number | string; actualCost: number | string; category?: string; eventId?: string; createdAt?: string }> = [];
      budgetItemsResults.forEach((result) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allBudgetItems.push(...result.value);
        }
      });

      // For expenses, limit to first 5 events to avoid too many API calls
      const eventsToProcess = events.slice(0, 5);
      
      // Fetch expenses for chart data (only for first 5 events)
      const expenseResults = await Promise.allSettled(
        eventsToProcess.map((event) =>
          api.get<any>(`/events/${event.id}?includeDetails=true`, {
            token: token || undefined,
          }).catch((err) => {
            console.warn(`Could not fetch event details for ${event.id}:`, err);
            return null;
          })
        )
      );

      // Extract expenses
      const allExpenses: Array<{ amount: number | string; createdAt?: string }> = [];
      expenseResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.expenses && Array.isArray(result.value.expenses)) {
          allExpenses.push(...result.value.expenses);
        }
      });

      // Calculate monthly budget/spent data (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const monthlyData: Record<string, { budget: number; spent: number }> = {};

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        monthlyData[months[monthIndex]] = { budget: 0, spent: 0 };
      }

      // Aggregate budget items by month (use event startDate if available, otherwise createdAt)
      allBudgetItems.forEach((item) => {
        // Find the event this budget item belongs to
        const event = events.find((e) => {
          // Check if item has eventId or if we can match by event detail
          return item.eventId === e.id;
        });
        
        // Use event startDate if available, otherwise use item createdAt, otherwise current date
        let itemDate: Date;
        if (event?.startDate) {
          itemDate = new Date(event.startDate);
        } else if (item.createdAt) {
          itemDate = new Date(item.createdAt);
        } else {
          itemDate = new Date();
        }
        
        const monthName = months[itemDate.getMonth()];
        // Include data even if it's outside the last 6 months (we'll include it in the nearest month)
        // But prioritize months in our initialized range
        if (monthlyData[monthName]) {
          // Handle Decimal type conversion
          const estimated = typeof item.estimatedCost === 'number' ? item.estimatedCost : 
                           (typeof item.estimatedCost === 'string' ? parseFloat(item.estimatedCost) : 0);
          monthlyData[monthName].budget += estimated || 0;
        } else {
          // If the month is not in our initialized range, add it to the current month
          const currentMonthName = months[currentMonth];
          const estimated = typeof item.estimatedCost === 'number' ? item.estimatedCost : 
                           (typeof item.estimatedCost === 'string' ? parseFloat(item.estimatedCost) : 0);
          monthlyData[currentMonthName].budget += estimated || 0;
        }
      });

      // Aggregate expenses by month (Expense model has createdAt, not date)
      allExpenses.forEach((expense) => {
        // Expense model doesn't have 'date' field, use createdAt instead
        const expenseDate = expense.createdAt ? new Date(expense.createdAt) : new Date();
        const monthName = months[expenseDate.getMonth()];
        // Include data even if it's outside the last 6 months
        if (monthlyData[monthName]) {
          // Handle Decimal type conversion
          const amount = typeof expense.amount === 'number' ? expense.amount : 
                        (typeof expense.amount === 'string' ? parseFloat(expense.amount) : 0);
          monthlyData[monthName].spent += amount || 0;
        } else {
          // If the month is not in our initialized range, add it to the current month
          const currentMonthName = months[currentMonth];
          const amount = typeof expense.amount === 'number' ? expense.amount : 
                        (typeof expense.amount === 'string' ? parseFloat(expense.amount) : 0);
          monthlyData[currentMonthName].spent += amount || 0;
        }
      });

      // Convert to array format - include all months even if they have 0 values
      // This ensures the chart always shows the time period
      budgetData = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, budget: data.budget || 0, spent: data.spent || 0 }))
        .sort((a, b) => {
          // Sort by month order (Jan, Feb, Mar, etc.)
          const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });

      // Calculate budget overview by category (using actual budget items)
      const categoryTotals: Record<string, number> = {};
      const categoryColors: Record<string, string> = {
        'Venue': '#3b82f6',
        'Catering': '#10b981',
        'Marketing': '#f59e0b',
        'Entertainment': '#8b5cf6',
        'Logistics': '#ef4444',
        'StaffTravel': '#8b5cf6',
        'Miscellaneous': '#6b7280',
      };

      // Aggregate budget items by category (use estimatedCost for budget allocation)
      allBudgetItems.forEach((item) => {
        const category = item.category || 'Miscellaneous';
        const estimated = typeof item.estimatedCost === 'number' ? item.estimatedCost : 
                         (typeof item.estimatedCost === 'string' ? parseFloat(item.estimatedCost) : 0);
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += estimated || 0;
      });

      // Also add expenses by category (if we can link them to budget items)
      // For now, expenses are added to Miscellaneous since they don't have category
      allExpenses.forEach((expense) => {
        const category = 'Miscellaneous'; // Expenses don't have category field
        const amount = typeof expense.amount === 'number' ? expense.amount : 
                      (typeof expense.amount === 'string' ? parseFloat(expense.amount) : 0);
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
            color: categoryColors[name] || '#6b7280',
          }))
          .sort((a, b) => b.value - a.value);
      }

    } catch (err) {
      console.warn("Could not fetch budget/expense data for charts:", err);
      // Use empty arrays if fetch fails
    }

    // Calculate alerts based on actual data (outside try block so it always runs)
    // 1. Pending expense approvals
    try {
      // Fetch expenses for all events to check for pending approvals
      const allExpensesForAlerts: Array<{ status: string; amount: number | string }> = [];
      const expenseResultsForAlerts = await Promise.allSettled(
        events.slice(0, 10).map((event) =>
          api.get<any>(`/events/${event.id}?includeDetails=true`, {
            token: token || undefined,
          }).catch(() => null)
        )
      );
      
      expenseResultsForAlerts.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.expenses && Array.isArray(result.value.expenses)) {
          allExpensesForAlerts.push(...result.value.expenses);
        }
      });

      const pendingExpenses = allExpensesForAlerts.filter((expense) => expense.status === 'Pending');
      if (pendingExpenses.length > 0) {
        alerts.push({
          id: 'pending-expenses',
          type: 'approval',
          message: `${pendingExpenses.length} expense approval${pendingExpenses.length > 1 ? 's' : ''} pending`,
          count: pendingExpenses.length,
          urgent: pendingExpenses.length >= 3,
        });
      }
    } catch (err) {
      console.warn("Could not fetch expenses for alerts:", err);
    }

    // 2. Events over budget (spent > budget)
    eventsWithBudget.forEach((event) => {
      const budget = event.budget || 0;
      const spent = event.spent || 0;
      if (budget > 0 && spent > budget) {
        const percentage = Math.round((spent / budget) * 100);
        alerts.push({
          id: `over-budget-${event.id}`,
          type: 'overspending',
          message: `${event.name} is ${percentage}% over budget`,
          count: 1,
          urgent: percentage > 90,
        });
      }
    });

    // 3. Fetch notifications from API
    try {
      const notifications = await api.get<Array<{ type: string }>>("/notifications?read=false", {
        token: token || undefined,
      });
      
      if (Array.isArray(notifications) && notifications.length > 0) {
        // Group notifications by type
        const errorNotifications = notifications.filter((n) => n.type === 'Error');
        const warningNotifications = notifications.filter((n) => n.type === 'Warning');
        
        if (errorNotifications.length > 0) {
          alerts.push({
            id: 'notifications-error',
            type: 'notification',
            message: `${errorNotifications.length} urgent notification${errorNotifications.length > 1 ? 's' : ''}`,
            count: errorNotifications.length,
            urgent: true,
          });
        }
        
        if (warningNotifications.length > 0 && errorNotifications.length === 0) {
          alerts.push({
            id: 'notifications-warning',
            type: 'notification',
            message: `${warningNotifications.length} notification${warningNotifications.length > 1 ? 's' : ''} require attention`,
            count: warningNotifications.length,
            urgent: false,
          });
        }
      }
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
      // Continue without notifications
    }

    return json<LoaderData>({ 
      user, 
      events: eventsWithBudget || events || [], 
      stats,
      budgetData,
      expenseCategories,
      alerts,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching dashboard data:", errorMessage);
    return json<LoaderData>({
      user,
      events: [],
      stats: {
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        planningEvents: 0,
        cancelledEvents: 0,
        totalBudgetItems: 0,
        upcomingEvents: [],
        recentEvents: [],
      },
      budgetData: [],
      expenseCategories: [],
      alerts: [],
    });
  }
}

export default function DashboardRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  // Transform events to DashboardEvent format with progress calculation
  const dashboardEvents = (loaderData.events as unknown as Event[]).map((event) => ({
    id: event.id,
    name: event.name,
    status: event.status,
    budget: event.budget || 0,
    spent: event.spent || 0,
    progress: event.budget && event.budget > 0 
      ? Math.min(100, Math.round((event.spent || 0) / event.budget * 100))
      : 0,
  }));

  // Transform stats to include DashboardEvent[] for upcomingEvents and recentEvents
  const dashboardStats = {
    ...loaderData.stats,
    upcomingEvents: (loaderData.stats.upcomingEvents as unknown as Event[]).map((event) => ({
      id: event.id,
      name: event.name,
      status: event.status,
      budget: event.budget || 0,
      spent: event.spent || 0,
      progress: event.budget && event.budget > 0 
        ? Math.min(100, Math.round((event.spent || 0) / event.budget * 100))
        : 0,
    })),
    recentEvents: (loaderData.stats.recentEvents as unknown as Event[]).map((event) => ({
      id: event.id,
      name: event.name,
      status: event.status,
      budget: event.budget || 0,
      spent: event.spent || 0,
      progress: event.budget && event.budget > 0 
        ? Math.min(100, Math.round((event.spent || 0) / event.budget * 100))
        : 0,
    })),
  };

  return <Dashboard 
    user={loaderData.user} 
    events={dashboardEvents} 
    stats={dashboardStats} 
    budgetData={loaderData.budgetData}
    expenseCategories={loaderData.expenseCategories}
    alerts={loaderData.alerts}
    isDemo={isDemo} 
  />;
}

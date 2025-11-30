import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { Dashboard } from "~/components/Dashboard";

interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
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
    const demoEvents: Event[] = [
      {
        id: '1',
        name: 'Annual Tech Conference 2024',
        description: 'Annual technology conference featuring keynote speakers and workshops',
        client: 'Tech Corp',
        status: 'Active',
        startDate: '2024-03-15',
        endDate: '2024-03-17',
        createdAt: '2024-01-15',
        _count: { files: 5, budgetItems: 12, activityLogs: 8 },
      },
      {
        id: '2',
        name: 'Product Launch Event',
        description: 'Launching our new product line with media and influencers',
        client: 'Product Inc',
        status: 'Planning',
        startDate: '2024-03-20',
        endDate: null,
        createdAt: '2024-02-01',
        _count: { files: 2, budgetItems: 8, activityLogs: 3 },
      },
      {
        id: '3',
        name: 'Annual Gala',
        description: 'Annual company gala with dinner and entertainment',
        client: 'Gala Corp',
        status: 'Active',
        startDate: '2024-02-28',
        endDate: '2024-02-28',
        createdAt: '2024-01-10',
        _count: { files: 8, budgetItems: 15, activityLogs: 12 },
      },
      {
        id: '4',
        name: 'Workshop Series',
        description: 'Educational workshop series for team development',
        client: 'Workshop Co',
        status: 'Completed',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        createdAt: '2023-12-15',
        _count: { files: 4, budgetItems: 10, activityLogs: 6 },
      },
      {
        id: '5',
        name: 'Summer Networking Mixer',
        description: 'Networking event for industry professionals',
        client: 'Network Pro',
        status: 'Planning',
        startDate: '2024-06-15',
        endDate: null,
        createdAt: '2024-02-20',
        _count: { files: 1, budgetItems: 5, activityLogs: 2 },
      },
      {
        id: '6',
        name: 'Holiday Party 2023',
        description: 'Annual holiday celebration for employees',
        client: 'Holiday Events',
        status: 'Completed',
        startDate: '2023-12-15',
        endDate: '2023-12-15',
        createdAt: '2023-11-01',
        _count: { files: 6, budgetItems: 9, activityLogs: 7 },
      },
      {
        id: '7',
        name: 'Client Appreciation Dinner',
        description: 'Exclusive dinner for top clients',
        client: 'Client Relations',
        status: 'Active',
        startDate: '2024-04-10',
        endDate: '2024-04-10',
        createdAt: '2024-02-15',
        _count: { files: 3, budgetItems: 7, activityLogs: 4 },
      },
      {
        id: '8',
        name: 'Training Seminar',
        description: 'Professional development training session',
        client: 'Training Solutions',
        status: 'Active',
        startDate: '2024-03-25',
        endDate: '2024-03-25',
        createdAt: '2024-02-05',
        _count: { files: 2, budgetItems: 6, activityLogs: 3 },
      },
      {
        id: '9',
        name: 'Charity Fundraiser',
        description: 'Annual charity fundraising event',
        client: 'Charity Foundation',
        status: 'Planning',
        startDate: '2024-05-20',
        endDate: '2024-05-20',
        createdAt: '2024-03-01',
        _count: { files: 4, budgetItems: 11, activityLogs: 5 },
      },
      {
        id: '10',
        name: 'Industry Summit',
        description: 'Multi-day industry summit with panels and networking',
        client: 'Summit Organizers',
        status: 'Active',
        startDate: '2024-04-05',
        endDate: '2024-04-07',
        createdAt: '2024-01-20',
        _count: { files: 7, budgetItems: 18, activityLogs: 10 },
      },
      {
        id: '11',
        name: 'Team Offsite',
        description: 'Quarterly team offsite meeting',
        client: 'Internal',
        status: 'Completed',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        createdAt: '2023-12-01',
        _count: { files: 3, budgetItems: 8, activityLogs: 4 },
      },
      {
        id: '12',
        name: 'Marketing Campaign Launch',
        description: 'Launch event for new marketing campaign',
        client: 'Marketing Dept',
        status: 'Active',
        startDate: '2024-03-30',
        endDate: null,
        createdAt: '2024-02-10',
        _count: { files: 5, budgetItems: 9, activityLogs: 6 },
      },
    ];

    const now = new Date();
    const upcomingEvents = demoEvents
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5);

    const recentEvents = demoEvents
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);

    return json<LoaderData>({
      user: null as any, // null user in demo mode
      events: demoEvents,
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
      budgetData: [
        { month: 'Jan', budget: 45000, spent: 42000 },
        { month: 'Feb', budget: 52000, spent: 48000 },
        { month: 'Mar', budget: 48000, spent: 51000 },
        { month: 'Apr', budget: 61000, spent: 58000 },
        { month: 'May', budget: 55000, spent: 52000 },
        { month: 'Jun', budget: 67000, spent: 63000 },
      ],
      expenseCategories: [
        { name: 'Venue', value: 35, color: '#3b82f6' },
        { name: 'Catering', value: 28, color: '#10b981' },
        { name: 'Marketing', value: 18, color: '#f59e0b' },
        { name: 'Entertainment', value: 12, color: '#8b5cf6' },
        { name: 'Other', value: 7, color: '#6b7280' },
      ],
      alerts: [
        { id: '1', type: 'approval', message: '3 expense approvals pending', count: 3, urgent: true },
        { id: '2', type: 'overspending', message: 'Annual Gala is 92% over budget', count: 1, urgent: true },
        { id: '3', type: 'document', message: '2 events missing required documents', count: 2, urgent: false },
      ],
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
          api.get<any[]>(`/events/${event.id}/budget-items`, {
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
          budgetItemsResults[index].value.forEach((item: any) => {
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
      const allBudgetItems: any[] = [];
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
      const allExpenses: any[] = [];
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
        const event = events.find((e: any) => {
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
      const allExpensesForAlerts: any[] = [];
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

      const pendingExpenses = allExpensesForAlerts.filter((expense: any) => expense.status === 'Pending');
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
    eventsWithBudget.forEach((event: any) => {
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
      const notifications = await api.get<any[]>("/notifications?read=false", {
        token: token || undefined,
      });
      
      if (Array.isArray(notifications) && notifications.length > 0) {
        // Group notifications by type
        const errorNotifications = notifications.filter((n: any) => n.type === 'Error');
        const warningNotifications = notifications.filter((n: any) => n.type === 'Warning');
        
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
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
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
  const { user, events, stats, budgetData, expenseCategories, alerts } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return <Dashboard 
    user={user} 
    events={events} 
    stats={stats} 
    budgetData={budgetData}
    expenseCategories={expenseCategories}
    alerts={alerts}
    isDemo={isDemo} 
  />;
}

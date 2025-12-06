/**
 * Type definitions for dashboard components
 * All types are documented for easy understanding
 */

import type { User } from "~/lib/auth";

/**
 * Dashboard event with calculated progress
 */
export interface DashboardEvent {
  id?: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  progress: number;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  planningEvents: number;
  cancelledEvents: number;
  totalBudgetItems: number;
  upcomingEvents: DashboardEvent[];
  recentEvents: DashboardEvent[];
}

/**
 * Budget data point for charts
 */
export interface BudgetDataPoint {
  month: string;
  budget: number;
  spent: number;
}

/**
 * Expense category for pie chart
 */
export interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

/**
 * Dashboard alert/notification
 */
export interface DashboardAlert {
  id: string;
  type: string;
  message: string;
  count?: number;
  urgent: boolean;
}

/**
 * Budget status information
 */
export interface BudgetStatus {
  bg: string;
  border: string;
  text: string;
  indicator: string;
  label: string;
}

/**
 * Budget totals calculation result
 */
export interface BudgetTotals {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationPercentage: number;
  status: BudgetStatus;
}

/**
 * Dashboard component props
 */
export interface DashboardProps {
  user: User | null;
  organization?: { name?: string; industry?: string; members?: unknown[] } | null;
  events: DashboardEvent[];
  stats: DashboardStats;
  budgetData?: BudgetDataPoint[];
  expenseCategories?: ExpenseCategory[];
  alerts?: DashboardAlert[];
  isDemo?: boolean;
}

/**
 * Event from API before transformation
 */
export interface ApiEvent {
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


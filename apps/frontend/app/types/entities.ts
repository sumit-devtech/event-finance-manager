import type { ReactNode } from "react";
import type {
  UserRole,
  EventStatus,
  BudgetItemCategory,
  ExpenseStatus,
} from "@event-finance-manager/database";

// Define enum types locally (these match the Prisma schema enums)
export type BudgetItemStatus = 'Pending' | 'Approved' | 'Closed';
export type BudgetStatus = 'Draft' | 'Review' | 'Approved';

// Base entity types from Prisma
export type {
  User,
  Event,
  Vendor,
  Expense,
  BudgetItem,
  EventStakeholder,
  ActivityLog,
  Notification,
  EventAssignment,
  VendorEvent,
} from "@event-finance-manager/database";

// StrategicGoal type - define locally until package exports are fixed
export interface StrategicGoal {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  deadline: Date | null;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended Vendor type with computed stats
export interface VendorWithStats {
  id: string;
  name: string;
  serviceType: string | null;
  category?: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  gstNumber: string | null;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
  totalSpent?: number;
  totalContracts?: number;
  eventsCount?: number;
  lastContract?: Date | null;
}

// Extended Event type with computed fields
export interface EventWithDetails {
  id: string;
  name: string;
  date: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  status: EventStatus;
  budgetStatus?: BudgetStatus;
  budget: number | null;
  spent?: number;
  roiPercent?: number | null;
  managerId: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;
  type?: string | null;
  eventType?: string | null;
  expectedAttendees?: number | null;
  actualAttendees?: number | null;
  budgetItems?: BudgetItemWithRelations[];
  attendees?: number | null;
  venue?: string | null;
  organizer?: string | null;
  owner?: string | null;
  region?: string | null;
  roi?: number | null;
  strategicGoals?: StrategicGoalType[];
  files?: Array<{
    id: string;
    name: string;
    type: string;
    size?: number;
    uploadedAt: string;
    uploadedBy?: string;
    url?: string;
  }>;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    tags?: string[];
  }>;
}

// Extended User type with counts
export interface UserWithCounts {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  eventsCount?: number;
  assignmentsCount?: number;
}

// Extended Expense type with vendor info
export interface ExpenseWithVendor {
  id: string;
  eventId: string;
  category: BudgetItemCategory | null;
  budgetItemId: string | null;
  vendor: string | null;
  vendorId: string | null;
  title: string;
  amount: number;
  description?: string | null;
  status: ExpenseStatus;
  createdBy?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  vendorName?: string | null;
  event?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    fullName?: string;
    email?: string;
  };
}

// Extended BudgetItem type with relations
export interface BudgetItemWithRelations {
  id: string;
  eventId: string;
  category: BudgetItemCategory;
  subcategory: string | null;
  description: string;
  vendor: string | null;
  vendorId: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  status: BudgetItemStatus;
  notes: string | null;
  assignedUserId: string | null;
  strategicGoalId: string | null;
  lastEditedBy: string | null;
  lastEditedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  vendorName?: string | null;
  assignedUserName?: string | null;
  strategicGoalTitle?: string | null;
}

// Strategic Goal type
export interface StrategicGoalType {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  deadline: Date | null;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event Stakeholder type
export interface EventStakeholderType {
  id: string;
  eventId: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log type
export interface ActivityLogType {
  id: string;
  userId: string | null;
  eventId: string | null;
  action: string;
  details: string | null;
  createdAt: Date;
}

// Notification entity type
export interface NotificationEntity {
  id: string;
  userId: string | null;
  eventId: string | null;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  createdAt: Date;
}


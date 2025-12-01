// API Response types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// DTO types for API requests

export interface CreateVendorDto {
  name: string;
  serviceType?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  rating?: number;
}

export interface UpdateVendorDto {
  name?: string;
  serviceType?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  rating?: number;
}

export interface CreateEventDto {
  name: string;
  date?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  location?: string;
  status?: string;
  budget?: number;
  managerId?: string;
  description?: string;
  type?: string;
  expectedAttendees?: number;
}

export interface UpdateEventDto {
  name?: string;
  date?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  location?: string;
  status?: string;
  budget?: number;
  managerId?: string;
  description?: string;
  type?: string;
  expectedAttendees?: number;
  actualAttendees?: number;
}

export interface CreateExpenseDto {
  eventId: string;
  category?: string;
  budgetItemId?: string;
  vendor?: string;
  vendorId?: string;
  title: string;
  amount: number;
  description?: string;
}

export interface UpdateExpenseDto {
  category?: string;
  budgetItemId?: string;
  vendor?: string;
  vendorId?: string;
  title?: string;
  amount?: number;
  description?: string;
  status?: string;
}

export interface CreateBudgetItemDto {
  eventId: string;
  category: string;
  subcategory?: string;
  description: string;
  vendor?: string;
  vendorId?: string;
  estimatedCost?: number;
  actualCost?: number;
  status?: string;
  notes?: string;
  assignedUserId?: string;
  strategicGoalId?: string;
}

export interface UpdateBudgetItemDto {
  category?: string;
  subcategory?: string;
  description?: string;
  vendor?: string;
  vendorId?: string;
  estimatedCost?: number;
  actualCost?: number;
  status?: string;
  notes?: string;
  assignedUserId?: string;
  strategicGoalId?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
}



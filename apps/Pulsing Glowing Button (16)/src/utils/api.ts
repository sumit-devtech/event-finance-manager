import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3dd0a4ac`;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Organizations
export const organizationsAPI = {
  create: (data: any) => request('/organizations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  get: (id: string) => request(`/organizations/${id}`),
  
  getMembers: (id: string) => request(`/organizations/${id}/members`),
};

// Events
export const eventsAPI = {
  create: (data: any) => request('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  list: (organizationId?: string) => {
    const query = organizationId ? `?organizationId=${organizationId}` : '';
    return request(`/events${query}`);
  },
  
  get: (id: string) => request(`/events/${id}`),
  
  update: (id: string, data: any) => request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => request(`/events/${id}`, {
    method: 'DELETE',
  }),
};

// Budgets
export const budgetsAPI = {
  create: (data: any) => request('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  listByEvent: (eventId: string) => request(`/events/${eventId}/budgets`),
};

// Budget Lines
export const budgetLinesAPI = {
  create: (data: any) => request('/budget-lines', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  listByBudget: (budgetId: string) => request(`/budgets/${budgetId}/lines`),
};

// Expenses
export const expensesAPI = {
  create: (data: any) => request('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  listByEvent: (eventId: string) => request(`/events/${eventId}/expenses`),
  
  approve: (id: string) => request(`/expenses/${id}/approve`, {
    method: 'PUT',
  }),
  
  reject: (id: string, reason: string) => request(`/expenses/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
};

// Vendors
export const vendorsAPI = {
  create: (data: any) => request('/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  list: (organizationId?: string) => {
    const query = organizationId ? `?organizationId=${organizationId}` : '';
    return request(`/vendors${query}`);
  },
};

// Profile
export const profileAPI = {
  get: () => request('/profile'),
  
  update: (data: any) => request('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Health check
export const healthCheck = () => request('/health');

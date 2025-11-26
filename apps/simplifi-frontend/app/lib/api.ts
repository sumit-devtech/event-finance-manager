/**
 * API Client Utility
 * 
 * This module provides a centralized API client for making requests to the backend-simplifi API.
 * All data access must go through Remix loaders/actions → NestJS API → Database.
 */

import { env } from "./env";

const API_BASE_URL = env.API_BASE_URL;

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Build URL with query parameters
 */
function buildUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, params, ...fetchOptions } = options;

  const url = buildUrl(`${API_BASE_URL}${endpoint}`, params);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`;
      let errorData: ApiError | null = null;

      try {
        errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }

      throw new ApiClientError(
        response.status,
        errorMessage,
        errorData?.error,
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return null as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network errors
    throw new ApiClientError(
      0,
      error instanceof Error ? error.message : "Network error occurred",
    );
  }
}

/**
 * API Client with common HTTP methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "GET",
    });
  },

  /**
   * POST request
   */
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  },

  /**
   * Upload file request
   */
  upload: async <T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    options?: RequestOptions,
  ): Promise<T> => {
    const { token, params, ...fetchOptions } = options || {};
    const url = buildUrl(`${API_BASE_URL}${endpoint}`, params);

    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      throw new ApiClientError(response.status, errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return null as T;
  },
};

/**
 * Helper to get auth token from Remix request (server-side)
 */
export function getAuthTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  // Parse cookies - implement based on your cookie strategy
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [name, ...rest] = cookie.split("=");
      return [name, rest.join("=")];
    }),
  );

  return cookies.auth_token || cookies.accessToken || null;
}


import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { ApiClientError } from "~/lib/api";

/**
 * Error Boundary Component
 * 
 * Handles errors in Remix routes and displays appropriate error messages
 */
export function ErrorBoundary() {
  const error = useRouteError();

  // Handle route errors (404, etc.)
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">
            {error.status === 404 ? "Page Not Found" : "Error"}
          </h1>
          <p className="mt-2 text-gray-600 text-center">
            {error.status === 404
              ? "The page you're looking for doesn't exist."
              : error.statusText || "An unexpected error occurred."}
          </p>
          {error.status && (
            <p className="mt-1 text-sm text-gray-500 text-center">
              Status: {error.status}
            </p>
          )}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle API client errors
  if (error instanceof ApiClientError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">
            API Error
          </h1>
          <p className="mt-2 text-gray-600 text-center">{error.message}</p>
          {error.statusCode && (
            <p className="mt-1 text-sm text-gray-500 text-center">
              Status Code: {error.statusCode}
            </p>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle generic errors
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">
          Error
        </h1>
        <p className="mt-2 text-gray-600 text-center">{errorMessage}</p>
        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}


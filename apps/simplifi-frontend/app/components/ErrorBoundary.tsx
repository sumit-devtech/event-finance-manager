import { useRouteError, isRouteErrorResponse } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();

  let status = 500;
  let statusText = "Internal Server Error";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    statusText = error.statusText;
    message = error.data?.message || error.data || statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <html lang="en">
      <head>
        <title>{status} - {statusText}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{status}</h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">{statusText}</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <a
                href="/"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


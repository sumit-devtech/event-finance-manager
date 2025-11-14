import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import type { User } from "~/lib/auth";

/**
 * Protected route loader
 * Uses requireAuth to ensure user is authenticated
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  return json({ user });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>() as { user: User };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Event Finance Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name || user.email}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user.role}
              </span>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Logout
                </button>
              </Form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              You are successfully authenticated as <strong>{user.email}</strong>
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                User Information:
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>ID: {user.id}</li>
                <li>Email: {user.email}</li>
                {user.name && <li>Name: {user.name}</li>}
                <li>Role: {user.role}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


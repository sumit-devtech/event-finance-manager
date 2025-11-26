import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireRole } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireRole(request, ["admin"]);
  const token = await getAuthTokenFromSession(request);

  try {
    const users = await api.get("/users", {
      token: token || undefined,
    });
    return json({ users: users || [] });
  } catch (error: any) {
    return json({ users: [] });
  }
}

export default function Users() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage organization users
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Add User
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {users.map((user: any) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{user.fullName || user.email}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}


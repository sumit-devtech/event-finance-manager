import { useMatches } from "@remix-run/react";
import type { User } from "~/lib/auth";

/**
 * Dashboard route - nested under _protected layout
 * User data comes from parent _protected loader
 */
export default function Dashboard() {
  // Get user data from parent route loader using useMatches
  const matches = useMatches();
  const protectedRouteData = matches.find(
    (match) => match.id === "routes/_protected"
  )?.data as { user: User } | undefined;
  const user = protectedRouteData?.user;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
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
  );
}


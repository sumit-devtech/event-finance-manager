import { useMatches } from "@remix-run/react";
import type { User } from "~/lib/auth";

export default function ReportsPage() {
  const matches = useMatches();
  const protectedRouteData = matches.find(
    (match) => match.id === "routes/_protected"
  )?.data as { user: User } | undefined;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
        <p className="text-gray-600">
          Reports and analytics page coming soon...
        </p>
      </div>
    </div>
  );
}


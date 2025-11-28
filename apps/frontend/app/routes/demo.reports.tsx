import { json, type LoaderFunctionArgs } from "@remix-run/node";

/**
 * Demo Reports Loader - no authentication required
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export default function DemoReportsRoute() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
      <p className="text-gray-600">Demo mode - Reports coming soon</p>
    </div>
  );
}


import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getCurrentUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  if (user) {
    return redirect("/dashboard");
  }
  return json({});
}

export default function Demo() {

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Mode</h1>
          <p className="text-gray-600">
            Try Simplifi without signing up. Explore all features with sample data.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What you can do in Demo Mode:</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Create and manage events
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Plan budgets with line items
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Track expenses and approvals
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              View ROI analytics
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Generate reports
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Demo data is temporary and will be cleared when you close the session.
            Sign up to save your work permanently.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            to="/dashboard"
            className="flex-1 text-center px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 font-medium"
          >
            Start Demo
          </Link>
          <Link
            to="/signup"
            className="flex-1 text-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Sign Up Instead
          </Link>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Demo mode uses sample data. Your changes won't be saved.
          </p>
        </div>
      </div>
    </div>
  );
}


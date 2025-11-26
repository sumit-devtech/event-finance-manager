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

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-indigo-600">Simplifi</div>
          <div className="flex gap-4">
            <Link
              to="/demo"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Demo
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Event Finance Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plan budgets, track expenses, and measure ROI for your events. 
            All in one powerful platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/demo"
              className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold text-lg"
            >
              Try Demo
            </Link>
            <Link
              to="/signup"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Budget Planning</h3>
            <p className="text-gray-600">
              Create and manage budget versions with detailed line items
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">ROI Analytics</h3>
            <p className="text-gray-600">
              Track revenue, costs, and calculate ROI for every event
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Expense Approval</h3>
            <p className="text-gray-600">
              Streamlined approval workflows for expense management
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-indigo-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="mb-6">Choose your plan and start managing events today</p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Header Component
 * 
 * Main application header with logo, navigation, and user profile
 */

import { Link } from "@remix-run/react";
import type { User } from "~/lib/auth";
import { UserProfile } from "~/components/UserProfile";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Simplifi</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/events"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Events
            </Link>
            <Link
              to="/expenses"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Expenses
            </Link>
            <Link
              to="/approvals"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Approvals
            </Link>
            <Link
              to="/reports"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Reports
            </Link>
          </nav>

          {/* User Profile or Auth Links */}
          <div className="flex items-center space-x-4">
            {user.id ? (
              <UserProfile user={user} />
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/demo"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Demo
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


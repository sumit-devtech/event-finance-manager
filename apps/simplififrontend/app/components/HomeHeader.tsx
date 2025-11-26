/**
 * Home Header Component
 * 
 * Header for landing/home page
 */

import { Link } from "@remix-run/react";

export function HomeHeaderComponent() {
  return (
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-xl font-bold text-gray-900">Simplifi</span>
      </Link>

      {/* Auth Links */}
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
    </div>
  );
}


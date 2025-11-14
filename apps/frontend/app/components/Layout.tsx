/**
 * Layout Component
 * 
 * Main application layout with navigation sidebar and header
 */

import { useState } from "react";
import { Outlet } from "@remix-run/react";
import { Navigation } from "./Navigation";
import { UserProfile } from "./UserProfile";
import type { User } from "~/lib/auth";

interface LayoutProps {
  user: User;
}

export function Layout({ user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <Navigation
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Header - Fixed at top */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 flex-shrink-0 relative">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(true);
                }}
                className="lg:hidden p-2 -ml-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 cursor-pointer"
                aria-label="Open menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              
              {/* Desktop title */}
              <div className="hidden lg:flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Event Finance Manager
                </h1>
              </div>
              
              {/* Mobile title */}
              <div className="lg:hidden flex items-center flex-1 justify-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  Event Finance
                </h1>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center relative">
                <UserProfile user={user} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


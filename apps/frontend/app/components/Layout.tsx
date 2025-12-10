/**
 * Layout Component
 * 
 * Main application layout with navigation sidebar and header
 */

import { useState } from "react";
import { Outlet, useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "./Sidebar";
import { UserProfile } from "./UserProfile";
import type { User } from "~/lib/auth";
import { X } from "lucide-react";

interface LayoutProps {
  user: User | null;
}

export function Layout({ user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  // Check if we're in demo mode by checking the demo query parameter
  const isDemo = searchParams.get('demo') === 'true';
  const loaderData = useLoaderData<any>();
  const organization = loaderData?.organization || null;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(142, 76%, 36%)',
              secondary: 'white',
            },
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(142, 76%, 36%)',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'white',
            },
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--destructive))',
            },
          },
        }}
      />
      <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <Sidebar
        user={user}
        organization={organization}
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
        isDemo={isDemo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-yellow-800 text-sm font-medium">
                Demo Mode: You're viewing demo data. Changes won't be saved.
              </span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-yellow-800 hover:text-yellow-900 text-sm font-medium"
            >
              <span>Exit Demo</span>
              <X size={16} />
            </Link>
          </div>
        )}
        
        {/* Header - Fixed at top */}
          <header className="bg-white border-b border-[#E2E2E2] sticky top-0 z-40 flex-shrink-0 relative">
          <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14">
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
                  <h1 className="text-xl font-semibold text-[#1A1A1A]">
                  Event Finance Manager
                </h1>
              </div>
              
              {/* Mobile title */}
              <div className="lg:hidden flex items-center flex-1 justify-center">
                  <h1 className="text-lg font-semibold text-[#1A1A1A]">
                  Event Finance
                </h1>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center relative">
                <UserProfile user={user} isDemo={isDemo} />
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
    </>
  );
}


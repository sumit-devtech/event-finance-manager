/**
 * Navigation Component
 * 
 * Role-based navigation sidebar with menu items for different user roles
 */

import { Link, useLocation } from "@remix-run/react";
import type { User } from "~/lib/auth";

interface NavigationProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "📊",
    roles: ["admin", "eventManager", "finance", "viewer"],
  },
  {
    name: "Events",
    href: "/events",
    icon: "📅",
    roles: ["admin", "eventManager", "finance", "viewer"],
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: "📋",
    roles: ["admin", "eventManager", "finance", "viewer"],
  },
  {
    name: "Approvals",
    href: "/approvals",
    icon: "✅",
    roles: ["admin", "eventManager", "finance"],
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: "💳",
    roles: ["admin", "eventManager", "finance", "viewer"],
  },
  {
    name: "Vendors",
    href: "/vendors",
    icon: "🏢",
    roles: ["admin", "eventManager", "finance"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: "📈",
    roles: ["admin", "eventManager", "finance", "viewer"],
  },
  {
    name: "ROI Analytics",
    href: "/roi",
    icon: "📊",
    roles: ["admin", "eventManager", "finance", "viewer"],
  },
  {
    name: "Insights",
    href: "/insights",
    icon: "💡",
    roles: ["admin", "eventManager", "finance"],
  },
  {
    name: "Subscription",
    href: "/subscription",
    icon: "💎",
    roles: ["admin"],
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: "🔔",
    roles: ["admin", "eventManager", "finance", "viewer"],
  },
  {
    name: "Users",
    href: "/users",
    icon: "👥",
    roles: ["admin"],
  },
  {
    name: "Organizations",
    href: "/organizations",
    icon: "🏛️",
    roles: ["admin"],
  },
];

export function Navigation({ user, isOpen, onClose }: NavigationProps) {
  const location = useLocation();
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role.toLowerCase())
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:fixed
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2"
              onClick={onClose}
            >
              <span className="text-xl font-bold text-indigo-600">
                Simplifi
              </span>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-150
                    ${
                      active
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}


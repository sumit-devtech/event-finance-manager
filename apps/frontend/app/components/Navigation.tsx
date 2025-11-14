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
    roles: ["Admin", "EventManager", "Finance", "Viewer"],
  },
  {
    name: "Events",
    href: "/events",
    icon: "📅",
    roles: ["Admin", "EventManager", "Finance", "Viewer"],
  },
  {
    name: "Budget",
    href: "/budget",
    icon: "💰",
    roles: ["Admin", "EventManager", "Finance", "Viewer"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: "📈",
    roles: ["Admin", "EventManager", "Finance", "Viewer"],
  },
  {
    name: "Users",
    href: "/users",
    icon: "👥",
    roles: ["Admin"],
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: "🔔",
    roles: ["Admin", "EventManager", "Finance", "Viewer"],
  },
];

export function Navigation({ user, isOpen, onClose }: NavigationProps) {
  const location = useLocation();
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
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
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-indigo-600">
                Event Finance
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
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
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      active
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}


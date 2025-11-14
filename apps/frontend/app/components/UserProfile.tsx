/**
 * User Profile Dropdown Component
 * 
 * Displays user information and provides logout functionality
 */

import { Form, Link, useSubmit } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import type { User } from "~/lib/auth";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    // Use a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800";
      case "EventManager":
        return "bg-blue-100 text-blue-800";
      case "Finance":
        return "bg-green-100 text-green-800";
      case "Viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => {
            const newState = !prev;
            return newState;
          });
        }}
        className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer relative z-50"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full text-white text-sm font-medium flex-shrink-0">
          {user.name
            ? user.name.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {user.name || user.email}
          </div>
          <div className="text-xs text-gray-500">{user.role}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 max-w-[calc(100vw-2rem)] z-[100]"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">
              {user.name || user.email}
            </div>
            <div className="text-xs text-gray-500 mt-1">{user.email}</div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Profile Settings
            </Link>
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                // Submit logout form
                const formData = new FormData();
                submit(formData, {
                  method: "post",
                  action: "/logout",
                });
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


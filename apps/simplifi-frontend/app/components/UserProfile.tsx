/**
 * User Profile Component
 * 
 * User profile dropdown with logout functionality
 */

import { useState, useRef, useEffect } from "react";
import { Form } from "@remix-run/react";
import type { User } from "~/lib/auth";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user.fullName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user.fullName || user.email.split("@")[0]}
          </div>
          <div className="text-xs text-gray-500 capitalize">{user.role}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">{user.fullName || "User"}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <div className="text-xs text-gray-500 capitalize mt-1">{user.role}</div>
          </div>
          <Form action="/actions/logout" method="post">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Sign out
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}


/**
 * Upgrade Prompt Component
 * 
 * Displays upgrade prompts throughout the application
 */

import { Link } from "@remix-run/react";

interface UpgradePromptProps {
  message?: string;
  feature?: string;
  className?: string;
}

export function UpgradePrompt({ 
  message = "Upgrade to unlock this feature",
  feature,
  className = ""
}: UpgradePromptProps) {
  return (
    <div className={`bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-indigo-900">
            {feature ? `${feature} - Premium Feature` : "Premium Feature"}
          </h3>
          <p className="mt-1 text-sm text-indigo-700">{message}</p>
          <div className="mt-3">
            <Link
              to="/subscription"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              Upgrade now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


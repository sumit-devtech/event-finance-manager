/**
 * Layout Header Component
 * 
 * Header wrapper for layout
 */

import { ReactNode } from "react";

interface LayoutHeaderProps {
  children: ReactNode;
}

export function LayoutHeader({ children }: LayoutHeaderProps) {
  return (
    <div className="w-full sticky top-0 z-20 overflow-hidden">
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-2">
        {children}
      </div>
    </div>
  );
}


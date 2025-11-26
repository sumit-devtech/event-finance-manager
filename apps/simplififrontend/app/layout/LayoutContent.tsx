/**
 * Layout Content Component
 * 
 * Main content area wrapper
 */

import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface LayoutContentProps {
  children: ReactNode;
  className?: string;
}

export function LayoutContent({ children, className = "" }: LayoutContentProps) {
  return (
    <main className={cn("flex-1 mb-16 rounded-t-xl -mt-1 p-3", className)}>
      {children}
    </main>
  );
}


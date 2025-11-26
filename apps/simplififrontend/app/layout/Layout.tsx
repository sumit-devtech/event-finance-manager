/**
 * Main Layout Component
 * 
 * Base layout wrapper that combines Header and Footer
 */

import { ReactNode } from "react";
import { Footer } from "./Footer";
import { cn } from "~/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {children}
      <Footer />
    </div>
  );
}


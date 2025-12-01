import type { ReactNode } from "react";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number; // Default 100
  variant?: "safe" | "warning" | "danger" | "primary";
  showLabel?: boolean;
  label?: string;
  className?: string;
  height?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  showLabel = false,
  label,
  className = "",
  height = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    safe: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    primary: "bg-blue-500",
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showLabel && <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heightClasses[height]}`}>
        <div
          className={`${heightClasses[height]} rounded-full transition-all duration-300 ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


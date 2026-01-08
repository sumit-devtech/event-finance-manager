import { ProgressBar } from "./ProgressBar";

interface ProgressIndicatorProps {
  label: string;
  value: number;
  max?: number;
  variant?: "safe" | "warning" | "danger" | "primary";
  showPercentage?: boolean;
  className?: string;
}

/**
 * Progress Indicator Component
 * Matches Simplifi brand guidelines for progress displays
 * Used for budget utilization, approval progress, etc.
 */
export function ProgressIndicator({
  label,
  value,
  max = 100,
  variant = "primary",
  showPercentage = true,
  className = "",
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-interface text-[#5E5E5E]">{label}</span>
        {showPercentage && (
          <span className="text-interface-bold text-[#1A1A1A]">{Math.round(percentage)}%</span>
        )}
      </div>
      <ProgressBar
        value={value}
        max={max}
        variant={variant}
        height="md"
      />
    </div>
  );
}






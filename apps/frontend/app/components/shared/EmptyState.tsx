import type { ReactNode } from "react";
import type { EmptyStateProps } from "~/types/shared-components";

interface EmptyStateComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateComponentProps) {
  return (
    <div className="text-center py-12 bg-white rounded-[6px] border border-[#E2E2E2]">
      {icon && (
        <div className="flex justify-center items-center mb-4 text-[#A9A9A9]">
          {icon}
        </div>
      )}
      <h3 className="mb-2 font-semibold text-base text-[#1A1A1A]">{title}</h3>
      {description && (
        <p className="text-[#5E5E5E] mb-4 text-sm">{description}</p>
      )}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-4 h-9 bg-[#672AFA] text-white rounded-[6px] hover:bg-[#5A1FE6] transition-colors text-sm font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

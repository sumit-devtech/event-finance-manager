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
    <div className="text-center py-12 bg-card rounded-lg border border-border">
      {icon && (
        <div className="flex justify-center items-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="mb-2 font-semibold text-lg text-card-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

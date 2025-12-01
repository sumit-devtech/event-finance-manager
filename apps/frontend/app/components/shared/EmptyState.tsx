import type { ReactNode } from "react";

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
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      {icon && <div className="mx-auto mb-4 flex justify-center">{icon}</div>}
      <h3 className="mb-2 font-semibold text-lg text-gray-900">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import type { CardMetadata, CardStat, ActionButtonConfig } from "~/types";
import { ViewDetailsButton, EditButton, DeleteButton } from "./ActionButtons";

interface DataCardProps {
  title: string;
  subtitle?: string;
  badge?: { label: string; color?: string };
  icon?: ReactNode;
  metadata?: CardMetadata[];
  stats?: CardStat[];
  actions?: ActionButtonConfig[];
  className?: string;
  onCardClick?: () => void;
}

export function DataCard({
  title,
  subtitle,
  badge,
  icon,
  metadata = [],
  stats = [],
  actions = [],
  className = "",
  onCardClick,
}: DataCardProps) {
  return (
    <div
      className={`bg-card text-card-foreground rounded-lg border border-border p-6 hover:shadow-lg transition-shadow ${className}`}
      onClick={onCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
          )}
          {badge && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                badge.color === 'blue' || !badge.color
                  ? "bg-primary/10 text-primary"
                  : badge.color === 'red'
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {icon && <div className="text-right">{icon}</div>}
      </div>

      {/* Metadata */}
      {metadata.length > 0 && (
        <div className="space-y-3 mb-4">
          {metadata.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-muted-foreground"
            >
              {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
              <span className="text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div className="border-t border-border pt-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-card-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => {
            if (action.variant === "primary") {
              return (
                <ViewDetailsButton
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  label={action.label}
                />
              );
            } else if (action.variant === "secondary") {
              return (
                <EditButton
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                />
              );
            } else if (action.variant === "danger") {
              return (
                <DeleteButton
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  requireConfirm={action.requireConfirm}
                  confirmMessage={action.confirmMessage}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

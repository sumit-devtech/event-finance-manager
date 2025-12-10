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
      className={`bg-white text-[#1A1A1A] rounded-[6px] border border-[#E2E2E2] p-5 hover:border-[#C6C6C6] transition-colors ${className}`}
      onClick={onCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="mb-2 text-base font-semibold text-[#1A1A1A]">{title}</h3>
          {subtitle && (
            <p className="text-sm text-[#5E5E5E] mb-2">{subtitle}</p>
          )}
          {badge && (
            <span
              className={`inline-block px-2 py-1 rounded-[6px] text-xs font-medium ${
                badge.color === 'blue' || !badge.color
                ? "bg-[#672AFA]/10 text-[#672AFA]"
                  : badge.color === 'red'
                  ? "bg-[#D92C2C]/10 text-[#D92C2C]"
                  : badge.color === 'green'
                    ? "bg-[#1BBE63]/10 text-[#1BBE63]"
                    : badge.color === 'orange'
                      ? "bg-[#FF751F]/10 text-[#FF751F]"
                      : "bg-[#F3F3F6] text-[#5E5E5E]"
              }`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {icon && <div className="text-right text-[#5E5E5E]">{icon}</div>}
      </div>

      {/* Metadata */}
      {metadata.length > 0 && (
        <div className="space-y-3 mb-4">
          {metadata.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-[#5E5E5E]"
            >
              {item.icon && <div className="flex-shrink-0 text-[#5E5E5E]">{item.icon}</div>}
              <span className="text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div className="border-t border-[#E2E2E2] pt-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-[#5E5E5E] text-sm mb-1">{stat.label}</p>
                <p className="text-[#1A1A1A] text-sm">
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

import type { ReactNode } from "react";

// Card metadata item (icon + label + value)
export interface CardMetadata {
  icon?: ReactNode;
  label: string;
  value: string | number | ReactNode;
}

// Card statistic
export interface CardStat {
  label: string;
  value: string | number;
  description?: string;
  color?: string;
}

// Table column definition (generic)
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

// Filter configuration
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "text" | "date";
  options?: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

// Modal section
export interface ModalSectionItem {
  label: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
}

export interface ModalSection {
  title: string;
  content?: ReactNode;
  items?: ModalSectionItem[];
}

// Summary statistic
export interface SummaryStat {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  color?: string;
}

// Action button configuration
export interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "danger";
  icon?: ReactNode;
  disabled?: boolean;
  requireConfirm?: boolean;
  confirmMessage?: string;
}

// Empty state props
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}


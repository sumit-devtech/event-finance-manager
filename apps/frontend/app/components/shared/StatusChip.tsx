/**
 * Status Chip Component
 * Enterprise-grade status indicator following Simplifi design system
 * Colors: Approved (green), Pending (orange), Rejected (red), Draft (grey)
 */

import type { ReactNode } from "react";

export type StatusType = "approved" | "pending" | "rejected" | "draft";

interface StatusChipProps {
  status: StatusType | string;
  children?: ReactNode;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  approved: {
    bg: "bg-[#1BBE63]/10",
    text: "text-[#1BBE63]",
  },
  pending: {
    bg: "bg-[#FF751F]/10",
    text: "text-[#FF751F]",
  },
  rejected: {
    bg: "bg-[#D92C2C]/10",
    text: "text-[#D92C2C]",
  },
  draft: {
    bg: "bg-[#F3F3F6]",
    text: "text-[#5E5E5E]",
  },
};

export function StatusChip({ status, children, className = "" }: StatusChipProps) {
  const normalizedStatus = status.toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.draft;
  const displayText = children || status;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {displayText}
    </span>
  );
}


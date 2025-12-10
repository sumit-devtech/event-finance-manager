import { SummaryStats } from "~/components/shared";
import { renderStars } from "./utils";
import type { SummaryStat } from "~/types";

interface VendorStatsProps {
  totalVendors: number;
  totalSpent: number;
  avgRating: number;
}

/**
 * Vendor Statistics Component
 * Displays summary statistics for vendors
 */
export function VendorStats({ totalVendors, totalSpent, avgRating }: VendorStatsProps) {
  const summaryStats: SummaryStat[] = [
    {
      label: 'Total Vendors',
      value: totalVendors,
      description: 'Active relationships',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString()}`,
      description: 'Across all vendors',
      color: 'blue-600',
    },
    {
      label: 'Average Rating',
      value: avgRating.toFixed(1),
      description: `Based on ${totalVendors} vendors`,
      icon: renderStars(Math.round(avgRating)),
      color: 'yellow-600',
    },
  ];

  return <SummaryStats stats={summaryStats} columns={3} />;
}



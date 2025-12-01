import type { ReactNode } from "react";
import type { SummaryStat } from "~/types";

interface SummaryStatsProps {
  stats: SummaryStat[];
  columns?: 1 | 2 | 3 | 4;
}

export function SummaryStats({ stats, columns = 3 }: SummaryStatsProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const getValueColorClass = (color?: string) => {
    if (!color) return "text-card-foreground";
    if (color === "blue-600") return "text-primary";
    if (color === "yellow-600") return "text-yellow-600";
    if (color === "green-600") return "text-green-600";
    if (color === "red-600") return "text-red-600";
    return "text-card-foreground";
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card p-6 rounded-lg border border-border"
        >
          <div className="text-base text-muted-foreground">{stat.label}</div>
          <div className="flex items-center gap-2 mt-1">
            {stat.icon && <div className="text-primary">{stat.icon}</div>}
            <div className={`text-2xl font-bold ${getValueColorClass(stat.color)}`}>
              {stat.value}
            </div>
          </div>
          {stat.description && (
            <div className="text-sm text-muted-foreground mt-1">{stat.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}

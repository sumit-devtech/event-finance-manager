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
    if (!color) return "text-[#1A1A1A]";
    if (color === "blue-600" || color === "purple") return "text-[#672AFA]";
    if (color === "yellow-600" || color === "orange") return "text-[#FF751F]";
    if (color === "green-600" || color === "green") return "text-[#1BBE63]";
    if (color === "red-600" || color === "red") return "text-[#D92C2C]";
    return "text-[#1A1A1A]";
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-[6px] border border-[#E2E2E2]"
        >
          <div className="text-sm text-[#5E5E5E]">{stat.label}</div>
          <div className="flex items-center gap-2 mt-1">
            {stat.icon && <div className="text-[#672AFA]">{stat.icon}</div>}
            <div className={`text-xl font-bold ${getValueColorClass(stat.color)}`}>
              {stat.value}
            </div>
          </div>
          {stat.description && (
            <div className="text-xs text-[#5E5E5E] mt-1">{stat.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}

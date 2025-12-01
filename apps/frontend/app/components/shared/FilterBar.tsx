import { Search } from "../Icons";
import { Dropdown } from "./Dropdown";
import type { FilterConfig } from "~/types";

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  className?: string;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`bg-card p-4 rounded-lg border border-border ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {filters.map((filter) => (
          <div key={filter.key}>
            {filter.type === "select" && (
              <Dropdown
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options || []}
                size="md"
                className="min-w-[150px]"
              />
            )}
            {filter.type === "text" && (
              <input
                type="text"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                placeholder={filter.label}
                className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {filter.type === "date" && (
              <input
                type="date"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

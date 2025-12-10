import { FilterBar } from "~/components/shared";
import { VENDOR_CATEGORY_OPTIONS } from "~/constants/vendors";
import type { FilterConfig } from "~/types";

interface VendorFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: string;
  onFilterChange: (category: string) => void;
}

/**
 * Vendor Filters Component
 * Handles search and category filtering
 */
export function VendorFilters({
  searchQuery,
  onSearchChange,
  filterCategory,
  onFilterChange,
}: VendorFiltersProps) {
  const filterConfigs: FilterConfig[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      value: filterCategory,
      onChange: (value) => onFilterChange(value),
      options: VENDOR_CATEGORY_OPTIONS.map(cat => ({
        value: cat.value,
        label: cat.label,
      })),
    },
  ];

  return (
    <FilterBar
      searchPlaceholder="Search vendors..."
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      filters={filterConfigs}
    />
  );
}



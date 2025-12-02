import { Dropdown } from '../shared';
import { EVENT_STATUS, EVENT_TYPES, TIME_RANGE_FILTERS, BUDGET_HEALTH_FILTERS, type EventStatus } from "~/constants/events";

interface EventFilters {
  status: EventStatus | string;
  type: string;
  budgetHealth: string;
  region: string;
  timeRange: string;
}

interface EventsFiltersProps {
  filters: EventFilters;
  onFilterChange: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
  availableTypes: string[];
  availableRegions: string[];
  showFilters: boolean;
}

export function EventsFilters({
  filters,
  onFilterChange,
  availableTypes,
  availableRegions,
  showFilters,
}: EventsFiltersProps) {
  if (!showFilters) return null;

  return (
    <>
      {/* Advanced Filters */}
      <div className="border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-2">Event Type</label>
          <Dropdown
            value={filters.type}
            onChange={(value) => onFilterChange('type', value)}
            options={[
              { value: EVENT_TYPES.ALL, label: 'All Types' },
              ...availableTypes.map(type => ({ value: type, label: type }))
            ]}
            size="sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Budget Health</label>
          <Dropdown
            value={filters.budgetHealth}
            onChange={(value) => onFilterChange('budgetHealth', value)}
            options={[
              { value: BUDGET_HEALTH_FILTERS.ALL, label: 'All' },
              { value: BUDGET_HEALTH_FILTERS.HEALTHY, label: 'Healthy (under 50%)' },
              { value: BUDGET_HEALTH_FILTERS.WARNING, label: 'Warning (50-75%)' },
              { value: BUDGET_HEALTH_FILTERS.CAUTION, label: 'Caution (75-90%)' },
              { value: BUDGET_HEALTH_FILTERS.CRITICAL, label: 'Critical (over 90%)' },
            ]}
            size="sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Region</label>
          <Dropdown
            value={filters.region}
            onChange={(value) => onFilterChange('region', value)}
            options={[
              { value: 'all', label: 'All Regions' },
              ...availableRegions.map(region => ({ value: region, label: region }))
            ]}
            size="sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Status</label>
          <Dropdown
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            options={[
              { value: EVENT_STATUS.ALL, label: 'All Status' },
              { value: EVENT_STATUS.planning, label: 'Planning' },
              { value: EVENT_STATUS.active, label: 'Active' },
              { value: EVENT_STATUS.completed, label: 'Completed' },
            ]}
            size="sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Time Range</label>
          <Dropdown
            value={filters.timeRange}
            onChange={(value) => onFilterChange('timeRange', value)}
            options={[
              { value: TIME_RANGE_FILTERS.ALL, label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: TIME_RANGE_FILTERS.THIS_WEEK, label: 'This Week' },
              { value: TIME_RANGE_FILTERS.THIS_MONTH, label: 'This Month' },
              { value: 'nextMonth', label: 'Next Month' },
              { value: TIME_RANGE_FILTERS.THIS_QUARTER, label: 'This Quarter' },
              { value: TIME_RANGE_FILTERS.THIS_YEAR, label: 'This Year' },
              { value: TIME_RANGE_FILTERS.PAST, label: 'Past Events' },
              { value: TIME_RANGE_FILTERS.UPCOMING, label: 'Upcoming Events' },
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onFilterChange('status', EVENT_STATUS.ALL)}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
            filters.status === EVENT_STATUS.ALL ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange('status', EVENT_STATUS.active)}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
            filters.status === EVENT_STATUS.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => onFilterChange('status', EVENT_STATUS.planning)}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
            filters.status === EVENT_STATUS.planning ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Planning
        </button>
        <button
          onClick={() => onFilterChange('status', EVENT_STATUS.completed)}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
            filters.status === EVENT_STATUS.completed ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed
        </button>
      </div>
    </>
  );
}


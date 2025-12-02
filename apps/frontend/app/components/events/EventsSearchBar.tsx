import { Search, Filter, Grid, List } from '../Icons';
import type { ViewMode } from './hooks/useEventViewMode';

interface EventsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function EventsSearchBar({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  viewMode,
  onViewModeChange,
}: EventsSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onToggleFilters}
          className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
            showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter size={18} />
          <span className="hidden sm:inline">Filters</span>
        </button>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('card')}
            className={`px-3 py-2 transition-colors ${
              viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Card View"
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-2 border-l border-gray-300 transition-colors ${
              viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Table View"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


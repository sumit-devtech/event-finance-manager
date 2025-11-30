import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, MapPin, Users, DollarSign, MoreVertical, Crown, AlertCircle, Grid, List, Archive, Copy, Download, Info, TrendingUp, X, Check, Edit2, Trash2, ChevronDown, ChevronUp } from './Icons';
import EventForm from './EventForm';
import EventDetailsExpanded from './EventDetailsExpanded';
import { eventsAPI } from '../utils/api';

interface EventsListProps {
  user: any;
  organization: any;
  isDemo: boolean;
  onUpgrade: () => void;
}

export default function EventsList({ user, organization, isDemo, onUpgrade }: EventsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [filterType, setFilterType] = useState('all');
  const [filterBudgetHealth, setFilterBudgetHealth] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [filterTimeRange, setFilterTimeRange] = useState('all');
  const [expandedMetadata, setExpandedMetadata] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isDemo) {
      fetchEvents();
    } else {
      // Load demo data
      setEvents(getDemoEvents());
      setLoading(false);
    }
  }, [organization, isDemo]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { events: fetchedEvents } = await eventsAPI.list(organization?.id);
      setEvents(fetchedEvents || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getDemoEvents = () => [
    {
      id: 1,
      name: 'Annual Tech Conference 2024',
      type: 'Conference',
      date: '2024-03-15',
      endDate: '2024-03-17',
      location: 'San Francisco, CA',
      region: 'West',
      venue: 'Moscone Center',
      attendees: 500,
      budget: 85000,
      spent: 62000,
      organizer: 'Sarah Johnson',
      eventOwner: 'Sarah Johnson',
      status: 'active',
      description: 'Annual technology conference featuring keynote speakers and workshops',
      roi: 15.5,
    },
    {
      id: 2,
      name: 'Product Launch Event',
      type: 'Launch',
      date: '2024-03-20',
      location: 'New York, NY',
      region: 'East',
      venue: 'Hudson Yards',
      attendees: 200,
      budget: 45000,
      spent: 12000,
      organizer: 'Mike Davis',
      eventOwner: 'Mike Davis',
      status: 'planning',
      description: 'Launching our new product line with media and influencers',
      roi: 8.2,
    },
    {
      id: 3,
      name: 'Team Building Retreat',
      type: 'Retreat',
      date: '2024-04-01',
      endDate: '2024-04-03',
      location: 'Lake Tahoe, NV',
      region: 'West',
      venue: 'Mountain Resort',
      attendees: 50,
      budget: 25000,
      spent: 5000,
      organizer: 'Emily Chen',
      eventOwner: 'Emily Chen',
      status: 'planning',
      description: 'Company-wide team building activities and workshops',
      roi: 12.0,
    },
    {
      id: 4,
      name: 'Holiday Gala 2024',
      type: 'Gala',
      date: '2024-12-15',
      location: 'Chicago, IL',
      region: 'Midwest',
      venue: 'Navy Pier',
      attendees: 300,
      budget: 60000,
      spent: 55000,
      organizer: 'David Park',
      eventOwner: 'David Park',
      status: 'active',
      description: 'Annual holiday celebration for employees and clients',
      roi: 5.3,
    },
  ];

  const getBudgetHealth = (event: any) => {
    const percentage = (event.spent / event.budget) * 100;
    if (percentage < 50) return 'healthy';
    if (percentage < 75) return 'warning';
    if (percentage < 90) return 'caution';
    return 'critical';
  };

  const isEventInTimeRange = (event: any, range: string) => {
    if (range === 'all') return true;
    
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (range) {
      case 'today':
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return eventDate >= today && eventDate <= todayEnd;
      
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return eventDate >= weekStart && eventDate <= weekEnd;
      
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        return eventDate >= monthStart && eventDate <= monthEnd;
      
      case 'nextMonth':
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        nextMonthEnd.setHours(23, 59, 59, 999);
        return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
      
      case 'thisQuarter':
        const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
        const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
        const quarterEnd = new Date(today.getFullYear(), quarterMonth + 3, 0);
        quarterEnd.setHours(23, 59, 59, 999);
        return eventDate >= quarterStart && eventDate <= quarterEnd;
      
      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        return eventDate >= yearStart && eventDate <= yearEnd;
      
      case 'past':
        return eventDate < today;
      
      case 'upcoming':
        return eventDate >= today;
      
      default:
        return true;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesBudgetHealth = filterBudgetHealth === 'all' || getBudgetHealth(event) === filterBudgetHealth;
    const matchesRegion = filterRegion === 'all' || event.region === filterRegion;
    const matchesTimeRange = isEventInTimeRange(event, filterTimeRange);
    
    return matchesSearch && matchesStatus && matchesType && matchesBudgetHealth && matchesRegion && matchesTimeRange;
  });

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEvent(null);
    if (!isDemo) {
      fetchEvents(); // Refresh the list
    }
  };

  const handleCreateEvent = () => {
    const isFreeUser = user?.subscription === 'free';
    const freeEventsRemaining = user?.freeEventsRemaining || 0;

    if (isFreeUser && freeEventsRemaining <= 0 && !isDemo) {
      alert('You have reached your free event limit. Please upgrade to create more events.');
      onUpgrade();
      return;
    }

    setShowForm(true);
  };

  const toggleEventSelection = (eventId: number) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const selectAllEvents = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)));
    }
  };

  const handleBulkArchive = () => {
    if (selectedEvents.size === 0) return;
    alert(`Archiving ${selectedEvents.size} event(s)`);
    setSelectedEvents(new Set());
    setShowBulkActions(false);
  };

  const handleBulkDuplicate = () => {
    if (selectedEvents.size === 0) return;
    alert(`Duplicating ${selectedEvents.size} event(s)`);
    setSelectedEvents(new Set());
    setShowBulkActions(false);
  };

  const handleBulkExport = () => {
    if (selectedEvents.size === 0) return;
    const selectedEventsData = filteredEvents.filter(e => selectedEvents.has(e.id));
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Name,Type,Date,Location,Budget,Spent,Status,ROI%\n' +
      selectedEventsData.map(e => 
        `${e.name},${e.type},${e.date},${e.location},${e.budget},${e.spent},${e.status},${e.roi || 0}`
      ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'events_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSelectedEvents(new Set());
    setShowBulkActions(false);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    if (!isDemo) {
      try {
        await eventsAPI.delete(eventId);
        await fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    } else {
      // For demo mode, just remove from local state
      setEvents(events.filter(e => e.id !== eventId));
    }
    setDropdownOpen(null);
  };

  const toggleMetadata = (eventId: number) => {
    const newExpanded = new Set(expandedMetadata);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedMetadata(newExpanded);
  };

  if (showForm) {
    return <EventForm event={selectedEvent} onClose={handleCloseForm} user={user} organization={organization} isDemo={isDemo} />;
  }

  const isFreeUser = user?.subscription === 'free';
  const freeEventsRemaining = user?.freeEventsRemaining || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getBudgetHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'caution': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRegions = () => {
    const regions = new Set(events.map(e => e.region).filter(Boolean));
    return Array.from(regions);
  };

  const getEventTypes = () => {
    const types = new Set(events.map(e => e.type).filter(Boolean));
    return Array.from(types);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl">Events</h2>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Manage all your events and their details</p>
            {isFreeUser && !isDemo && (
              <p className="text-sm text-yellow-700 mt-2 flex items-center gap-1">
                <Crown size={16} />
                Free Trial: {freeEventsRemaining} event(s) remaining
              </p>
            )}
          </div>
          <button
            onClick={handleCreateEvent}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Free Trial Warning */}
      {isFreeUser && freeEventsRemaining <= 0 && !isDemo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800">You've reached your free event limit</p>
            <p className="text-yellow-700 text-sm mt-1">
              Upgrade to a paid plan to create unlimited events and unlock advanced features.
            </p>
            <button
              onClick={onUpgrade}
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Search and View Toggle */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
                  showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Card View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Event Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  {getEventTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Budget Health</label>
                <select
                  value={filterBudgetHealth}
                  onChange={(e) => setFilterBudgetHealth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All</option>
                  <option value="healthy">Healthy (under 50%)</option>
                  <option value="warning">Warning (50-75%)</option>
                  <option value="caution">Caution (75-90%)</option>
                  <option value="critical">Critical (over 90%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Regions</option>
                  {getRegions().map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Time Range</label>
                <select
                  value={filterTimeRange}
                  onChange={(e) => setFilterTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="nextMonth">Next Month</option>
                  <option value="thisQuarter">This Quarter</option>
                  <option value="thisYear">This Year</option>
                  <option value="past">Past Events</option>
                  <option value="upcoming">Upcoming Events</option>
                </select>
              </div>
            </div>
          )}

          {/* Status Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                filterStatus === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('planning')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                filterStatus === 'planning' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedEvents.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-blue-900 text-sm">
            {selectedEvents.size} event(s) selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBulkArchive}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <Archive size={16} />
              <span>Archive</span>
            </button>
            <button
              onClick={handleBulkDuplicate}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <Copy size={16} />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleBulkExport}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={() => setSelectedEvents(new Set())}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filteredEvents.map((event) => {
            const budgetPercentage = (event.spent / event.budget) * 100;
            const budgetHealth = getBudgetHealth(event);
            const isSelected = selectedEvents.has(event.id);
            const isHovered = hoveredEvent === event.id;

            return (
              <div
                key={event.id}
                className={`bg-white rounded-lg border p-4 md:p-6 hover:shadow-lg transition-all relative ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleEventSelection(event.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-start justify-between mb-4 pl-8">
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-2 text-lg md:text-xl truncate">{event.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className="inline-block px-2 md:px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        {event.type}
                      </span>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0 ml-2">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === event.id ? null : event.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical size={20} className="text-gray-400" />
                    </button>
                    {dropdownOpen === event.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button
                          onClick={() => {
                            handleEditEvent(event);
                            setDropdownOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                        >
                          <Edit2 size={16} />
                          <span>Edit Event</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                        >
                          <Trash2 size={16} />
                          <span>Delete Event</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* KPIs Row */}
                <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Budget Utilized</p>
                    <p className="text-sm md:text-base font-medium text-gray-900">{budgetPercentage.toFixed(0)}%</p>
                  </div>
                  <div className="text-center border-l border-r border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">ROI</p>
                    <p className="text-sm md:text-base font-medium text-green-600 flex items-center justify-center gap-1">
                      {event.roi ? `${event.roi}%` : 'N/A'}
                      {event.roi && <TrendingUp size={14} />}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Health</p>
                    <div className={`w-3 h-3 rounded-full mx-auto ${getBudgetHealthColor(budgetHealth)}`}></div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-2 md:space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span className="text-sm truncate">{event.location}</span>
                    {event.region && (
                      <span className="text-xs text-gray-500 ml-auto">({event.region})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} className="flex-shrink-0" />
                    <span className="text-sm">{event.attendees} attendees</span>
                  </div>
                </div>

                {/* Collapsible Metadata */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleMetadata(event.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <Info size={14} />
                      <span className="text-sm">Event Details</span>
                    </div>
                    {expandedMetadata.has(event.id) ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>
                  {expandedMetadata.has(event.id) && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="space-y-2">
                        <p className="text-xs text-blue-800">
                          <span className="font-medium">Owner:</span> {event.eventOwner || event.organizer}
                        </p>
                        <p className="text-xs text-blue-800">
                          <span className="font-medium">Type:</span> {event.type}
                        </p>
                        {event.region && (
                          <p className="text-xs text-blue-800">
                            <span className="font-medium">Region:</span> {event.region}
                          </p>
                        )}
                        {event.venue && (
                          <p className="text-xs text-blue-800">
                            <span className="font-medium">Venue:</span> {event.venue}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-xs text-blue-800 mt-2 pt-2 border-t border-blue-200">
                            <span className="font-medium">Description:</span> {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Budget Progress */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2 text-sm md:text-base">
                    <span className="text-gray-600">Budget</span>
                    <span className="text-gray-900 font-medium">
                      ${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getBudgetHealthColor(budgetHealth)}`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{budgetPercentage.toFixed(0)}% spent</p>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEvents.size === filteredEvents.length && filteredEvents.length > 0}
                      onChange={selectAllEvents}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Event Name</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Owner</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Region</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Budget Utilized</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">ROI %</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const budgetPercentage = (event.spent / event.budget) * 100;
                  const budgetHealth = getBudgetHealth(event);
                  const isSelected = selectedEvents.has(event.id);

                  return (
                    <tr
                      key={event.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEventSelection(event.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-blue-600 hover:text-blue-800 text-sm text-left"
                        >
                          {event.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{event.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{event.eventOwner || event.organizer}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{event.region || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getBudgetHealthColor(budgetHealth)}`}
                              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700">{budgetPercentage.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          {event.roi ? `${event.roi}%` : 'N/A'}
                          {event.roi && <TrendingUp size={12} />}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === event.id ? null : event.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                          {dropdownOpen === event.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                              <button
                                onClick={() => {
                                  handleEditEvent(event);
                                  setDropdownOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                              >
                                <Edit2 size={16} />
                                <span>Edit Event</span>
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                              >
                                <Trash2 size={16} />
                                <span>Delete Event</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsExpanded
          event={selectedEvent}
          organization={organization}
          onClose={() => setSelectedEvent(null)}
          onUpdate={async (data) => {
            if (!isDemo) {
              await eventsAPI.update(selectedEvent.id, data);
              await fetchEvents();
            }
            setSelectedEvent({ ...selectedEvent, ...data });
          }}
        />
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterStatus !== 'all' || filterType !== 'all' || filterBudgetHealth !== 'all' || filterRegion !== 'all'
              ? 'Try adjusting your filters or search'
              : 'Get started by creating your first event'}
          </p>
          <button
            onClick={handleCreateEvent}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Event
          </button>
        </div>
      )}
    </div>
  );
}
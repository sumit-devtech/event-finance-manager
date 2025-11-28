import { useState } from 'react';
import { Plus, Search, Filter, Calendar, MapPin, Users, DollarSign, MoreVertical, Crown, AlertCircle } from 'lucide-react';
import EventForm from './EventForm';

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

  const events = [
    {
      id: 1,
      name: 'Tech Conference 2024',
      date: '2024-03-15',
      location: 'San Francisco, CA',
      status: 'active',
      attendees: 500,
      budget: 125000,
      spent: 98000,
      organizer: 'John Smith',
    },
    {
      id: 2,
      name: 'Product Launch Event',
      date: '2024-04-20',
      location: 'New York, NY',
      status: 'planning',
      attendees: 200,
      budget: 85000,
      spent: 12000,
      organizer: 'Sarah Johnson',
    },
    {
      id: 3,
      name: 'Annual Gala',
      date: '2024-02-28',
      location: 'Chicago, IL',
      status: 'active',
      attendees: 350,
      budget: 95000,
      spent: 87000,
      organizer: 'Mike Davis',
    },
    {
      id: 4,
      name: 'Workshop Series',
      date: '2024-01-15',
      location: 'Austin, TX',
      status: 'completed',
      attendees: 150,
      budget: 45000,
      spent: 44500,
      organizer: 'Emily Chen',
    },
    {
      id: 5,
      name: 'Corporate Retreat',
      date: '2024-05-10',
      location: 'Denver, CO',
      status: 'planning',
      attendees: 100,
      budget: 65000,
      spent: 8000,
      organizer: 'Robert Wilson',
    },
    {
      id: 6,
      name: 'Trade Show Booth',
      date: '2024-06-05',
      location: 'Las Vegas, NV',
      status: 'planning',
      attendees: 1000,
      budget: 150000,
      spent: 25000,
      organizer: 'Amanda Lee',
    },
  ];

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'planning': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEvent(null);
  };

  const handleCreateEvent = () => {
    // Check if user can create more events
    const isFreeUser = user?.subscription === 'free';
    const freeEventsRemaining = user?.freeEventsRemaining || 0;

    if (isFreeUser && freeEventsRemaining <= 0 && !isDemo) {
      alert('You have reached your free event limit. Please upgrade to create more events.');
      onUpgrade();
      return;
    }

    setShowForm(true);
  };

  if (showForm) {
    return <EventForm event={selectedEvent} onClose={handleCloseForm} user={user} organization={organization} />;
  }

  const isFreeUser = user?.subscription === 'free';
  const freeEventsRemaining = user?.freeEventsRemaining || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Events</h2>
          <p className="text-gray-600 mt-1">Manage all your events and their details</p>
          {isFreeUser && !isDemo && (
            <p className="text-sm text-yellow-700 mt-1 flex items-center gap-1">
              <Crown size={16} />
              Free Trial: {freeEventsRemaining} event(s) remaining
            </p>
          )}
        </div>
        <button
          onClick={handleCreateEvent}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Free Trial Warning */}
      {isFreeUser && freeEventsRemaining <= 0 && !isDemo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 justify-center">
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-2">{event.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span className="text-sm">{event.attendees} attendees</span>
                </div>
                {organization && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span className="text-sm">Assigned to: {event.organizer}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Budget Progress</span>
                  <span className="text-sm">
                    ${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(event.spent / event.budget) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Plus, Search, Filter, Calendar, MapPin, Users, DollarSign, MoreVertical } from 'lucide-react';
import type { User } from "~/lib/auth";
import { EventForm } from "./events";

interface EventsListProps {
  user: User;
  organization?: any;
  events: any[];
  isDemo?: boolean;
}

export function EventsList({ user, organization, events, isDemo = false }: EventsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'planning': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCreateEvent = () => {
    if (isDemo) {
      setSelectedEvent(null);
      setShowForm(true);
    } else {
      navigate("/events/new");
    }
  };

  const handleEditEvent = (event: any) => {
    if (isDemo) {
      setSelectedEvent(event);
      setShowForm(true);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEvent(null);
  };

  // Show form inline in demo mode
  if (showForm && isDemo) {
    return (
      <EventForm
        event={selectedEvent}
        onClose={handleCloseForm}
        user={user}
        organization={organization}
        isDemo={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events</h2>
          <p className="text-gray-600 mt-1">Manage all your events and their details</p>
          {isDemo && (
            <p className="text-yellow-700 text-sm mt-1">
              Demo Mode: You can create events, but changes won't be saved.
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
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
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link to={`/events/${event.id}`}>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 hover:text-blue-600">{event.name}</h3>
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  {event.startDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span className="text-sm">{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {event.client && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span className="text-sm">{event.client}</span>
                    </div>
                  )}
                  {event._count && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={16} />
                      <span className="text-sm">{event._count.budgetItems || 0} budget items</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
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
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first event</p>
          <button
            onClick={handleCreateEvent}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        </div>
      )}
    </div>
  );
}


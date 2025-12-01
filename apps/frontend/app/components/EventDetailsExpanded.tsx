import { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Users, DollarSign, CheckCircle, Clock, 
  TrendingUp, FileText, X, Target, Folder, Edit, Receipt
} from './Icons';
import { useFetcher } from '@remix-run/react';
import { BudgetManager } from './BudgetManager';
import { ExpenseTracker } from './ExpenseTracker';
import { StrategicGoals } from './StrategicGoals';
import { EventDocuments } from './EventDocuments';
import { EventNotes } from './EventNotes';
import { api } from '~/lib/api';
import type { EventWithDetails, VendorWithStats } from "~/types";
import type { User } from "~/lib/auth";
import { Dropdown } from './shared';

interface EventDetailsExpandedProps {
  event: EventWithDetails;
  organization?: { name?: string; members?: Array<{ id: string; name: string }> } | null;
  onClose: () => void;
  onUpdate: (data: Partial<EventWithDetails>) => Promise<void>;
  isDemo?: boolean;
  user?: User | null;
  vendors?: VendorWithStats[];
}

export function EventDetailsExpanded({
  event,
  organization,
  onClose,
  onUpdate,
  isDemo = false,
  user,
  vendors = [],
}: EventDetailsExpandedProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [fullEvent, setFullEvent] = useState<EventWithDetails>(event);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [status, setStatus] = useState(event.status || 'planning');
  const fetcher = useFetcher();

  // Fetch full event details (including budgetItems) when component mounts or event changes
  useEffect(() => {
    if (!isDemo && event?.id && (!event.budgetItems || event.budgetItems.length === 0)) {
      setLoadingEvent(true);
      // Get token from session cookie
      const getToken = () => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'accessToken' || name === 'auth_token') {
            return value;
          }
        }
        return null;
      };

      const token = getToken();
      
      api.get(`/events/${event.id}?includeDetails=true`, { token: token || undefined })
        .then((fullEventData: any) => {
          setFullEvent(fullEventData);
          setLoadingEvent(false);
        })
        .catch((error) => {
          console.error('Error fetching event details:', error);
          setLoadingEvent(false);
        });
    } else {
      setFullEvent(event);
    }
  }, [event?.id, isDemo]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'budget', label: 'Budget Planner', icon: DollarSign },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'strategic-goals', label: 'Strategic Goals', icon: Target },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'notes', label: 'Notes', icon: Edit },
  ];

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    if (isDemo) {
      await onUpdate({ status: newStatus });
      setFullEvent({ ...currentEvent, status: newStatus });
    } else {
      const formData = new FormData();
      formData.append('intent', 'updateStatus');
      formData.append('eventId', currentEvent.id);
      formData.append('status', newStatus);
      fetcher.submit(formData, { method: 'post', action: '/events' });
      await onUpdate({ status: newStatus });
      setFullEvent({ ...currentEvent, status: newStatus });
    }
  };

  // Use fullEvent if available, otherwise use event
  const currentEvent = fullEvent || event;
  const budgetUtilization = currentEvent.budget > 0 ? ((currentEvent.spent || 0) / currentEvent.budget) * 100 : 0;
  const remaining = (currentEvent.budget || 0) - (currentEvent.spent || 0);

  const getStatusColor = (status: string) => {
    const colors: any = {
      planning: 'bg-blue-100 text-blue-700 border-blue-200',
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || colors.planning;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Mobile Overlay - Outside sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[45] sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl max-w-7xl w-full h-full sm:h-auto sm:max-h-[95vh] flex flex-col sm:flex-row overflow-hidden relative">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="sm:hidden fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <FileText size={20} className="text-gray-700" />
        </button>

        {/* Sidebar Navigation - Matches Main Sidebar Colors */}
        <div className={`
          w-full sm:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col
          fixed sm:relative inset-y-0 left-0 z-[50] shadow-2xl sm:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>

          {/* Sidebar Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-2">{currentEvent.name}</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 sm:hidden"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(currentEvent.status || 'planning')}`}>
              <Clock size={14} />
              <span className="capitalize">{currentEvent.status || 'planning'}</span>
            </div>
          </div>

          {/* Navigation Menu - Matches Main Sidebar Style */}
          <nav className="flex-1 overflow-y-auto p-4 bg-white">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                    transition-colors duration-200 text-left
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 bg-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 border-t border-gray-200 space-y-3 bg-gray-50 flex-shrink-0">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Budget</p>
              <p className="text-lg font-bold text-gray-900">${(currentEvent.budget || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Spent</p>
              <p className="text-lg font-bold text-gray-900">${(currentEvent.spent || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileText size={20} className="text-gray-600" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{event.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 capitalize">{event.type || 'Event'} Event</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
              {user?.role !== 'Viewer' && (
                <div className="min-w-[120px]">
                  <Dropdown
                    value={status}
                    onChange={handleStatusChange}
                    options={[
                      { value: 'planning', label: 'Planning' },
                      { value: 'active', label: 'Active' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    placeholder="Select status"
                    size="sm"
                    className="text-xs sm:text-sm"
                  />
                </div>
              )}
              {user?.role === 'Viewer' && (
                <span className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium bg-gray-50 text-gray-600 capitalize">
                  {event.status || 'planning'}
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign size={20} className="text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Budget</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${(event.budget || 0).toLocaleString()}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp size={20} className="text-purple-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${(event.spent || 0).toLocaleString()}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Utilization</span>
                        <span className="font-semibold">{budgetUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            budgetUtilization > 90 ? 'bg-red-500' : 
                            budgetUtilization > 75 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users size={20} className="text-indigo-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Attendees</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{(event.attendees || 0).toLocaleString()}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <DollarSign size={20} className="text-emerald-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Remaining</span>
                    </div>
                    <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Event Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar size={20} className="text-blue-600" />
                      Event Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(currentEvent.date || currentEvent.startDate).toLocaleDateString()}
                          {currentEvent.endDate && ` - ${new Date(currentEvent.endDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                        <div className="flex items-start gap-2">
                          <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-900 font-medium">{event.location || 'TBD'}</p>
                            {event.venue && (
                              <p className="text-sm text-gray-600 mt-1">{event.venue}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {event.organizer && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organizer</p>
                          <p className="text-gray-900 font-medium">{event.organizer}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign size={20} className="text-emerald-600" />
                      Budget Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Budget</span>
                        <span className="text-lg font-bold text-gray-900">${(event.budget || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="text-lg font-bold text-gray-900">${(event.spent || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Remaining</span>
                        <span className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${remaining.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                          <span className={`text-sm font-bold px-2 py-1 rounded ${
                            budgetUtilization > 90 ? 'bg-red-100 text-red-700' : 
                            budgetUtilization > 75 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {budgetUtilization.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              budgetUtilization > 90 ? 'bg-red-500' : 
                              budgetUtilization > 75 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText size={20} className="text-slate-600" />
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'budget' && (
              <BudgetManager 
                user={user}
                organization={organization}
                event={currentEvent}
                budgetItems={currentEvent?.budgetItems || []}
                strategicGoals={currentEvent?.strategicGoals || []}
                isDemo={isDemo} 
              />
            )}

            {activeSection === 'transactions' && (
              <ExpenseTracker 
                user={user}
                organization={organization}
                event={event}
                vendors={vendors}
                isDemo={isDemo}
                fetcher={fetcher}
              />
            )}

            {activeSection === 'strategic-goals' && (
              <StrategicGoals
                eventId={currentEvent.id}
                goals={currentEvent?.strategicGoals}
                isDemo={isDemo}
                user={user}
                onSave={async (goals) => {
                  if (!isDemo) {
                    // TODO: Save goals to backend
                    console.log('Save strategic goals:', goals);
                  }
                }}
              />
            )}

            {activeSection === 'documents' && (
              <EventDocuments
                eventId={currentEvent.id}
                documents={currentEvent?.files}
                isDemo={isDemo}
                user={user}
                onUpload={async (file) => {
                  if (!isDemo) {
                    // TODO: Upload file to backend
                    console.log('Upload file:', file);
                  }
                }}
                onDelete={async (documentId) => {
                  if (!isDemo) {
                    // TODO: Delete file from backend
                    console.log('Delete document:', documentId);
                  }
                }}
              />
            )}

            {activeSection === 'notes' && (
              <EventNotes
                eventId={currentEvent.id}
                notes={currentEvent?.notes}
                isDemo={isDemo}
                user={user}
                onSave={async (notes) => {
                  if (!isDemo) {
                    // TODO: Save notes to backend
                    console.log('Save notes:', notes);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

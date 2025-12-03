import { X, Calendar, MapPin, Users, DollarSign, UserCog } from 'lucide-react';
import { Form, useNavigation } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { User } from '~/lib/auth';
import { Dropdown } from '../shared';
import toast from 'react-hot-toast';

interface EventFormProps {
  event?: any;
  onClose: () => void;
  user: User | null;
  organization?: any;
  actionData?: any;
  isDemo?: boolean;
}

export function EventForm({ event, onClose, user, organization, actionData, isDemo = false }: EventFormProps) {
  const isEdit = !!event;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  // Normalize status value to match dropdown options
  const normalizeStatus = (status: string | null | undefined): string => {
    if (!status) return 'Planning'; // Default value
    
    const validStatuses = ['Planning', 'Active', 'Completed', 'Cancelled'];
    const capitalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    // Check if the normalized value matches a valid status
    if (validStatuses.includes(capitalized)) {
      return capitalized;
    }
    
    // If it doesn't match, try case-insensitive match
    const matched = validStatuses.find(s => s.toLowerCase() === status.toLowerCase());
    return matched || 'Planning'; // Default to Planning if no match
  };
  
  const [eventType, setEventType] = useState(event?.type || event?.eventType || 'conference');
  const [status, setStatus] = useState(normalizeStatus(event?.status));
  const [assignedTo, setAssignedTo] = useState(event?.assignedTo || user?.id || '');

  // Debug: Log event data when editing
  useEffect(() => {
    if (isEdit && event) {
      console.log('EventForm - Full event object:', event);
      console.log('EventForm - Client field:', event?.client);
      console.log('EventForm - Venue field:', event?.venue);
      console.log('EventForm - Attendees field:', event?.attendees);
      console.log('EventForm - Budget field:', event?.budget);
    }
  }, [isEdit, event]);


  // Close form on successful submission - only close when navigation is idle and we have success
  useEffect(() => {
    if (actionData?.success && navigation.state === 'idle' && !isSubmitting) {
      // Only close if we're not currently submitting and navigation is idle
      const timer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [actionData, navigation.state, isSubmitting, onClose]);

  // Mock team members from organization
  const teamMembers = organization?.members || [
    { id: user?.id, name: user?.name || 'You', email: user?.email },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {actionData && !actionData.success && actionData.error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{actionData.error}</p>
            <button
              onClick={onClose}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Close and try again
            </button>
          </div>
        )}

        {/* Demo Mode Notice */}
        {isDemo && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-medium">Demo Mode</p>
            <p className="text-sm mt-1">This event won't be saved in demo mode.</p>
          </div>
        )}

        {/* Form */}
        <Form 
          method={isDemo ? "get" : "post"} 
          className="p-6"
          onSubmit={(e) => {
            if (isDemo) {
              e.preventDefault();
              setTimeout(() => {
                toast("Demo Mode: Event would be created, but changes aren't saved in demo mode.");
                onClose();
              }, 500);
            }
          }}
        >
          <input type="hidden" name="intent" value={isEdit ? "update" : "create"} />
          {isEdit && <input type="hidden" name="eventId" value={event.id} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Name */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700 font-medium">Event Name *</label>
              <input
                type="text"
                name="name"
                defaultValue={event?.name || ''}
                placeholder="e.g., Annual Tech Conference 2024"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Event Type *</label>
              <input type="hidden" name="type" value={eventType} />
              <Dropdown
                value={eventType}
                onChange={setEventType}
                options={[
                  { value: 'conference', label: 'Conference' },
                  { value: 'workshop', label: 'Workshop' },
                  { value: 'gala', label: 'Gala' },
                  { value: 'product_launch', label: 'Product Launch' },
                  { value: 'corporate', label: 'Corporate Event' },
                  { value: 'trade_show', label: 'Trade Show' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Select event type"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Status *</label>
              <input type="hidden" name="status" value={status} />
              <Dropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'Planning', label: 'Planning' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' },
                ]}
                placeholder="Select status"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Start Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  name="startDate"
                  defaultValue={event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : ''}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  name="endDate"
                  defaultValue={event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : ''}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="location"
                  defaultValue={event?.location || event?.client || ''}
                  placeholder="City, State/Country"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Venue</label>
              <input
                type="text"
                name="venue"
                defaultValue={event?.venue ?? event?.venueName ?? ''}
                placeholder="Venue name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expected Attendees */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Expected Attendees</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="attendees"
                  defaultValue={event?.attendees != null ? event.attendees : ''}
                  placeholder="Number of attendees"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Total Budget *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="budget"
                  defaultValue={event?.budget != null ? event.budget : ''}
                  placeholder="0.00"
                  step="0.01"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Organizer */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Event Organizer</label>
              <input
                type="text"
                name="organizer"
                defaultValue={event?.organizer || ''}
                placeholder="Name of the organizer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Client */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Client</label>
              <input
                type="text"
                name="client"
                defaultValue={event?.client ?? ''}
                placeholder="Client name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Assigned To (if organization) */}
            {organization && (
              <div>
                <label className="block mb-2 text-gray-700 font-medium">Assign To Team Member</label>
                <input type="hidden" name="assignedTo" value={assignedTo} />
                <Dropdown
                  value={assignedTo}
                  onChange={setAssignedTo}
                  options={[
                    { value: '', label: 'Select team member' },
                    ...teamMembers.map((member: any) => ({
                      value: member.id,
                      label: `${member.name || member.email} (${member.email})`,
                    })),
                  ]}
                  placeholder="Select team member"
                />
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700 font-medium">Description</label>
              <textarea
                name="description"
                defaultValue={event?.description || ''}
                placeholder="Brief description of the event..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}


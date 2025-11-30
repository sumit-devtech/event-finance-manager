import { X, Calendar, MapPin, Users, DollarSign, UserCog } from 'lucide-react';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import type { User } from '~/lib/auth';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock team members from organization
  const teamMembers = organization?.members || [
    { id: user?.id, name: user?.name || 'You', email: user?.email },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
            <p className="text-gray-600 mt-1">Fill in the details below to create or update an event</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {actionData && !actionData.success && actionData.error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {actionData.error}
          </div>
        )}

        {/* Demo Mode Notice */}
        {isDemo && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-medium">Demo Mode</p>
            <p className="text-sm mt-1">You're creating a demo event. Changes won't be saved.</p>
          </div>
        )}

        {/* Form */}
        <Form 
          method={isDemo ? "get" : "post"} 
          className="p-6"
          onSubmit={(e) => {
            if (isDemo) {
              e.preventDefault();
              setIsSubmitting(true);
              setTimeout(() => {
                alert("Demo Mode: Event would be created, but changes aren't saved in demo mode.");
                setIsSubmitting(false);
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
              <select
                name="type"
                defaultValue={event?.type || 'conference'}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="gala">Gala</option>
                <option value="product_launch">Product Launch</option>
                <option value="corporate">Corporate Event</option>
                <option value="trade_show">Trade Show</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Status *</label>
              <select
                name="status"
                defaultValue={event?.status || 'Planning'}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
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
                defaultValue={event?.venue || ''}
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
                  defaultValue={event?.attendees || ''}
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
                  defaultValue={event?.budget || ''}
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

            {/* Assigned To (if organization) */}
            {organization && (
              <div>
                <label className="block mb-2 text-gray-700 font-medium">Assign To Team Member</label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    name="assignedTo"
                    defaultValue={event?.assignedTo || user?.id || ''}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map((member: any) => (
                      <option key={member.id} value={member.id}>
                        {member.name || member.email} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : (isEdit ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}


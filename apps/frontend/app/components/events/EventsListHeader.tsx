import { Plus, Crown, AlertCircle } from '../Icons';
import type { User } from "~/lib/auth";

interface EventsListHeaderProps {
  user: User | null;
  canCreateEvent: boolean;
  onCreateEvent: () => void;
  isDemo: boolean;
}

export function EventsListHeader({ user, canCreateEvent, onCreateEvent, isDemo }: EventsListHeaderProps) {
  const isFreeUser = user?.subscription === 'free';
  const freeEventsRemaining = user?.freeEventsRemaining || 0;

  return (
    <>
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
          {canCreateEvent && (
            <button
              onClick={onCreateEvent}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center whitespace-nowrap"
            >
              <Plus size={20} />
              <span>Create Event</span>
            </button>
          )}
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
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}


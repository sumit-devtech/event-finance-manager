import { useState, useEffect } from 'react';
import UsersManager from './UsersManager';
import { eventsAPI } from '../utils/api';

interface UsersManagerConnectedProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function UsersManagerConnected({ user, organization, isDemo }: UsersManagerConnectedProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [isDemo]);

  const loadEvents = async () => {
    try {
      if (isDemo) {
        // Demo events
        const demoEvents = [
          {
            id: 'event-1',
            name: 'Annual Tech Conference 2024',
            date: '2024-06-15',
            location: 'San Francisco, CA',
            type: 'Conference',
            budget: 150000,
            status: 'active',
          },
          {
            id: 'event-2',
            name: 'Product Launch Gala',
            date: '2024-07-20',
            location: 'New York, NY',
            type: 'Corporate',
            budget: 85000,
            status: 'active',
          },
          {
            id: 'event-3',
            name: 'Summer Team Building',
            date: '2024-08-10',
            location: 'Austin, TX',
            type: 'Team Building',
            budget: 25000,
            status: 'planning',
          },
        ];
        setEvents(demoEvents);
      } else {
        const data = await eventsAPI.list();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events for users manager:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <UsersManager organization={organization} events={events} />;
}

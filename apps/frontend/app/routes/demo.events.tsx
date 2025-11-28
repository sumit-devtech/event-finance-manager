import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { EventsList } from "~/components/EventsList";
import type { User } from "~/lib/auth";

/**
 * Demo Events Loader - no authentication required
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Demo events data from Figma design
  const demoEvents = [
    {
      id: '1',
      name: 'Tech Conference 2024',
      date: '2024-03-15',
      startDate: '2024-03-15',
      location: 'San Francisco, CA',
      status: 'active',
      attendees: 500,
      budget: 125000,
      spent: 98000,
      organizer: 'John Smith',
      client: 'Tech Corp',
      description: 'Annual technology conference',
      createdAt: '2024-01-15',
      _count: { files: 5, budgetItems: 12, activityLogs: 8 },
    },
    {
      id: '2',
      name: 'Product Launch Event',
      date: '2024-04-20',
      startDate: '2024-04-20',
      location: 'New York, NY',
      status: 'planning',
      attendees: 200,
      budget: 85000,
      spent: 12000,
      organizer: 'Sarah Johnson',
      client: 'Product Inc',
      description: 'New product launch',
      createdAt: '2024-02-01',
      _count: { files: 2, budgetItems: 8, activityLogs: 3 },
    },
    {
      id: '3',
      name: 'Annual Gala',
      date: '2024-02-28',
      startDate: '2024-02-28',
      location: 'Chicago, IL',
      status: 'active',
      attendees: 350,
      budget: 95000,
      spent: 87000,
      organizer: 'Mike Davis',
      client: 'Gala Corp',
      description: 'Annual company gala',
      createdAt: '2024-01-10',
      _count: { files: 8, budgetItems: 15, activityLogs: 12 },
    },
    {
      id: '4',
      name: 'Workshop Series',
      date: '2024-01-15',
      startDate: '2024-01-15',
      location: 'Austin, TX',
      status: 'completed',
      attendees: 150,
      budget: 45000,
      spent: 44500,
      organizer: 'Emily Chen',
      client: 'Workshop Co',
      description: 'Educational workshop series',
      createdAt: '2023-12-01',
      _count: { files: 3, budgetItems: 6, activityLogs: 5 },
    },
    {
      id: '5',
      name: 'Corporate Retreat',
      date: '2024-05-10',
      startDate: '2024-05-10',
      location: 'Denver, CO',
      status: 'planning',
      attendees: 100,
      budget: 65000,
      spent: 8000,
      organizer: 'Robert Wilson',
      client: 'Corporate Inc',
      description: 'Team building retreat',
      createdAt: '2024-02-15',
      _count: { files: 1, budgetItems: 5, activityLogs: 2 },
    },
    {
      id: '6',
      name: 'Trade Show Booth',
      date: '2024-06-05',
      startDate: '2024-06-05',
      location: 'Las Vegas, NV',
      status: 'planning',
      attendees: 1000,
      budget: 150000,
      spent: 25000,
      organizer: 'Amanda Lee',
      client: 'Trade Show Co',
      description: 'Industry trade show participation',
      createdAt: '2024-02-20',
      _count: { files: 4, budgetItems: 10, activityLogs: 4 },
    },
  ];

  return json({
    events: demoEvents,
  });
}

export default function DemoEventsRoute() {
  const { events } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const demoLayoutMatch = matches.find(m => m.id === 'routes/demo');
  const user = (demoLayoutMatch?.data as any)?.user as User | undefined;

  if (!user) {
    return <div>Loading...</div>;
  }

  return <EventsList user={user} events={events} isDemo={true} />;
}


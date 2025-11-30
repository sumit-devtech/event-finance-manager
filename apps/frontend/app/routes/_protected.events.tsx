import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useRevalidator } from "@remix-run/react";
import { useCallback, useMemo } from "react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { EventsListNew } from "~/components/EventsListNew";

export interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  venue?: string;
  attendees?: number;
  budget?: number;
  spent?: number;
  organizer?: string;
  type?: string;
  eventType?: string;
  createdBy?: string;
  assignments: Array<{
    id: string;
    role: string | null;
    user: {
      id: string;
      name: string | null;
      fullName?: string | null;
      email: string;
      role: string;
    };
  }>;
  roiMetrics?: {
    roiPercent?: number | null;
  };
  roiPercent?: number | null;
  _count: {
    files: number;
    budgetItems: number;
    activityLogs: number;
  };
}

/**
 * Loader - fetch events
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    const demoEvents: Event[] = [
      {
        id: '1',
        name: 'Annual Tech Conference 2024',
        type: 'conference',
        startDate: '2024-03-15',
        endDate: '2024-03-17',
        location: 'San Francisco, CA',
        venue: 'Moscone Center',
        attendees: 500,
        budget: 85000,
        spent: 62000,
        organizer: 'Sarah Johnson',
        client: 'Tech Corp',
        description: 'Annual technology conference featuring keynote speakers and workshops',
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-03-10',
        assignments: [],
        _count: { files: 5, budgetItems: 12, activityLogs: 8 },
      },
      {
        id: '2',
        name: 'Product Launch Event',
        type: 'launch',
        startDate: '2024-03-20',
        endDate: null,
        location: 'New York, NY',
        venue: 'Hudson Yards',
        attendees: 200,
        budget: 45000,
        spent: 12000,
        organizer: 'Mike Davis',
        client: 'Product Inc',
        description: 'Launching our new product line with media and influencers',
        status: 'planning',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-15',
        assignments: [],
        _count: { files: 2, budgetItems: 8, activityLogs: 3 },
      },
      {
        id: '3',
        name: 'Team Building Retreat',
        type: 'retreat',
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        location: 'Lake Tahoe, NV',
        venue: 'Mountain Resort',
        attendees: 50,
        budget: 25000,
        spent: 5000,
        organizer: 'Emily Chen',
        client: 'Retreat Co',
        description: 'Company-wide team building activities and workshops',
        status: 'planning',
        createdAt: '2024-01-20',
        updatedAt: '2024-02-10',
        assignments: [],
        _count: { files: 3, budgetItems: 6, activityLogs: 5 },
      },
      {
        id: '4',
        name: 'Annual Gala',
        type: 'gala',
        startDate: '2024-02-28',
        endDate: '2024-02-28',
        location: 'Chicago, IL',
        venue: 'Grand Ballroom',
        attendees: 350,
        budget: 95000,
        spent: 87000,
        organizer: 'Robert Wilson',
        client: 'Gala Corp',
        description: 'Annual company gala with dinner and entertainment',
        status: 'active',
        createdAt: '2024-01-10',
        updatedAt: '2024-02-25',
        assignments: [],
        _count: { files: 8, budgetItems: 15, activityLogs: 12 },
      },
      {
        id: '5',
        name: 'Workshop Series',
        type: 'workshop',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        location: 'Seattle, WA',
        venue: 'Convention Center',
        attendees: 150,
        budget: 45000,
        spent: 44500,
        organizer: 'Lisa Anderson',
        client: 'Workshop Co',
        description: 'Educational workshop series for team development',
        status: 'completed',
        createdAt: '2023-12-15',
        updatedAt: '2024-01-25',
        assignments: [],
        _count: { files: 4, budgetItems: 10, activityLogs: 6 },
      },
      {
        id: '6',
        name: 'Summer Networking Mixer',
        type: 'networking',
        startDate: '2024-06-15',
        endDate: null,
        location: 'Miami, FL',
        venue: 'Beachfront Hotel',
        attendees: 120,
        budget: 30000,
        spent: 5000,
        organizer: 'David Martinez',
        client: 'Network Pro',
        description: 'Networking event for industry professionals',
        status: 'planning',
        createdAt: '2024-02-20',
        updatedAt: '2024-02-20',
        assignments: [],
        _count: { files: 1, budgetItems: 5, activityLogs: 2 },
      },
      {
        id: '7',
        name: 'Client Appreciation Dinner',
        type: 'dinner',
        startDate: '2024-04-10',
        endDate: '2024-04-10',
        location: 'Boston, MA',
        venue: 'Fine Dining Restaurant',
        attendees: 80,
        budget: 35000,
        spent: 15000,
        organizer: 'Jennifer Lee',
        client: 'Client Relations',
        description: 'Exclusive dinner for top clients',
        status: 'active',
        createdAt: '2024-02-15',
        updatedAt: '2024-03-05',
        assignments: [],
        _count: { files: 3, budgetItems: 7, activityLogs: 4 },
      },
      {
        id: '8',
        name: 'Training Seminar',
        type: 'seminar',
        startDate: '2024-03-25',
        endDate: '2024-03-25',
        location: 'Austin, TX',
        venue: 'Training Center',
        attendees: 100,
        budget: 28000,
        spent: 18000,
        organizer: 'Michael Brown',
        client: 'Training Solutions',
        description: 'Professional development training session',
        status: 'active',
        createdAt: '2024-02-05',
        updatedAt: '2024-03-15',
        assignments: [],
        _count: { files: 2, budgetItems: 6, activityLogs: 3 },
      },
      {
        id: '9',
        name: 'Charity Fundraiser',
        type: 'fundraiser',
        startDate: '2024-05-20',
        endDate: '2024-05-20',
        location: 'Los Angeles, CA',
        venue: 'Event Hall',
        attendees: 250,
        budget: 60000,
        spent: 8000,
        organizer: 'Patricia Garcia',
        client: 'Charity Foundation',
        description: 'Annual charity fundraising event',
        status: 'planning',
        createdAt: '2024-03-01',
        updatedAt: '2024-03-20',
        assignments: [],
        _count: { files: 4, budgetItems: 11, activityLogs: 5 },
      },
      {
        id: '10',
        name: 'Industry Summit',
        type: 'summit',
        startDate: '2024-04-05',
        endDate: '2024-04-07',
        location: 'Las Vegas, NV',
        venue: 'Convention Center',
        attendees: 800,
        budget: 150000,
        spent: 95000,
        organizer: 'James Taylor',
        client: 'Summit Organizers',
        description: 'Multi-day industry summit with panels and networking',
        status: 'active',
        createdAt: '2024-01-20',
        updatedAt: '2024-03-28',
        assignments: [],
        _count: { files: 7, budgetItems: 18, activityLogs: 10 },
      },
    ];

    return json({ events: demoEvents, user: null as any });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
    });
    return json({ events: events || [], user });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    // Return empty array on error instead of failing
    return json({ events: [], user });
  }
}

/**
 * Action - handle event updates (status, budget items, etc.)
 */
export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  if (isDemo) {
    // In demo mode, just return success
    return json({ success: true, message: "Demo mode: Changes are not saved" });
  }

  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "updateStatus") {
      const eventId = formData.get("eventId") as string;
      const status = formData.get("status") as string;

      if (!eventId || !status) {
        return json({ success: false, error: "Missing eventId or status" }, { status: 400 });
      }

      const updatedEvent = await api.put(`/events/${eventId}`, { status }, {
        token: token || undefined,
      });

      return json({ success: true, message: "Event status updated", event: updatedEvent });
    }

    // Budget item operations
    if (intent === "createBudgetItem") {
      const eventId = formData.get("eventId") as string;
      if (!eventId) {
        return json({ success: false, error: 'Event ID is required' }, { status: 400 });
      }

      const category = formData.get("category") as string;
      if (!category) {
        return json({ success: false, error: 'Category is required' }, { status: 400 });
      }

      const description = formData.get("description") as string;
      if (!description) {
        return json({ success: false, error: 'Description is required' }, { status: 400 });
      }

      const estimatedCostStr = formData.get("estimatedCost") as string;
      const actualCostStr = formData.get("actualCost") as string;
      const vendor = formData.get("vendor") as string;

      const payload: any = {
        category,
        description,
      };

      if (estimatedCostStr) {
        const estimatedCost = parseFloat(estimatedCostStr);
        if (!isNaN(estimatedCost) && estimatedCost >= 0) {
          payload.estimatedCost = estimatedCost;
        }
      }

      if (actualCostStr) {
        const actualCost = parseFloat(actualCostStr);
        if (!isNaN(actualCost) && actualCost >= 0) {
          payload.actualCost = actualCost;
        }
      }

      if (vendor && vendor.trim()) {
        payload.vendor = vendor.trim();
      }

      await api.post(
        `/events/${eventId}/budget-items`,
        payload,
        { token: token || undefined }
      );

      return json({ success: true, message: 'Budget item created successfully' });
    }

    if (intent === "updateBudgetItem") {
      const budgetItemId = formData.get("budgetItemId") as string;
      if (!budgetItemId) {
        return json({ success: false, error: 'Budget item ID is required' }, { status: 400 });
      }

      const payload: any = {};

      const category = formData.get("category") as string;
      if (category) payload.category = category;

      const description = formData.get("description") as string;
      if (description) payload.description = description;

      const estimatedCostStr = formData.get("estimatedCost") as string;
      if (estimatedCostStr) {
        const estimatedCost = parseFloat(estimatedCostStr);
        if (!isNaN(estimatedCost) && estimatedCost >= 0) {
          payload.estimatedCost = estimatedCost;
        }
      }

      const actualCostStr = formData.get("actualCost") as string;
      if (actualCostStr) {
        const actualCost = parseFloat(actualCostStr);
        if (!isNaN(actualCost) && actualCost >= 0) {
          payload.actualCost = actualCost;
        }
      }

      const vendor = formData.get("vendor") as string;
      if (vendor !== null) {
        payload.vendor = vendor.trim() || null;
      }

      await api.put(
        `/budget-items/${budgetItemId}`,
        payload,
        { token: token || undefined }
      );

      return json({ success: true, message: 'Budget item updated successfully' });
    }

    if (intent === "deleteBudgetItem") {
      const budgetItemId = formData.get("budgetItemId") as string;
      if (!budgetItemId) {
        return json({ success: false, error: 'Budget item ID is required' }, { status: 400 });
      }

      await api.delete(`/budget-items/${budgetItemId}`, {
        token: token || undefined,
      });

      return json({ success: true, message: 'Budget item deleted successfully' });
    }

    // Bulk actions
    if (intent === "bulkArchive") {
      const eventIds = formData.get("eventIds") as string;
      if (!eventIds) {
        return json({ success: false, error: 'Event IDs are required' }, { status: 400 });
      }

      const ids = JSON.parse(eventIds);
      // TODO: Implement bulk archive via API
      // For now, update status to cancelled as a placeholder
      await Promise.all(
        ids.map((id: string) =>
          api.put(`/events/${id}`, { status: 'Cancelled' }, { token: token || undefined })
        )
      );

      return json({ success: true, message: `${ids.length} event(s) archived successfully` });
    }

    if (intent === "bulkDuplicate") {
      const eventIds = formData.get("eventIds") as string;
      if (!eventIds) {
        return json({ success: false, error: 'Event IDs are required' }, { status: 400 });
      }

      const ids = JSON.parse(eventIds);
      // TODO: Implement bulk duplicate via API
      // This would require fetching each event and creating a copy
      return json({ success: false, error: 'Bulk duplicate not yet implemented' }, { status: 501 });
    }

    if (intent === "bulkExport") {
      const eventIds = formData.get("eventIds") as string;
      if (!eventIds) {
        return json({ success: false, error: 'Event IDs are required' }, { status: 400 });
      }

      const ids = JSON.parse(eventIds);
      // TODO: Implement bulk export via API
      // This would generate a CSV/Excel file with event data
      return json({ success: false, error: 'Bulk export not yet implemented' }, { status: 501 });
    }

    // Delete event
    if (intent === "deleteEvent") {
      const eventId = formData.get("eventId") as string;
      if (!eventId) {
        return json({ success: false, error: 'Event ID is required' }, { status: 400 });
      }

      await api.delete(`/events/${eventId}`, {
        token: token || undefined,
      });

      return json({ success: true, message: 'Event deleted successfully' });
    }

    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in events action:", error);
    const errorMessage = error?.message || error?.error || 'An error occurred';
    return json(
      { success: false, error: errorMessage },
      { status: error?.statusCode || 500 }
    );
  }
}

export default function EventsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const events = loaderData?.events || [];
  const user = loaderData?.user;
  const [searchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const isDemo = searchParams.get('demo') === 'true';

  // Memoize the refresh callback to prevent infinite loops
  const handleRefresh = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  // Transform events to match the expected format - memoize to prevent unnecessary re-renders
  const transformedEvents = useMemo(() => {
    return events.map(event => {
      // Get owner from assignments or createdBy
      const owner = event.assignments?.[0]?.user?.name || 
                    event.assignments?.[0]?.user?.fullName || 
                    event.organizer || 
                    user?.name || 
                    'Unassigned';
      
      // Extract region from location (simple heuristic: take part after comma)
      const region = event.location ? (event.location.includes(',') ? event.location.split(',')[1]?.trim() : event.location) : null;
      
      return {
        id: event.id,
        name: event.name,
        type: event.type || event.eventType || 'conference',
        eventType: event.eventType || event.type || 'conference',
        date: event.startDate || '',
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location || 'TBD',
        region: region,
        venue: event.venue || '',
        attendees: event.attendees || 0,
        budget: event.budget || 0,
        spent: event.spent || 0,
        organizer: event.organizer || owner,
        owner: owner,
        createdBy: event.createdBy,
        status: event.status?.toLowerCase() || 'planning',
        description: event.description || '',
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        roiPercent: event.roiMetrics?.roiPercent || event.roiPercent || null,
        assignments: event.assignments || [],
      };
    });
  }, [events, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <EventsListNew
        user={user}
        organization={undefined}
        isDemo={isDemo}
        events={transformedEvents}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

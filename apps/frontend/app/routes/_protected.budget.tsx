import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useRevalidator, useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { BudgetManager } from "~/components/BudgetManager";

interface LoaderData {
  user: User | null;
  events: any[];
  budgetItems: any[];
  budgetVersions: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    const demoEvents = [
      { id: '1', name: 'Annual Tech Conference 2024' },
      { id: '2', name: 'Product Launch Event' },
      { id: '3', name: 'Annual Gala' },
      { id: '4', name: 'Workshop Series' },
      { id: '5', name: 'Summer Networking Mixer' },
      { id: '6', name: 'Client Appreciation Dinner' },
      { id: '7', name: 'Training Seminar' },
      { id: '8', name: 'Charity Fundraiser' },
      { id: '9', name: 'Industry Summit' },
    ];

    const demoBudgetVersions = [
      { id: 'v1', name: 'Initial Budget', date: '2024-01-15', status: 'draft' },
      { id: 'v2', name: 'Revised Budget', date: '2024-02-01', status: 'final' },
      { id: 'v3', name: 'Current Working', date: '2024-02-15', status: 'draft' },
      { id: 'v4', name: 'Q2 Budget Update', date: '2024-03-01', status: 'draft' },
      { id: 'v5', name: 'Final Approved Budget', date: '2024-03-10', status: 'final' },
    ];

    const demoBudgetItems = [
      { id: 1, category: 'Venue', description: 'Conference Hall Rental', vendor: 'Grand Convention Center', estimatedCost: 45000, actualCost: 45000, status: 'confirmed' },
      { id: 2, category: 'Catering', description: 'Lunch & Refreshments (500 pax)', vendor: 'Premium Catering Co.', estimatedCost: 25000, actualCost: 24000, status: 'confirmed' },
      { id: 3, category: 'Marketing', description: 'Digital Marketing Campaign', vendor: 'AdTech Solutions', estimatedCost: 15000, actualCost: 12000, status: 'partial' },
      { id: 4, category: 'Entertainment', description: 'Keynote Speaker Fee', vendor: 'Speaker Bureau Inc.', estimatedCost: 20000, actualCost: 20000, status: 'confirmed' },
      { id: 5, category: 'Technology', description: 'AV Equipment & Setup', vendor: 'Tech Events Pro', estimatedCost: 12000, actualCost: 10500, status: 'confirmed' },
      { id: 6, category: 'Staffing', description: 'Event Staff (20 people)', vendor: 'EventStaff Plus', estimatedCost: 8000, actualCost: 7200, status: 'confirmed' },
      { id: 7, category: 'Transportation', description: 'Shuttle Service', vendor: 'Transport Co', estimatedCost: 5000, actualCost: 4800, status: 'confirmed' },
      { id: 8, category: 'Decorations', description: 'Event Decor & Signage', vendor: 'Design Studio', estimatedCost: 8000, actualCost: 0, status: 'pending' },
      { id: 9, category: 'Photography', description: 'Event Photography & Videography', vendor: 'Photo Pro', estimatedCost: 6000, actualCost: 6000, status: 'confirmed' },
      { id: 10, category: 'Security', description: 'Security Services', vendor: 'Secure Events', estimatedCost: 4000, actualCost: 4000, status: 'confirmed' },
      { id: 11, category: 'Insurance', description: 'Event Insurance', vendor: 'Insurance Co', estimatedCost: 3000, actualCost: 3000, status: 'confirmed' },
      { id: 12, category: 'Printing', description: 'Name Tags & Programs', vendor: 'Print Shop', estimatedCost: 2000, actualCost: 1800, status: 'confirmed' },
      { id: 13, category: 'Entertainment', description: 'Live Band Performance', vendor: 'Entertainment Plus', estimatedCost: 8000, actualCost: 0, status: 'pending' },
      { id: 14, category: 'Marketing', description: 'Social Media Influencer Campaign', vendor: 'Influencer Agency', estimatedCost: 10000, actualCost: 0, status: 'pending' },
      { id: 15, category: 'Technology', description: 'Event App Development', vendor: 'App Developers', estimatedCost: 15000, actualCost: 12000, status: 'partial' },
    ];

    return json<LoaderData>({
      user: null as any,
      events: demoEvents,
      budgetVersions: demoBudgetVersions,
      budgetItems: demoBudgetItems,
    });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');

    // OPTIMIZE: Fetch events and budget items in parallel
    const [eventsResult, budgetItemsResult] = await Promise.allSettled([
      api.get<any[]>("/events?limit=20", {
        token: token || undefined,
      }),
      eventId ? api.get<any[]>(`/events/${eventId}/budget-items`, {
        token: token || undefined,
      }).catch(() => []) : Promise.resolve([]),
    ]);

    const events = eventsResult.status === 'fulfilled' ? (eventsResult.value || []) : [];
    const budgetItems: any[] = [];
    const budgetVersions: any[] = [];

    // If no eventId specified, use first event
    const selectedEventId = eventId || (events && events.length > 0 ? events[0].id : null);
    
    if (selectedEventId && budgetItemsResult.status === 'fulfilled') {
      const items = budgetItemsResult.value;
      if (Array.isArray(items)) {
        budgetItems.push(...items);
      }
    } else if (selectedEventId && !eventId) {
      // If no eventId in query but we have events, fetch budget items for first event
      try {
        const items = await api.get<any[]>(`/events/${selectedEventId}/budget-items`, {
          token: token || undefined,
        });
        if (Array.isArray(items)) {
          budgetItems.push(...items);
        }
      } catch {
        // Budget items may not exist for this event
      }
    }

    return json<LoaderData>({ 
      user, 
      events: events || [], 
      budgetItems: budgetItems || [],
      budgetVersions: budgetVersions || []
    });
  } catch (error: any) {
    console.error("Error fetching budget data:", error);
    return json<LoaderData>({ 
      user, 
      events: [], 
      budgetItems: [],
      budgetVersions: []
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  if (isDemo) {
    return json({ success: true, message: 'Demo mode: Changes not saved' });
  }

  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
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

    return json({ success: false, error: 'Invalid intent' }, { status: 400 });
  } catch (error: any) {
    console.error("Budget action error:", error);
    const errorMessage = error?.message || error?.error || 'An error occurred';
    return json(
      { success: false, error: errorMessage },
      { status: error?.statusCode || 500 }
    );
  }
}

export default function BudgetRoute() {
  const { user, events, budgetItems, budgetVersions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const isDemo = searchParams.get('demo') === 'true';
  const eventId = searchParams.get('eventId');

  // Budget items are already filtered by eventId from the API, so no need to filter again
  // But we can still filter if eventId is in the query and items have eventId field
  const filteredBudgetItems = budgetItems || [];

  // Get the selected event or first event
  const selectedEvent = eventId 
    ? events.find((e: any) => e.id === eventId) || events[0]
    : events[0];

  // Reload data after successful actions (same pattern as events route)
  useEffect(() => {
    if (actionData?.success) {
      const timer = setTimeout(() => {
        revalidator.revalidate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [actionData, revalidator]);

  // Event selector handler
  const handleEventChange = (newEventId: string) => {
    const params = new URLSearchParams(searchParams);
    if (newEventId) {
      params.set('eventId', newEventId);
    } else {
      params.delete('eventId');
    }
    setSearchParams(params);
    // Don't call revalidator here - setSearchParams will trigger a re-render and loader will run
  };

  // If no event is selected and we have events, show a message or select first
  if (!selectedEvent && events.length > 0 && !isDemo) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Manager</h2>
          <p className="text-gray-600 mt-1">Please select an event to manage its budget</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600">Available events:</p>
          <ul className="mt-2 space-y-2">
            {events.map((event: any) => (
              <li key={event.id}>
                <a href={`/budget?eventId=${event.id}`} className="text-blue-600 hover:underline">
                  {event.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      {events.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event to Manage Budget
          </label>
          <select
            value={eventId || (selectedEvent?.id || '')}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select an event --</option>
            {events.map((event: any) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          {selectedEvent && (
            <p className="text-sm text-gray-600 mt-2">
              Managing budget for: <span className="font-medium">{selectedEvent.name}</span>
            </p>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {actionData?.success && actionData.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {actionData.message}
        </div>
      )}
      {actionData && !actionData.success && actionData.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {actionData.error}
        </div>
      )}

      <BudgetManager 
        user={user} 
        organization={undefined} 
        event={selectedEvent} 
        budgetItems={filteredBudgetItems}
        isDemo={isDemo}
      />
    </div>
  );
}

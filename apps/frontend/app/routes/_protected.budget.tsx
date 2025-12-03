import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useRevalidator, useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import type { User } from "~/lib/auth";
import { BudgetManager } from "~/components/budget";
import { demoBudgetEvents, demoBudgetVersions, demoBudgetItems } from "~/lib/demoData";
import type { EventWithDetails, BudgetItemWithRelations, StrategicGoalType, VendorWithStats, UserWithCounts } from "~/types";
import { Dropdown } from "~/components/shared";

interface BudgetEvent {
  id: string;
  name: string;
}

interface BudgetVersion {
  id: string;
  name: string;
  date: string;
  status: string;
}

interface LoaderData {
  user: User | null;
  events: BudgetEvent[];
  budgetItems: BudgetItemWithRelations[];
  budgetVersions: BudgetVersion[];
  users: UserWithCounts[];
  strategicGoals?: StrategicGoalType[];
  vendors?: VendorWithStats[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    return json<LoaderData>({
      user: null as any,
      events: demoBudgetEvents,
      budgetVersions: demoBudgetVersions,
      budgetItems: demoBudgetItems as unknown as BudgetItemWithRelations[],
      users: [], // Demo mode doesn't need users
    });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');

    // Fetch events, users, and vendors in parallel
    const [eventsResult, usersResult, vendorsResult] = await Promise.allSettled([
      api.get<BudgetEvent[]>("/events?limit=100", {
        token: token || undefined,
      }),
      api.get<UserWithCounts[]>("/users", {
        token: token || undefined,
      }),
      api.get<VendorWithStats[]>("/vendors", {
        token: token || undefined,
      }),
    ]);

    const events = eventsResult.status === 'fulfilled' ? (eventsResult.value || []) : [];
    const users = usersResult.status === 'fulfilled' ? (usersResult.value || []) : [];
    const vendors = vendorsResult.status === 'fulfilled' ? (vendorsResult.value || []) : [];
    const budgetItems: BudgetItemWithRelations[] = [];
    const budgetVersions: BudgetVersion[] = [];
    let strategicGoals: StrategicGoalType[] = [];

    // Fetch strategic goals and budget items in parallel if eventId is specified
    if (eventId) {
      const [strategicGoalsResult, budgetItemsResult] = await Promise.allSettled([
        api.get<StrategicGoalType[]>(`/events/${eventId}/strategic-goals`, {
          token: token || undefined,
        }),
        api.get<BudgetItemWithRelations[]>(`/events/${eventId}/budget-items`, {
          token: token || undefined,
        }),
      ]);

      strategicGoals = strategicGoalsResult.status === 'fulfilled' ? (strategicGoalsResult.value || []) : [];
      const items = budgetItemsResult.status === 'fulfilled' && Array.isArray(budgetItemsResult.value) 
        ? budgetItemsResult.value 
        : [];
      
      // Add eventId to each item for grouping
      items.forEach(item => {
        budgetItems.push({ ...item, eventId });
      });
    } else {
      // If no eventId specified, fetch budget items for ALL events
      const budgetItemsResults = await Promise.allSettled(
        events.map((event) =>
          api.get<BudgetItemWithRelations[]>(`/events/${event.id}/budget-items`, {
            token: token || undefined,
          }).catch((err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            console.warn(`Could not fetch budget items for event ${event.id}:`, errorMessage);
            return [];
          })
        )
      );

      // Combine all budget items from all events
      budgetItemsResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          result.value.forEach((item) => {
            // Add eventId to each item for grouping
            budgetItems.push({ ...item, eventId: events[index]?.id });
          });
        }
      });
    }

    return json<LoaderData>({ 
      user, 
      events: events || [], 
      budgetItems: budgetItems || [],
      budgetVersions: budgetVersions || [],
      users: users || [],
      strategicGoals: strategicGoals || [],
      vendors: vendors || []
    });
  } catch (error: any) {
    console.error("Error fetching budget data:", error);
    return json<LoaderData>({ 
      user, 
      events: [], 
      budgetItems: [],
      budgetVersions: [],
      users: [],
      strategicGoals: [],
      vendors: []
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
      const subcategory = formData.get("subcategory") as string;
      const status = formData.get("status") as string;
      const notes = formData.get("notes") as string;
      const assignedUser = formData.get("assignedUser") as string;
      const strategicGoalId = formData.get("strategicGoalId") as string;

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

      const vendorId = formData.get("vendorId") as string;
      if (vendorId && vendorId.trim()) {
        payload.vendorId = vendorId.trim();
      }

      if (subcategory !== null && subcategory !== undefined) {
        payload.subcategory = subcategory.trim() || null;
      }

      if (status) {
        payload.status = status;
      }

      if (notes !== null && notes !== undefined) {
        payload.notes = notes.trim() || null;
      }

      if (assignedUser !== null && assignedUser !== undefined && assignedUser.trim()) {
        payload.assignedUserId = assignedUser.trim();
      }

      if (strategicGoalId !== null && strategicGoalId !== undefined && strategicGoalId.trim()) {
        payload.strategicGoalId = strategicGoalId.trim();
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

      const payload: {
        category?: string;
        description?: string;
        subcategory?: string | null;
        status?: string;
        notes?: string | null;
        assignedUserId?: string | null;
        strategicGoalId?: string | null;
        estimatedCost?: number;
        actualCost?: number;
        vendor?: string | null;
      } = {};

      const category = formData.get("category") as string;
      if (category) payload.category = category;

      const description = formData.get("description") as string;
      if (description) payload.description = description;

      const subcategory = formData.get("subcategory") as string;
      if (subcategory !== null) {
        payload.subcategory = subcategory.trim() || null;
      }

      const status = formData.get("status") as string;
      if (status) payload.status = status;

      const notes = formData.get("notes") as string;
      if (notes !== null) {
        payload.notes = notes.trim() || null;
      }

      const assignedUser = formData.get("assignedUser") as string;
      if (assignedUser !== null) {
        payload.assignedUserId = assignedUser.trim() || null;
      }

      const strategicGoalId = formData.get("strategicGoalId") as string;
      if (strategicGoalId !== null) {
        payload.strategicGoalId = strategicGoalId.trim() || null;
      }

      const estimatedCostStr = formData.get("estimatedCost") as string;
      if (estimatedCostStr !== null && estimatedCostStr !== '') {
        const estimatedCost = parseFloat(estimatedCostStr);
        if (!isNaN(estimatedCost) && estimatedCost >= 0) {
          payload.estimatedCost = estimatedCost;
        }
      }

      const actualCostStr = formData.get("actualCost") as string;
      if (actualCostStr !== null && actualCostStr !== '') {
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as { error?: string })?.error || 'An error occurred';
    const statusCode = (error as { statusCode?: number })?.statusCode || 500;
    console.error("Budget action error:", errorMessage);
    return json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

export default function BudgetRoute() {
  const { user, events, budgetItems, budgetVersions, users, strategicGoals, vendors = [] } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const isDemo = searchParams.get('demo') === 'true';
  const eventId = searchParams.get('eventId');

  // Filter budget items by eventId if one is selected
  const filteredBudgetItems = eventId 
    ? (budgetItems || []).filter((item: any) => item.eventId === eventId)
    : (budgetItems || []);

  // Get the selected event
  const selectedEvent = eventId 
    ? events.find((e: any) => e.id === eventId)
    : null;

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

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      {events.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Event
          </label>
          <Dropdown
            value={eventId || ''}
            onChange={handleEventChange}
            options={[
              { value: '', label: 'All Events' },
              ...events.map((event: BudgetEvent) => ({
                value: event.id,
                label: event.name,
              })),
            ]}
            placeholder="Select event"
            className="w-full sm:w-auto min-w-[200px]"
          />
          {selectedEvent ? (
            <p className="text-sm text-gray-600 mt-2">
              Showing budget for: <span className="font-medium">{selectedEvent.name}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-2">
              Showing budgets for all events ({filteredBudgetItems.length} items)
            </p>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {actionData?.success && 'message' in actionData && actionData.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {actionData.message}
        </div>
      )}
      {actionData && !actionData.success && 'error' in actionData && actionData.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {actionData.error}
        </div>
      )}

      <BudgetManager 
        user={user} 
        organization={undefined} 
        event={selectedEvent} 
        events={events}
        budgetItems={filteredBudgetItems as unknown as BudgetItemWithRelations[]}
        users={users as unknown as UserWithCounts[]}
        strategicGoals={(strategicGoals || []) as unknown as StrategicGoalType[]}
        vendors={vendors as unknown as VendorWithStats[]}
        isDemo={isDemo}
        actionData={actionData}
      />
    </div>
  );
}

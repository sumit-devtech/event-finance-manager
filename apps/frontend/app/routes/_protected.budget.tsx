import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useRevalidator, useActionData, useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
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

      // Always include subcategory, even if empty (to allow clearing the field)
      if (subcategory !== null && subcategory !== undefined) {
        payload.subcategory = subcategory.trim() || null;
      }

      if (status) {
        payload.status = status;
      }

      // Always include notes, even if empty (to allow clearing the field)
      if (notes !== null && notes !== undefined) {
        payload.notes = notes.trim() || null;
      }

      // Always include assignedUserId, even if empty (to allow clearing the field)
      if (assignedUser !== null && assignedUser !== undefined) {
        payload.assignedUserId = assignedUser.trim() || null;
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
        vendorId?: string | null;
      } = {};

      const category = formData.get("category") as string;
      if (category) payload.category = category;

      const description = formData.get("description") as string;
      if (description) payload.description = description;

      // FIELD 1: subcategory - ALWAYS include in payload (backend checks !== undefined)
      const subcategoryValue = formData.get("subcategory");
      payload.subcategory = (subcategoryValue && String(subcategoryValue).trim()) ? String(subcategoryValue).trim() : null;

      // Always include status in payload - required for status updates
      const status = formData.get("status") as string;
      if (status) payload.status = status;

      // FIELD 2: notes - ALWAYS include in payload (backend checks !== undefined)
      const notesValue = formData.get("notes");
      payload.notes = (notesValue && String(notesValue).trim()) ? String(notesValue).trim() : null;

      // FIELD 3: assignedUserId - ALWAYS include in payload (backend checks !== undefined)
      const assignedUserValue = formData.get("assignedUser");
      payload.assignedUserId = (assignedUserValue && String(assignedUserValue).trim()) ? String(assignedUserValue).trim() : null;

      // FIELD 4: strategicGoalId - ALWAYS include in payload (backend checks !== undefined)
      const strategicGoalIdValue = formData.get("strategicGoalId");
      payload.strategicGoalId = (strategicGoalIdValue && String(strategicGoalIdValue).trim()) ? String(strategicGoalIdValue).trim() : null;

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

      // FIELD 5: vendorId - ALWAYS include in payload (backend checks !== undefined)
      const vendorIdValue = formData.get("vendorId");
      payload.vendorId = (vendorIdValue && String(vendorIdValue).trim()) ? String(vendorIdValue).trim() : null;

      const vendorValue = formData.get("vendor");
      payload.vendor = (vendorValue && String(vendorValue).trim()) ? String(vendorValue).trim() : null;

      // Debug: Log payload to verify all fields are included
      console.log('Budget item update payload:', JSON.stringify(payload, null, 2));

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

    if (intent === "approveBudgetItem" || intent === "rejectBudgetItem") {
      const budgetItemId = formData.get("budgetItemId") as string;
      const comments = formData.get("comments") as string || undefined;

      if (!budgetItemId) {
        return json({ success: false, error: "Budget item ID is required" }, { status: 400 });
      }

      const action = intent === "approveBudgetItem" ? "approve" : "reject";

      try {
        await api.post(`/budget-items/${budgetItemId}/approve`, {
          action,
          comments,
        }, {
          token: token || undefined,
        });

        return json({
          success: true,
          message: `Budget item ${action === "approve" ? "approved" : "rejected"} successfully`
        });
      } catch (error: any) {
        const errorMessage = error?.message || error?.error || "Failed to approve/reject budget item";
        console.error("Budget item approval error:", error);
        return json(
          { success: false, error: errorMessage },
          { status: error?.statusCode || 500 }
        );
      }
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
  const fetcher = useFetcher();
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

  // Track previous fetcher state to detect transitions
  const prevFetcherStateRef = useRef<string>(fetcher.state);

  // Reload data after successful actions (same pattern as events route)
  useEffect(() => {
    if (actionData?.success) {
      revalidator.revalidate();
    }
  }, [actionData, revalidator]);

  // Revalidate data when fetcher completes successfully (for approve/reject actions)
  // This handles fetcher.submit() responses (approve/reject budget items)
  useEffect(() => {
    // Only revalidate when transitioning from submitting to idle (action just completed)
    const wasSubmitting = prevFetcherStateRef.current === "submitting";
    const isNowIdle = fetcher.state === "idle";

    // Update the ref for next comparison
    prevFetcherStateRef.current = fetcher.state;

    if (wasSubmitting && isNowIdle) {
      const fetcherData = fetcher.data as { error?: string; success?: boolean; message?: string } | undefined;

      // If there's an error, don't revalidate
      if (fetcherData?.error) {
        return;
      }

      // Success - revalidate to refresh the budget items list
      if (fetcherData?.success) {
        revalidator.revalidate();
      }
    }
  }, [fetcher.state, fetcher.data, revalidator]);

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
        fetcher={fetcher}
      />
    </div>
  );
}

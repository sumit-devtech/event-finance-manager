import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useRevalidator, useActionData } from "@remix-run/react";
import { useCallback, useMemo, useEffect } from "react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import { EventsListNew } from "~/components/EventsListNew";
import { demoEvents } from "~/lib/demoData";
import type { EventWithDetails, VendorWithStats } from "~/types";

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
    return json({ events: demoEvents, vendors: [], user: null as any });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const events = await api.get<Event[]>("/events", {
      token: token || undefined,
    });
    // Fetch vendors for dropdowns
    let vendors: any[] = [];
    try {
      vendors = await api.get<any[]>("/vendors", { token: token || undefined });
    } catch {
      // Vendors endpoint might fail, return empty array
      vendors = [];
    }
    return json({ events: events || [], vendors, user });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    // Return empty array on error instead of failing
    return json({ events: [], vendors: [], user });
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

    // Create event
    if (intent === "create") {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const location = formData.get("location") as string;
      const venue = formData.get("venue") as string;
      const client = formData.get("client") as string;
      const organizer = formData.get("organizer") as string;
      const eventType = formData.get("type") as string;
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;
      const status = formData.get("status") as string;
      const attendeesStr = formData.get("attendees") as string;
      const budgetStr = formData.get("budget") as string;

      if (!name) {
        return json({ success: false, error: 'Event name is required' }, { status: 400 });
      }

      const payload: any = {
        name,
        description: description || null,
        location: location || null,
        venue: venue || null,
        client: client || null,
        organizer: organizer || null,
        eventType: eventType || null,
        type: eventType || null,
        startDate: startDate || null,
        endDate: endDate || null,
        status: status || 'Planning',
      };

      if (attendeesStr) {
        const attendees = parseInt(attendeesStr);
        if (!isNaN(attendees) && attendees >= 0) {
          payload.attendees = attendees;
        }
      }

      if (budgetStr) {
        const budget = parseFloat(budgetStr);
        if (!isNaN(budget) && budget >= 0) {
          payload.budget = budget;
        }
      }

      try {
        await api.post("/events", payload, {
          token: token || undefined,
        });

        return json({ success: true, message: 'Event created successfully' });
      } catch (error: any) {
        console.error("Error creating event:", error);
        const errorMessage = error?.message || error?.error || 'Failed to create event. Please try again.';
        return json({ success: false, error: errorMessage }, { status: error?.statusCode || 500 });
      }
    }

    // Update event
    if (intent === "update") {
      const eventId = formData.get("eventId") as string;
      if (!eventId) {
        return json({ success: false, error: 'Event ID is required' }, { status: 400 });
      }

      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const location = formData.get("location") as string;
      const venue = formData.get("venue") as string;
      const client = formData.get("client") as string;
      const organizer = formData.get("organizer") as string;
      const eventType = formData.get("type") as string;
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;
      const status = formData.get("status") as string;
      const attendeesStr = formData.get("attendees") as string;
      const budgetStr = formData.get("budget") as string;

      const payload: any = {};

      if (name) payload.name = name;
      if (description !== null) payload.description = description || null;
      if (location !== null) payload.location = location || null;
      if (venue !== null) payload.venue = venue || null;
      if (client !== null) payload.client = client || null;
      if (organizer !== null) payload.organizer = organizer || null;
      if (eventType !== null) {
        payload.eventType = eventType || null;
        payload.type = eventType || null;
      }
      if (startDate !== null) payload.startDate = startDate || null;
      if (endDate !== null) payload.endDate = endDate || null;
      if (status) payload.status = status;

      if (attendeesStr !== null && attendeesStr !== '') {
        const attendees = parseInt(attendeesStr);
        if (!isNaN(attendees) && attendees >= 0) {
          payload.attendees = attendees;
        }
      }

      if (budgetStr !== null && budgetStr !== '') {
        const budget = parseFloat(budgetStr);
        if (!isNaN(budget) && budget >= 0) {
          payload.budget = budget;
        }
      }

      try {
        await api.put(`/events/${eventId}`, payload, {
          token: token || undefined,
        });

        return json({ success: true, message: 'Event updated successfully' });
      } catch (error: any) {
        console.error("Error updating event:", error);
        const errorMessage = error?.message || error?.error || 'Failed to update event. Please try again.';
        return json({ success: false, error: errorMessage }, { status: error?.statusCode || 500 });
      }
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

    // Expense operations
    if (intent === "createExpense") {
      const category = formData.get("category") as string;
      const title = formData.get("title") as string;
      const amountStr = formData.get("amount") as string;
      const eventId = formData.get("eventId") as string;

      // Validate required fields
      if (!category) {
        return json({ success: false, error: "Category is required" }, { status: 400 });
      }
      if (!title || !title.trim()) {
        return json({ success: false, error: "Title is required" }, { status: 400 });
      }
      if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) < 0) {
        return json({ success: false, error: "Valid amount is required" }, { status: 400 });
      }
      if (!eventId) {
        return json({ success: false, error: "Event ID is required" }, { status: 400 });
      }

      const expenseData: any = {
        eventId: eventId,
        category: category,
        title: title.trim(),
        amount: parseFloat(amountStr),
      };

      const description = formData.get("description") as string;
      if (description && description.trim()) {
        expenseData.description = description.trim();
      }

      const vendor = formData.get("vendor") as string;
      if (vendor && vendor.trim()) {
        expenseData.vendor = vendor.trim();
      }

      // Create the expense first
      const newExpense = await api.post("/expenses", expenseData, { token: token || undefined }) as { id: string };

      // Upload file if provided
      const file = formData.get("file") as File | null;
      if (file && newExpense.id) {
        try {
          await api.upload(`/expenses/${newExpense.id}/files`, file, {}, { token: token || undefined });
        } catch (fileError: any) {
          console.error("Error uploading expense file:", fileError);
          // Don't fail the entire request if file upload fails
        }
      }

      return json({ success: true, message: "Expense created successfully" });
    }

    if (intent === "approveExpense" || intent === "rejectExpense") {
      const expenseId = formData.get("expenseId") as string;
      const comments = formData.get("comments") as string || undefined;

      if (!expenseId) {
        return json({ success: false, error: "Expense ID is required" }, { status: 400 });
      }

      await api.post(`/expenses/${expenseId}/approve`, {
        action: intent === "approveExpense" ? "approve" : "reject",
        comments,
      }, { token: token || undefined });

      return json({ success: true, message: `Expense ${intent === "approveExpense" ? "approved" : "rejected"} successfully` });
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
  const vendors = loaderData.vendors || [];
  const actionData = useActionData<typeof action>();
  const events = loaderData?.events || [];
  const user = loaderData?.user;
  const [searchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const isDemo = searchParams.get('demo') === 'true';

  // Reload data after successful actions
  useEffect(() => {
    if (actionData?.success) {
      const timer = setTimeout(() => {
        revalidator.revalidate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [actionData, revalidator]);

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
      
      const eventData = event as any;
      return {
        id: event.id,
        name: event.name,
        type: eventData.type || eventData.eventType || 'conference',
        eventType: eventData.eventType || eventData.type || 'conference',
        date: event.startDate || '',
        startDate: event.startDate,
        endDate: event.endDate,
        location: eventData.location || 'TBD',
        region: region,
        venue: eventData.venue ?? '',
        attendees: eventData.attendees ?? null,
        budget: eventData.budget ?? null,
        spent: eventData.spent || 0,
        organizer: eventData.organizer ?? owner,
        owner: owner,
        createdBy: eventData.createdBy,
        status: event.status?.toLowerCase() || 'planning',
        description: event.description ?? '',
        client: event.client ?? '',
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        roiPercent: eventData.roiMetrics?.roiPercent || eventData.roiPercent || null,
        assignments: eventData.assignments || [],
      };
    });
  }, [events, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Success/Error Messages */}
      {actionData && 'success' in actionData && actionData.success && 'message' in actionData && actionData.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {actionData.message}
        </div>
      )}
      {actionData && 'error' in actionData && actionData.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {actionData.error}
        </div>
      )}
      <EventsListNew
        user={user}
        organization={undefined}
        isDemo={isDemo}
        events={transformedEvents as unknown as EventWithDetails[]}
        vendors={vendors as unknown as VendorWithStats[]}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

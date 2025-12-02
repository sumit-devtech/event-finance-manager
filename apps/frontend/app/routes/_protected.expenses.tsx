import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useFetcher, useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { requireAuth, getCurrentUser } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { ExpenseTracker } from "~/components/ExpenseTracker";
import { demoExpenses, demoEvents } from "~/lib/demoData";
import type { ExpenseWithVendor, EventWithDetails, VendorWithStats } from "~/types";

interface LoaderData {
  user: User | null;
  expenses: ExpenseWithVendor[];
  events: EventWithDetails[];
  vendors: VendorWithStats[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    return json<LoaderData>({
      user: null as any,
      expenses: demoExpenses,
      events: demoEvents,
      vendors: [],
    });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const [expenses, events, vendors] = await Promise.all([
      api.get<ExpenseWithVendor[]>("/expenses", { token: token || undefined }),
      api.get<EventWithDetails[]>("/events", { token: token || undefined }),
      api.get<VendorWithStats[]>("/vendors", { token: token || undefined }).catch(() => []),
    ]);

    return json<LoaderData>({
      user,
      expenses: expenses || [],
      events: events || [],
      vendors: vendors || [],
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching data:", errorMessage);
    return json<LoaderData>({
      user,
      expenses: [],
      events: [],
      vendors: [],
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  if (isDemo) {
    return json({ success: true, message: "Demo mode: Changes are not saved" });
  }

  // Get formData first to check intent
  const formData = await request.formData();
  const intent = formData.get("intent");

  // For getExpenseDetails, we need JSON response, so check auth without redirecting
  if (intent === "getExpenseDetails") {
    // Check authentication without redirecting (for JSON responses)
    const user = await getCurrentUser(request);
    if (!user) {
      return json({
        error: "Authentication required",
        statusCode: 401
      }, { status: 401 });
    }

    const token = await getAuthTokenFromSession(request);
    if (!token) {
      return json({
        error: "Authentication token not found",
        statusCode: 401
      }, { status: 401 });
    }

    const expenseId = String(formData.get("expenseId") || "");
    if (!expenseId) {
      return json({ error: "Expense ID is required" }, { status: 400 });
    }

    try {
      const expense = await api.get(`/expenses/${expenseId}`, { token });
      return json({ expense });
    } catch (error: any) {
      console.error('Error fetching expense details:', error);
      return json({
        error: error.message || "Failed to fetch expense details",
        statusCode: error.statusCode || 500
      }, { status: error.statusCode || 500 });
    }
  }

  // For other actions, use requireAuth (which may redirect)
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const tokenOption = token ? { token } : {};

  // Handle expense detail fetch - check this early before other intents
  if (intent === "getExpenseDetails") {
    const expenseId = String(formData.get("expenseId") || "");
    if (!expenseId) {
      return json({ error: "Expense ID is required" }, { status: 400 });
    }

    if (!token) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    try {
      const expense = await api.get(`/expenses/${expenseId}`, tokenOption);
      return json({ expense });
    } catch (error: any) {
      console.error('Error fetching expense details:', error);
      return json({
        error: error.message || "Failed to fetch expense details",
        statusCode: error.statusCode || 500
      }, { status: error.statusCode || 500 });
    }
  }

  try {
    if (intent === "createExpense" || intent === "create") {
      const expenseData: any = {
        eventId: formData.get("eventId") as string,
        category: formData.get("category") as string,
        title: formData.get("title") as string,
        amount: parseFloat(formData.get("amount") as string),
        description: formData.get("description") as string || undefined,
        vendorId: formData.get("vendorId") as string || undefined,
        budgetItemId: formData.get("budgetItemId") as string || undefined,
      };

      // Handle file upload if present
      const file = formData.get("file") as File | null;
      console.log('=== Expense Creation Debug ===');
      console.log('File present:', !!file);
      console.log('File size:', file?.size || 0);
      console.log('File name:', file?.name);
      console.log('File type:', file?.type);

      // Create expense first
      const newExpense = await api.post("/expenses", expenseData, tokenOption) as { id: string };
      console.log('Expense created with ID:', newExpense.id);

      // Upload file if present
      if (file && file.size > 0) {
        try {
          console.log('Attempting to upload file...');
          // Use api.upload for file uploads (handles FormData correctly)
          const uploadResult = await api.upload(
            `/expenses/${newExpense.id}/files`,
            file,
            {},
            tokenOption
          );
          console.log('File upload result:', uploadResult);
          console.log('File uploaded successfully');
        } catch (uploadError: any) {
          console.error('File upload error:', uploadError);
          // Don't fail the entire request if file upload fails
          // The expense is already created
        }
      } else {
        console.log('No file to upload');
      }

      return redirect("/expenses");
    }

    if (intent === "approve" || intent === "reject") {
      const expenseId = formData.get("expenseId") as string;
      const comments = formData.get("comments") as string || undefined;

      await api.post(`/expenses/${expenseId}/approve`, {
        action: intent === "approve" ? "approve" : "reject",
        comments,
      }, tokenOption);

      return redirect("/expenses");
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    const statusCode = (error as { statusCode?: number })?.statusCode || 500;
    console.error("Action error:", errorMessage);
    return json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export default function ExpensesRoute() {
  const { user, expenses, events, vendors } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  // Revalidate data when fetcher completes successfully
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.error) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  return (
    <ExpenseTracker
      user={user}
      organization={undefined}
      event={undefined}
      expenses={expenses}
      events={events}
      vendors={vendors}
      isDemo={isDemo}
      fetcher={fetcher}
    />
  );
}


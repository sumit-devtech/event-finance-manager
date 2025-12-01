import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useFetcher } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { ExpenseTracker } from "~/components/ExpenseTracker";
import { demoExpenses } from "~/lib/demoData";
import type { ExpenseWithVendor } from "~/types";

interface LoaderData {
  user: User | null;
  expenses: ExpenseWithVendor[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    return json<LoaderData>({ user: null as any, expenses: demoExpenses });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const expenses = await api.get<ExpenseWithVendor[]>("/expenses", {
      token: token || undefined,
    });
    return json<LoaderData>({ user, expenses: expenses || [] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching expenses:", errorMessage);
    return json<LoaderData>({ user, expenses: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  if (isDemo) {
    return json({ success: true, message: "Demo mode: Changes are not saved" });
  }

  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const tokenOption = token ? { token } : {};

  try {
    if (intent === "create") {
      const expenseData = {
        eventId: formData.get("eventId") as string,
        category: formData.get("category") as string,
        title: formData.get("title") as string,
        amount: parseFloat(formData.get("amount") as string),
        description: formData.get("description") as string || undefined,
        vendor: formData.get("vendor") as string || undefined,
        budgetItemId: formData.get("budgetItemId") as string || undefined,
      };

      await api.post("/expenses", expenseData, tokenOption);
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
  const { user, expenses } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const fetcher = useFetcher();

  return (
    <ExpenseTracker
      user={user}
      organization={undefined}
      event={undefined}
      expenses={expenses}
      isDemo={isDemo}
      fetcher={fetcher}
    />
  );
}


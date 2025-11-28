import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { ExpenseTracker } from "~/components/ExpenseTracker";

interface LoaderData {
  user: User;
  expenses: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const expenses = await api.get<any[]>("/expenses", {
      token: token || undefined,
    });
    return json<LoaderData>({ user, expenses: expenses || [] });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return json<LoaderData>({ user, expenses: [] });
  }
}

export default function ExpensesRoute() {
  const { user, expenses } = useLoaderData<typeof loader>();

  return <ExpenseTracker user={user} expenses={expenses} />;
}


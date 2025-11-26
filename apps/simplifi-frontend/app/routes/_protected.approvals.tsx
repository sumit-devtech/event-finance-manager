import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, Form } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    // Fetch expenses pending approval
    const expenses = await api.get("/expenses?status=under_review", {
      token: token || undefined,
    });
    return json({ expenses: expenses || [] });
  } catch (error: any) {
    return json({ expenses: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const expenseId = formData.get("expenseId") as string;
  const action = formData.get("action") as string; // "approve" or "reject"
  const comments = formData.get("comments") as string;

  try {
    await api.post(
      `/expenses/${expenseId}/approval`,
      {
        action,
        comments: comments || null,
      },
      {
        token: token || undefined,
      }
    );
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message || "Failed to process approval" }, { status: 400 });
  }
}

export default function Approvals() {
  const { expenses } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve pending expenses
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {expenses.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {expenses.map((expense: any) => (
              <li key={expense.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {expense.title || expense.description}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        Event: {expense.event?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vendor: {expense.vendor?.name || "N/A"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Amount: ${expense.amount}
                      </p>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mt-2">{expense.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <fetcher.Form method="post">
                      <input type="hidden" name="expenseId" value={expense.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        Approve
                      </button>
                    </fetcher.Form>
                    <fetcher.Form method="post">
                      <input type="hidden" name="expenseId" value={expense.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </fetcher.Form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">
              All expenses have been reviewed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


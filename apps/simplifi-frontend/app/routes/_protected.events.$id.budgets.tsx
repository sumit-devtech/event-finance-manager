import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const budgets = await api.get(`/events/${params.id}/budgets`, {
      token: token || undefined,
    });
    return json({ budgets: budgets || [] });
  } catch (error: any) {
    return json({ budgets: [] });
  }
}

export default function EventBudgets() {
  const { budgets } = useLoaderData<typeof loader>();
  const params = useParams();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/events/${params.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
        >
          ← Back to Event
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Create Budget
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {budgets.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {budgets.map((budget: any) => (
              <li key={budget.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{budget.name || `Budget ${budget.version}`}</h3>
                    <p className="text-sm text-gray-500">Status: {budget.status}</p>
                  </div>
                  <Link
                    to={`/budgets/${budget.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No budgets found for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
}


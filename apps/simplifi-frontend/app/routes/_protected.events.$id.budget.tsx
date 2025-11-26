import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams, useFetcher } from "@remix-run/react";
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
    const event = await api.get(`/events/${params.id}`, {
      token: token || undefined,
    });
    return json({ budgets: budgets || [], event });
  } catch (error: any) {
    return json({ budgets: [], event: null });
  }
}

export default function EventBudget() {
  const { budgets, event } = useLoaderData<typeof loader>();
  const params = useParams();
  const fetcher = useFetcher();

  const finalBudget = budgets.find((b: any) => b.isFinal) || budgets[0];

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Planning</h1>
            <p className="mt-2 text-sm text-gray-600">{event?.name}</p>
          </div>
          <div className="flex gap-2">
            {finalBudget && (
              <fetcher.Form method="post" action={`/budgets/${finalBudget.id}/clone`}>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clone Budget
                </button>
              </fetcher.Form>
            )}
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              Create Budget Version
            </button>
          </div>
        </div>
      </div>

      {/* Budget Versions List */}
      {budgets.length > 0 && (
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Budget Versions</h2>
          <div className="space-y-2">
            {budgets.map((budget: any) => (
              <div
                key={budget.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  budget.isFinal ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="font-medium">
                    Version {budget.versionNumber}
                    {budget.isFinal && (
                      <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                        Final
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: ${budget.totalAmount || 0}
                  </div>
                </div>
                <Link
                  to={`/budgets/${budget.id}`}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Details */}
      {finalBudget ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Budget Version {finalBudget.versionNumber} - Line Items
          </h2>
          {finalBudget.lineItems && finalBudget.lineItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finalBudget.lineItems.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      ${finalBudget.totalAmount || 0}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No line items found. Add line items to this budget.</p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">No budget created yet.</p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Create First Budget
          </button>
        </div>
      )}
    </div>
  );
}


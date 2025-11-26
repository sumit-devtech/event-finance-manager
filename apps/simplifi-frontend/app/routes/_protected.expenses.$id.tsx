import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const expense = await api.get(`/expenses/${params.id}`, {
      token: token || undefined,
    });
    return json({ expense });
  } catch (error: any) {
    throw new Response("Expense not found", { status: 404 });
  }
}

export default function ExpenseDetail() {
  const { expense } = useLoaderData<typeof loader>();
  const params = useParams();

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/expenses"
          className="text-sm text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
        >
          ← Back to Expenses
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Expense Details</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{expense.title}</h2>
            <span
              className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(expense.status)}`}
            >
              {expense.status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">${expense.amount}</div>
            <div className="text-sm text-gray-500">Amount</div>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Event</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expense.event ? (
                <Link
                  to={`/events/${expense.event.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {expense.event.name}
                </Link>
              ) : (
                "N/A"
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expense.vendor?.name || "N/A"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {expense.category || "N/A"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expense.date ? new Date(expense.date).toLocaleDateString() : "N/A"}
            </dd>
          </div>

          {expense.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{expense.description}</dd>
            </div>
          )}
        </dl>

        {/* Approval Workflow */}
        {expense.status === "under_review" && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Approval Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              This expense is pending approval. Visit the{" "}
              <Link to="/approvals" className="text-indigo-600 hover:text-indigo-900">
                Approvals page
              </Link>{" "}
              to review and approve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


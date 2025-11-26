import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams, useFetcher } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const roi = await api.get(`/events/${params.id}/roi`, {
      token: token || undefined,
    });
    return json({ roi: roi || null });
  } catch (error: any) {
    return json({ roi: null });
  }
}

export default function EventROI() {
  const { roi } = useLoaderData<typeof loader>();
  const params = useParams();
  const fetcher = useFetcher();

  const handleCalculate = () => {
    fetcher.submit(
      {},
      { method: "post", action: `/events/${params.id}/roi/calculate` }
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900">ROI Analytics</h1>
          <button
            onClick={handleCalculate}
            disabled={fetcher.state === "submitting"}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {fetcher.state === "submitting" ? "Calculating..." : "Calculate ROI"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {roi ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">ROI Percentage</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{roi.roiPercentage || 0}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${roi.totalRevenue || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Costs</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${roi.totalCosts || 0}</dd>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No ROI data available. Click "Calculate ROI" to generate analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}


import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams, useFetcher } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const insights = await api.get(`/events/${params.id}/insights`, {
      token: token || undefined,
    });
    return json({ insights: insights || [] });
  } catch (error: any) {
    return json({ insights: [] });
  }
}

export default function EventInsights() {
  const { insights } = useLoaderData<typeof loader>();
  const params = useParams();
  const fetcher = useFetcher();

  const handleGenerate = () => {
    fetcher.submit(
      {},
      { method: "post", action: `/events/${params.id}/insights/generate` }
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
          <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
          <button
            onClick={handleGenerate}
            disabled={fetcher.state === "submitting"}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {fetcher.state === "submitting" ? "Generating..." : "Generate Insights"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight: any) => (
              <div key={insight.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No insights available. Click "Generate Insights" to create AI-powered insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}


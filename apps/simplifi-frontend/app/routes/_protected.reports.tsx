import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const reports = await api.get("/reports", {
      token: token || undefined,
    });
    return json({ reports: reports || [] });
  } catch (error: any) {
    return json({ reports: [] });
  }
}

export default function Reports() {
  const { reports } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and generate financial reports
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Generate Report
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {reports.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {reports.map((report: any) => (
              <li key={report.id} className="px-6 py-4">
                <Link to={`/reports/${report.id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{report.name || report.type}</h3>
                      <p className="text-sm text-gray-500">Generated: {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}


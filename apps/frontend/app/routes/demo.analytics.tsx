import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { Analytics } from "~/components/Analytics";
import type { User } from "~/lib/auth";

/**
 * Demo Analytics Loader - no authentication required
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Demo events data for analytics
  const demoEvents = [
    {
      id: '1',
      name: 'Tech Conference 2024',
      status: 'active',
      createdAt: '2024-01-15',
      _count: { budgetItems: 12 },
    },
    {
      id: '2',
      name: 'Product Launch Event',
      status: 'planning',
      createdAt: '2024-02-01',
      _count: { budgetItems: 8 },
    },
    {
      id: '3',
      name: 'Annual Gala',
      status: 'active',
      createdAt: '2024-01-10',
      _count: { budgetItems: 15 },
    },
    {
      id: '4',
      name: 'Workshop Series',
      status: 'completed',
      createdAt: '2023-12-01',
      _count: { budgetItems: 6 },
    },
  ];

  // Demo ROI metrics from Figma design
  const demoROIMetrics = [
    { event: 'Tech Conf', roi: 245, revenue: 520000, cost: 125000 },
    { event: 'Product Launch', roi: 180, revenue: 238000, cost: 85000 },
    { event: 'Annual Gala', roi: 210, revenue: 290000, cost: 95000 },
    { event: 'Workshop', roi: 195, revenue: 88000, cost: 45000 },
    { event: 'Trade Show', roi: 225, revenue: 337500, cost: 150000 },
  ];

  return json({
    events: demoEvents,
    roiMetrics: demoROIMetrics,
  });
}

export default function DemoAnalyticsRoute() {
  const { events, roiMetrics } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const demoLayoutMatch = matches.find(m => m.id === 'routes/demo');
  const user = (demoLayoutMatch?.data as any)?.user as User | undefined;

  if (!user) {
    return <div>Loading...</div>;
  }

  return <Analytics user={user} events={events} roiMetrics={roiMetrics} />;
}


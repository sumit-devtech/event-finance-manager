import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { BudgetManager } from "~/components/BudgetManager";
import type { User } from "~/lib/auth";

/**
 * Demo Budget Loader - no authentication required
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Demo events data
  const demoEvents = [
    { id: '1', name: 'Tech Conference 2024' },
    { id: '2', name: 'Product Launch Event' },
    { id: '3', name: 'Annual Gala' },
  ];

  // Demo budget versions
  const demoBudgetVersions = [
    { id: 'v1', name: 'Initial Budget', date: '2024-01-15', status: 'draft' },
    { id: 'v2', name: 'Revised Budget', date: '2024-02-01', status: 'final' },
    { id: 'v3', name: 'Current Working', date: '2024-02-15', status: 'draft' },
  ];

  // Demo budget items from Figma design
  const demoBudgetItems = [
    { id: 1, category: 'Venue', description: 'Conference Hall Rental', vendor: 'Grand Convention Center', estimatedCost: 45000, actualCost: 45000, status: 'confirmed' },
    { id: 2, category: 'Catering', description: 'Lunch & Refreshments (500 pax)', vendor: 'Premium Catering Co.', estimatedCost: 25000, actualCost: 0, status: 'pending' },
    { id: 3, category: 'Marketing', description: 'Digital Marketing Campaign', vendor: 'AdTech Solutions', estimatedCost: 15000, actualCost: 12000, status: 'partial' },
    { id: 4, category: 'Entertainment', description: 'Keynote Speaker Fee', vendor: 'Speaker Bureau Inc.', estimatedCost: 20000, actualCost: 20000, status: 'confirmed' },
    { id: 5, category: 'Technology', description: 'AV Equipment & Setup', vendor: 'Tech Events Pro', estimatedCost: 12000, actualCost: 0, status: 'pending' },
    { id: 6, category: 'Staffing', description: 'Event Staff (20 people)', vendor: 'EventStaff Plus', estimatedCost: 8000, actualCost: 0, status: 'pending' },
  ];

  return json({
    events: demoEvents,
    budgetVersions: demoBudgetVersions,
    budgetItems: demoBudgetItems,
  });
}

export default function DemoBudgetRoute() {
  const { events, budgetVersions, budgetItems } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const demoLayoutMatch = matches.find(m => m.id === 'routes/demo');
  const user = (demoLayoutMatch?.data as any)?.user as User | undefined;

  if (!user) {
    return <div>Loading...</div>;
  }

  return <BudgetManager user={user} events={events} budgetVersions={budgetVersions} budgetItems={budgetItems} isDemo={true} />;
}


import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { VendorManager } from "~/components/VendorManager";
import type { User } from "~/lib/auth";

/**
 * Demo Vendors Loader - no authentication required
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Demo vendors data from Figma design
  const demoVendors = [
    {
      id: 1,
      name: 'Grand Convention Center',
      category: 'Venue',
      rating: 4.8,
      totalContracts: 12,
      totalSpent: 450000,
      phone: '+1 (555) 123-4567',
      email: 'bookings@grandconvention.com',
      address: 'San Francisco, CA',
      status: 'active',
      lastContract: '2024-02-15',
    },
    {
      id: 2,
      name: 'Premium Catering Co.',
      category: 'Catering',
      rating: 4.9,
      totalContracts: 18,
      totalSpent: 285000,
      phone: '+1 (555) 234-5678',
      email: 'info@premiumcatering.com',
      address: 'New York, NY',
      status: 'active',
      lastContract: '2024-02-10',
    },
    {
      id: 3,
      name: 'AdTech Solutions',
      category: 'Marketing',
      rating: 4.6,
      totalContracts: 8,
      totalSpent: 125000,
      phone: '+1 (555) 345-6789',
      email: 'sales@adtechsolutions.com',
      address: 'Austin, TX',
      status: 'active',
      lastContract: '2024-02-05',
    },
    {
      id: 4,
      name: 'Entertainment Plus',
      category: 'Entertainment',
      rating: 4.7,
      totalContracts: 15,
      totalSpent: 195000,
      phone: '+1 (555) 456-7890',
      email: 'bookings@entertainmentplus.com',
      address: 'Los Angeles, CA',
      status: 'active',
      lastContract: '2024-01-28',
    },
    {
      id: 5,
      name: 'Tech Events Pro',
      category: 'Technology',
      rating: 4.5,
      totalContracts: 10,
      totalSpent: 98000,
      phone: '+1 (555) 567-8901',
      email: 'contact@techeventspro.com',
      address: 'Seattle, WA',
      status: 'active',
      lastContract: '2024-01-15',
    },
    {
      id: 6,
      name: 'EventStaff Plus',
      category: 'Staffing',
      rating: 4.4,
      totalContracts: 22,
      totalSpent: 176000,
      phone: '+1 (555) 678-9012',
      email: 'hr@eventstaffplus.com',
      address: 'Chicago, IL',
      status: 'active',
      lastContract: '2024-02-01',
    },
  ];

  return json({
    vendors: demoVendors,
  });
}

export default function DemoVendorsRoute() {
  const { vendors } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const demoLayoutMatch = matches.find(m => m.id === 'routes/demo');
  const user = (demoLayoutMatch?.data as any)?.user as User | undefined;

  if (!user) {
    return <div>Loading...</div>;
  }

  return <VendorManager user={user} vendors={vendors} />;
}


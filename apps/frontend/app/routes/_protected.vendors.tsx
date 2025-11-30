import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { VendorManager } from "~/components/VendorManager";

interface LoaderData {
  user: User | null;
  vendors: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
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

    return json<LoaderData>({ user: null as any, vendors: demoVendors });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const vendors = await api.get<any[]>("/vendors", {
      token: token || undefined,
    });
    return json<LoaderData>({ user, vendors: vendors || [] });
  } catch (error: any) {
    console.error("Error fetching vendors:", error);
    return json<LoaderData>({ user, vendors: [] });
  }
}

export default function VendorsRoute() {
  const { user, vendors } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return <VendorManager user={user} vendors={vendors} />;
}


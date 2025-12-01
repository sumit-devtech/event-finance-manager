import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
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

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (!token) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (intent === "createVendor") {
      const vendorData = {
        name: formData.get("name") as string,
        serviceType: formData.get("serviceType") as string || undefined,
        contactPerson: formData.get("contactPerson") as string || undefined,
        email: formData.get("email") as string || undefined,
        phone: formData.get("phone") as string || undefined,
        gstNumber: formData.get("gstNumber") as string || undefined,
        rating: formData.get("rating") ? parseFloat(formData.get("rating") as string) : undefined,
      };

      await api.post("/vendors", vendorData, { token });
      return redirect("/vendors");
    }

    if (intent === "updateVendor") {
      const vendorId = formData.get("vendorId") as string;
      if (!vendorId) {
        return json({ error: "Vendor ID is required" }, { status: 400 });
      }

      const vendorData: any = {};
      if (formData.get("name")) vendorData.name = formData.get("name") as string;
      if (formData.get("serviceType")) vendorData.serviceType = formData.get("serviceType") as string;
      if (formData.get("contactPerson")) vendorData.contactPerson = formData.get("contactPerson") as string;
      if (formData.get("email")) vendorData.email = formData.get("email") as string;
      if (formData.get("phone")) vendorData.phone = formData.get("phone") as string;
      if (formData.get("gstNumber")) vendorData.gstNumber = formData.get("gstNumber") as string;
      if (formData.get("rating")) vendorData.rating = parseFloat(formData.get("rating") as string);

      await api.put(`/vendors/${vendorId}`, vendorData, { token });
      return redirect("/vendors");
    }

    if (intent === "deleteVendor") {
      const vendorId = formData.get("vendorId") as string;
      if (!vendorId) {
        return json({ error: "Vendor ID is required" }, { status: 400 });
      }

      await api.delete(`/vendors/${vendorId}`, { token });
      return redirect("/vendors");
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in vendor action:", error);
    return json(
      { error: error.message || "An error occurred" },
      { status: error.status || 500 }
    );
  }
}

export default function VendorsRoute() {
  const { user, vendors } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return <VendorManager user={user} vendors={vendors} isDemo={isDemo} />;
}


import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { VendorManager } from "~/components/VendorManager";
import { demoVendors } from "~/lib/demoData";
import type { CreateVendorDto, UpdateVendorDto, VendorWithStats } from "~/types";
import type { SerializeFrom } from "@remix-run/node";

// Vendor type that accounts for Remix serialization (Dates become strings)
type SerializedVendorWithStats = Omit<VendorWithStats, 'createdAt' | 'updatedAt' | 'lastContract'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
  lastContract?: string | Date | null;
};

interface LoaderData {
  user: User | null;
  vendors: SerializedVendorWithStats[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    return json<LoaderData>({ user: null as any, vendors: demoVendors });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const vendors = await api.get<VendorWithStats[]>("/vendors", {
      token: token || undefined,
    });
    return json<LoaderData>({ user, vendors: vendors || [] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching vendors:", errorMessage);
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
      const vendorData: CreateVendorDto = {
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

      const vendorData: UpdateVendorDto = {};
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    const statusCode = (error as { status?: number })?.status || 500;
    console.error("Error in vendor action:", errorMessage);
    return json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export default function VendorsRoute() {
  const { user, vendors } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return <VendorManager user={user} vendors={vendors} isDemo={isDemo} />;
}


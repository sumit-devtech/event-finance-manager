import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCurrentUser } from "~/lib/auth.server";
import { LandingPage } from "~/components/LandingPage";
import type { User } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  // If user is logged in, redirect to dashboard
  if (user) {
    return redirect("/dashboard");
  }
  return json({ user: null });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>() as { user: User | null };
  
  // If user is logged in, they should be redirected, but show landing page as fallback
  if (user) {
    return null; // Will redirect via loader
  }
  
  return <LandingPage />;
}


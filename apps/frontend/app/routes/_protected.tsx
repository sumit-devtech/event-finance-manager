/**
 * Protected Route Layout
 * 
 * This layout route protects all child routes and provides the main application layout.
 * Any route nested under this will require authentication.
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { Layout } from "~/components/Layout";
import type { User } from "~/lib/auth";

/**
 * Protected loader - ensures user is authenticated
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  return json({ user });
}

/**
 * Layout component that wraps all protected routes
 */
export default function ProtectedLayout() {
  const { user } = useLoaderData<typeof loader>() as { user: User };
  return <Layout user={user} />;
}


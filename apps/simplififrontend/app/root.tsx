import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import tailwindStylesheetUrl from "./styles/tailwind.css?url";
import { getCurrentUser } from "~/lib/auth.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { viewport: "width=device-width,initial-scale=1" },
    { title: "Simplifi - Event Finance Manager" },
    { name: "description", content: "Event budget planning and expense management system" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  return { user };
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        <Outlet context={data} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export { ErrorBoundary } from "./components/ErrorBoundary";


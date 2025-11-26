import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loaderCheckUserAuthenticated } from "~/lib/auth.server";
import { Layout, LayoutHeader, LayoutContent } from "~/layout";
import { HomeHeaderComponent } from "~/components/HomeHeaderComponent";
import { HomeComponent } from "~/components/HomeComponent";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, isAuthenticated } = await loaderCheckUserAuthenticated({ request });
  
  if (isAuthenticated && user) {
    return redirect("/dashboard");
  }
  
  return json({});
}

export default function HomePage() {
  return (
    <Layout>
      <LayoutHeader>
        <HomeHeaderComponent />
      </LayoutHeader>
      <LayoutContent>
        <HomeComponent />
      </LayoutContent>
    </Layout>
  );
}

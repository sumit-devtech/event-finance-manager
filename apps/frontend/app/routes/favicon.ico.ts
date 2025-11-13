import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  // Return 204 No Content for favicon requests
  return new Response(null, {
    status: 204,
    headers: {
      "Content-Type": "image/x-icon",
    },
  });
}


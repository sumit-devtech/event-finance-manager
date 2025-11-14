/**
 * Example Loader
 * 
 * This demonstrates the loader pattern for fetching data from the API
 * All data access goes through Remix loaders → NestJS API → Database
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { api, getAuthTokenFromRequest } from "~/lib/api";

/**
 * Example loader that fetches data from the API
 * 
 * This loader runs on the server and can access cookies/headers
 * to authenticate API requests
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const token = getAuthTokenFromRequest(request);

    // Example: Fetch data from API
    // const data = await api.get("/events", { token });
    
    // For now, return empty data as example
    return json({
      message: "Example loader - replace with actual API calls",
      // data,
    });
  } catch (error) {
    // Handle errors appropriately
    throw json(
      { error: "Failed to load data" },
      { status: 500 },
    );
  }
}


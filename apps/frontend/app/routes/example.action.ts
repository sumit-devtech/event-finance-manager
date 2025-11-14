/**
 * Example Action
 * 
 * This demonstrates the action pattern for mutating data via the API
 * All data mutations go through Remix actions → NestJS API → Database
 */

import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { api, getAuthTokenFromRequest } from "~/lib/api";

/**
 * Example action that mutates data via the API
 * 
 * This action runs on the server and can access cookies/headers
 * to authenticate API requests
 */
export async function action({ request }: ActionFunctionArgs) {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
      case "create": {
        // Example: Create resource via API
        // const data = Object.fromEntries(formData);
        // const result = await api.post("/events", data, { token });
        // return json({ success: true, data: result });
        return json({ message: "Example action - replace with actual API calls" });
      }

      case "update": {
        // Example: Update resource via API
        // const id = formData.get("id");
        // const data = Object.fromEntries(formData);
        // const result = await api.put(`/events/${id}`, data, { token });
        // return json({ success: true, data: result });
        return json({ message: "Example action - replace with actual API calls" });
      }

      case "delete": {
        // Example: Delete resource via API
        // const id = formData.get("id");
        // await api.delete(`/events/${id}`, { token });
        // return redirect("/events");
        return json({ message: "Example action - replace with actual API calls" });
      }

      default:
        return json({ error: "Invalid intent" }, { status: 400 });
    }
  } catch (error) {
    return json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}


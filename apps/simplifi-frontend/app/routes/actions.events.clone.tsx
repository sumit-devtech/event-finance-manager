import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);
  const formData = await request.formData();
  const eventId = formData.get("eventId") as string;

  if (!eventId) {
    return json({ error: "Event ID is required" }, { status: 400 });
  }

  try {
    const clonedEvent = await api.post<{ id: string }>(
      `/events/${eventId}/clone`,
      {},
      {
        token: token || undefined,
      }
    );

    return redirect(`/events/${clonedEvent.id}`);
  } catch (error: any) {
    return json({ error: error.message || "Failed to clone event" }, { status: 400 });
  }
}


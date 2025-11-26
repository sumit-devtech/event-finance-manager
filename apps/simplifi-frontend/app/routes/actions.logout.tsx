import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { logout, removeAuthTokenFromSession } from "~/lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  await logout(request);
  const session = await removeAuthTokenFromSession(request);
  
  return redirect("/login", {
    headers: {
      "Set-Cookie": session,
    },
  });
}


import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getRequiredSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session;
}

export async function getRequiredPageSession() {
  const session = await getRequiredSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

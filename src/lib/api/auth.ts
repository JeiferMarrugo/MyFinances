import { getRequiredSession } from "@/lib/session";
import { apiUnauthorized } from "@/lib/api/responses";

export async function requireApiSession() {
  const session = await getRequiredSession();

  if (!session) {
    return { session: null, error: apiUnauthorized() } as const;
  }

  return { session, error: null } as const;
}

export function isCronAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${cronSecret}`) {
    return true;
  }

  return request.headers.get("x-cron-secret") === cronSecret;
}

/** Server-side app URL (auth cookies, redirects, emails). */
export function resolveAppUrl() {
  const explicit =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

/** @deprecated Use getAuthClientBaseUrl in auth-client.ts (client-only). */
export function resolveClientAuthBaseUrl() {
  return resolveAppUrl();
}

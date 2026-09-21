export function getGoogleClientId() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    ""
  );
}

export function isGoogleAuthConfigured() {
  return Boolean(
    getGoogleClientId() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function isGoogleOneTapConfigured() {
  return Boolean(getGoogleClientId() && isGoogleAuthConfigured());
}

import type { ErrorPageIcon } from "@/lib/errors/types";

export const errorIllustrationAssets: Record<ErrorPageIcon, string> = {
  "not-found": "/images/errors/error-404.png?v=6",
  server: "/images/errors/error-500.png?v=6",
  unauthorized: "/images/errors/error-401.png?v=6",
  forbidden: "/images/errors/error-403.png?v=6",
  maintenance: "/images/errors/error-maintenance.png?v=6",
  "rate-limit": "/images/errors/error-429.png?v=6",
  offline: "/images/errors/error-offline.png?v=6",
  session: "/images/errors/error-401.png?v=6",
  gateway: "/images/errors/error-500.png?v=6",
  generic: "/images/errors/error-500.png?v=6",
};

export function getErrorIllustrationSrc(icon: ErrorPageIcon) {
  return errorIllustrationAssets[icon];
}

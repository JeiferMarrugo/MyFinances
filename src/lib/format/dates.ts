import { appLocale } from "@/lib/branding";
import { APP_TIMEZONE } from "@/lib/finance-settings/timezone";

type AppDateFormatOptions = {
  includeYear?: boolean;
};

/** Node vs browser Intl can emit different spaces (NBSP vs normal). */
function normalizeIntlSpaces(value: string): string {
  return value.replace(/\u00a0/g, " ");
}

function parseAppDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatAppDate(
  value: string | Date | null | undefined,
  options: AppDateFormatOptions = {},
): string {
  if (!value) {
    return "—";
  }

  const date = parseAppDate(value);

  if (!date) {
    return String(value);
  }

  const { includeYear = true } = options;

  return normalizeIntlSpaces(
    new Intl.DateTimeFormat(appLocale.locale, {
      timeZone: APP_TIMEZONE,
      day: "numeric",
      month: "short",
      ...(includeYear ? { year: "numeric" } : {}),
    }).format(date),
  );
}

export function formatAppTime(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = parseAppDate(value);

  if (!date) {
    return String(value);
  }

  return normalizeIntlSpaces(
    new Intl.DateTimeFormat(appLocale.locale, {
      timeZone: APP_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date),
  );
}

export function formatAppDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return `${formatAppDate(value)} · ${formatAppTime(value)}`;
}

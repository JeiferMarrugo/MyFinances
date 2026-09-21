import { Temporal } from "@js-temporal/polyfill";
import { formatAppDateTime } from "@/lib/format/dates";

export { Temporal };

export function formatDate(
  instant: Temporal.Instant | Temporal.PlainDate,
  locale = "es-ES",
): string {
  if (instant instanceof Temporal.Instant) {
    return instant.toZonedDateTimeISO("UTC").toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return instant.toLocaleString(locale, { dateStyle: "medium" });
}

export function daysUntil(target: Temporal.PlainDate): number {
  const today = Temporal.Now.plainDateISO();
  return target.since(today).days;
}

export function formatDateTimeString(
  value: string | null | undefined,
  _timeZone = "America/Bogota",
  _locale = "es-CO",
): string {
  return formatAppDateTime(value);
}

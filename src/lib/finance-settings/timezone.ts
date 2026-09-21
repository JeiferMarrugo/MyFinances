import { Temporal } from "@js-temporal/polyfill";

export const APP_TIMEZONE = "America/Bogota";

export function toZonedDateTime(date: Date, timeZone = APP_TIMEZONE) {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(
    timeZone,
  );
}

export function getZonedYMD(date: Date, timeZone = APP_TIMEZONE) {
  const zdt = toZonedDateTime(date, timeZone);
  return {
    year: zdt.year,
    month: zdt.month,
    day: zdt.day,
  };
}

export function zonedStartOfDay(
  year: number,
  month: number,
  day: number,
  timeZone = APP_TIMEZONE,
) {
  return new Date(
    Temporal.ZonedDateTime.from({
      year,
      month,
      day,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      timeZone,
    }).epochMilliseconds,
  );
}

export function zonedEndOfDay(
  year: number,
  month: number,
  day: number,
  timeZone = APP_TIMEZONE,
) {
  return new Date(
    Temporal.ZonedDateTime.from({
      year,
      month,
      day,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
      timeZone,
    }).epochMilliseconds,
  );
}

export function getLastDayOfMonth(year: number, month: number) {
  return Temporal.PlainDate.from({ year, month, day: 1 }).daysInMonth;
}

export function clampDay(year: number, month: number, day: number) {
  return Math.min(Math.max(day, 1), getLastDayOfMonth(year, month));
}

import { Temporal } from "@/lib/temporal";
import type { RecurringFrequency } from "@/lib/recurring-incomes/constants";

function clampDay(day: number, year: number, month: number) {
  const daysInMonth = Temporal.PlainDate.from({ year, month, day: 1 }).daysInMonth;
  return Math.min(Math.max(day, 1), daysInMonth);
}

export function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export function isRecurringRunDue(
  nextRunAt: Date,
  referenceDate = new Date(),
) {
  return startOfDay(nextRunAt).getTime() <= startOfDay(referenceDate).getTime();
}

function toDate(plainDate: Temporal.PlainDate) {
  return new Date(
    plainDate.year,
    plainDate.month - 1,
    plainDate.day,
    0,
    0,
    0,
    0,
  );
}

export function computeNextRunAt(
  frequency: RecurringFrequency,
  from: Date,
  dayOfMonth: number,
): Date {
  const current = Temporal.PlainDate.from({
    year: from.getFullYear(),
    month: from.getMonth() + 1,
    day: from.getDate(),
  });

  let next: Temporal.PlainDate;

  switch (frequency) {
    case "weekly":
      next = current.add({ weeks: 1 });
      break;
    case "biweekly":
      next = current.add({ weeks: 2 });
      break;
    case "monthly": {
      next = current.add({ months: 1 });
      next = next.with({
        day: clampDay(dayOfMonth, next.year, next.month),
      });
      break;
    }
    case "yearly": {
      next = current.add({ years: 1 });
      next = next.with({
        day: clampDay(dayOfMonth, next.year, next.month),
      });
      break;
    }
  }

  return toDate(next);
}

export function computeInitialNextRunAt(
  frequency: RecurringFrequency,
  startDate: Date,
  dayOfMonth: number,
): Date {
  const now = new Date();
  let candidate = startOfDay(startDate);

  if (candidate.getTime() > startOfDay(now).getTime()) {
    return candidate;
  }

  while (startOfDay(candidate).getTime() < startOfDay(now).getTime()) {
    candidate = computeNextRunAt(frequency, candidate, dayOfMonth);
  }

  return candidate;
}

export function formatNextRunLabel(date: Date) {
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRunDay(date: Date) {
  const value = startOfDay(date);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function parseRecurringStartDate(value: string) {
  return startOfDay(new Date(`${value}T00:00:00`));
}

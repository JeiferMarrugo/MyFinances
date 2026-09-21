import type { FinanceSettingsRecord, PeriodRange } from "@/lib/finance-settings/types";
import { defaultFinanceSettings } from "@/lib/finance-settings/constants";
import {
  clampDay,
  getLastDayOfMonth,
  getZonedYMD,
  zonedEndOfDay,
  zonedStartOfDay,
} from "@/lib/finance-settings/timezone";
import type { InstallmentFrequency } from "@/lib/transactions/constants";

export type FinancePeriodSettings = Pick<
  FinanceSettingsRecord,
  | "biweeklyFirstStartDay"
  | "biweeklyFirstEndDay"
  | "biweeklySecondStartDay"
  | "biweeklySecondEndDay"
  | "monthStartDay"
  | "quarterStartMonth"
  | "yearStartMonth"
  | "yearStartDay"
  | "installmentDueOffset"
>;

export function resolveFinancePeriodSettings(
  settings?: Partial<FinancePeriodSettings> | null,
): FinancePeriodSettings {
  return {
    biweeklyFirstStartDay:
      settings?.biweeklyFirstStartDay ?? defaultFinanceSettings.biweeklyFirstStartDay,
    biweeklyFirstEndDay:
      settings?.biweeklyFirstEndDay ?? defaultFinanceSettings.biweeklyFirstEndDay,
    biweeklySecondStartDay:
      settings?.biweeklySecondStartDay ??
      defaultFinanceSettings.biweeklySecondStartDay,
    biweeklySecondEndDay:
      settings?.biweeklySecondEndDay ??
      defaultFinanceSettings.biweeklySecondEndDay,
    monthStartDay: settings?.monthStartDay ?? defaultFinanceSettings.monthStartDay,
    quarterStartMonth:
      settings?.quarterStartMonth ?? defaultFinanceSettings.quarterStartMonth,
    yearStartMonth: settings?.yearStartMonth ?? defaultFinanceSettings.yearStartMonth,
    yearStartDay: settings?.yearStartDay ?? defaultFinanceSettings.yearStartDay,
    installmentDueOffset:
      settings?.installmentDueOffset ?? defaultFinanceSettings.installmentDueOffset,
  };
}

function atStartOfDay(year: number, monthIndex: number, day: number) {
  return zonedStartOfDay(year, monthIndex + 1, clampDay(year, monthIndex + 1, day));
}

function atEndOfDay(year: number, monthIndex: number, day: number) {
  return zonedEndOfDay(year, monthIndex + 1, clampDay(year, monthIndex + 1, day));
}

function formatDayMonth(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getBiweeklySecondEndDay(
  year: number,
  monthIndex: number,
  settings: FinancePeriodSettings,
) {
  return (
    settings.biweeklySecondEndDay ?? getLastDayOfMonth(year, monthIndex + 1)
  );
}

export function getBiweeklyPeriodForDate(
  date: Date,
  settingsInput?: Partial<FinancePeriodSettings> | null,
): PeriodRange {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const { year, month, day } = getZonedYMD(date);
  const monthIndex = month - 1;
  const secondEndDay = getBiweeklySecondEndDay(year, monthIndex, settings);

  if (day <= settings.biweeklyFirstEndDay) {
    return {
      start: atStartOfDay(year, month, settings.biweeklyFirstStartDay),
      end: atEndOfDay(year, month, settings.biweeklyFirstEndDay),
      label: "Quincena 1",
    };
  }

  if (day >= settings.biweeklySecondStartDay && day <= secondEndDay) {
    return {
      start: atStartOfDay(year, month, settings.biweeklySecondStartDay),
      end: atEndOfDay(year, month, secondEndDay),
      label: "Quincena 2",
    };
  }

  if (day < settings.biweeklySecondStartDay) {
    const previousMonth = month === 0 ? 11 : month - 1;
    const previousYear = month === 0 ? year - 1 : year;
    const previousSecondEndDay = getBiweeklySecondEndDay(
      previousYear,
      previousMonth,
      settings,
    );

    return {
      start: atStartOfDay(
        previousYear,
        previousMonth,
        settings.biweeklySecondStartDay,
      ),
      end: atEndOfDay(previousYear, previousMonth, previousSecondEndDay),
      label: "Quincena 2",
    };
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  return {
    start: atStartOfDay(nextYear, nextMonth, settings.biweeklyFirstStartDay),
    end: atEndOfDay(nextYear, nextMonth, settings.biweeklyFirstEndDay),
    label: "Quincena 1",
  };
}

export function getMonthlyPeriodForDate(
  date: Date,
  settingsInput?: Partial<FinancePeriodSettings> | null,
): PeriodRange {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const { year, month, day } = getZonedYMD(date);
  const monthIndex = month - 1;

  if (settings.monthStartDay === 1) {
    const lastDay = getLastDayOfMonth(year, month);

    return {
      start: atStartOfDay(year, monthIndex, 1),
      end: atEndOfDay(year, monthIndex, lastDay),
      label: new Intl.DateTimeFormat("es-CO", {
        month: "long",
        year: "numeric",
      }).format(date),
    };
  }

  let startYear = year;
  let startMonth = monthIndex;

  if (day < settings.monthStartDay) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth > 11) {
    endMonth = 0;
    endYear += 1;
  }

  const endDay = settings.monthStartDay - 1;

  return {
    start: atStartOfDay(startYear, startMonth, settings.monthStartDay),
    end: atEndOfDay(endYear, endMonth, endDay),
    label: `${formatDayMonth(atStartOfDay(startYear, startMonth, settings.monthStartDay))} – ${formatDayMonth(atEndOfDay(endYear, endMonth, endDay))}`,
  };
}

export function getQuarterPeriodForDate(
  date: Date,
  settingsInput?: Partial<FinancePeriodSettings> | null,
): PeriodRange {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const month1 = date.getMonth() + 1;
  const year = date.getFullYear();

  let fiscalStartYear = year;
  if (month1 < settings.quarterStartMonth) {
    fiscalStartYear -= 1;
  }

  const fiscalMonthIndex = (month1 - settings.quarterStartMonth + 12) % 12;
  const quarterIndex = Math.floor(fiscalMonthIndex / 3);

  let startMonth1 = settings.quarterStartMonth + quarterIndex * 3;
  let startYear = fiscalStartYear;

  while (startMonth1 > 12) {
    startMonth1 -= 12;
    startYear += 1;
  }

  let endMonth1 = startMonth1 + 2;
  let endYear = startYear;

  if (endMonth1 > 12) {
    endMonth1 -= 12;
    endYear += 1;
  }

  const endDay = getLastDayOfMonth(endYear, endMonth1 - 1);

  return {
    start: atStartOfDay(startYear, startMonth1 - 1, 1),
    end: atEndOfDay(endYear, endMonth1 - 1, endDay),
    label: `Trimestre ${quarterIndex + 1}`,
  };
}

export function getYearPeriodForDate(
  date: Date,
  settingsInput?: Partial<FinancePeriodSettings> | null,
): PeriodRange {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const month1 = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const startsAfterReference =
    month1 < settings.yearStartMonth ||
    (month1 === settings.yearStartMonth && day < settings.yearStartDay);
  const startYear = startsAfterReference ? year - 1 : year;
  const endYear = startYear + 1;

  const nextPeriodStart = atStartOfDay(
    endYear,
    settings.yearStartMonth - 1,
    settings.yearStartDay,
  );
  const end = new Date(nextPeriodStart);
  end.setMilliseconds(end.getMilliseconds() - 1);

  return {
    start: atStartOfDay(
      startYear,
      settings.yearStartMonth - 1,
      settings.yearStartDay,
    ),
    end,
    label: `Año ${startYear}/${String(endYear).slice(-2)}`,
  };
}

export function formatPeriodRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: start.getFullYear() === end.getFullYear() ? undefined : "numeric",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function formatTrendMonthLabel(
  start: Date,
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  const settings = resolveFinancePeriodSettings(settingsInput);

  if (settings.monthStartDay === 1) {
    return new Intl.DateTimeFormat("es-CO", { month: "short" }).format(start);
  }

  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    year: "2-digit",
  }).format(start);
}

export function buildMonthlyTrendBuckets(
  months: number,
  referenceDate = new Date(),
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  const buckets: Array<{
    key: string;
    label: string;
    start: Date;
    end: Date;
    income: number;
    expenses: number;
  }> = [];

  let cursor = new Date(referenceDate);

  for (let index = 0; index < months; index += 1) {
    const { start, end } = getMonthRange(cursor, settingsInput);

    buckets.unshift({
      key: `${start.getTime()}`,
      label: formatTrendMonthLabel(start, settingsInput),
      start,
      end,
      income: 0,
      expenses: 0,
    });

    cursor = new Date(start);
    cursor.setDate(cursor.getDate() - 1);
  }

  return buckets;
}

export function getPreviousMonthReference(referenceDate = new Date()) {
  const { start } = getMonthRange(referenceDate);
  const previous = new Date(start);
  previous.setDate(previous.getDate() - 1);
  return previous;
}

export function getMonthRange(
  referenceDate = new Date(),
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  const period = getMonthlyPeriodForDate(referenceDate, settingsInput);
  return { start: period.start, end: period.end };
}

export function getPeriodForFrequency(
  date: Date,
  frequency: InstallmentFrequency,
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  if (frequency === "biweekly") {
    return getBiweeklyPeriodForDate(date, settingsInput);
  }

  return getMonthlyPeriodForDate(date, settingsInput);
}


function getBiweeklyPeriodByOffset(
  date: Date,
  offset: number,
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const current = getBiweeklyPeriodForDate(date, settings);
  let cursor = new Date(current.start);
  let direction = offset;

  while (direction !== 0) {
    const step = direction > 0 ? 1 : -1;
    const period = getBiweeklyPeriodForDate(cursor, settings);
    cursor = new Date(period.end);
    cursor.setDate(cursor.getDate() + (step > 0 ? 1 : -1));
    direction -= step;
  }

  if (offset === 0) {
    return current;
  }

  return getBiweeklyPeriodForDate(cursor, settings);
}

export function getInstallmentDueBiweeklyPeriod(
  purchaseDate: Date,
  installmentIndex: number,
  settingsInput?: Partial<FinancePeriodSettings> | null,
  totalOffsetOverride?: number,
) {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const totalOffset =
    totalOffsetOverride ?? settings.installmentDueOffset + installmentIndex;
  return getBiweeklyPeriodByOffset(purchaseDate, totalOffset, settings);
}

export function getInstallmentDueBiweeklyDate(
  purchaseDate: Date,
  installmentIndex: number,
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  return getInstallmentDueBiweeklyPeriod(
    purchaseDate,
    installmentIndex,
    settingsInput,
  ).end;
}

function getMonthlyPeriodByOffset(
  date: Date,
  offset: number,
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const current = getMonthlyPeriodForDate(date, settings);
  const anchor = new Date(current.start);
  anchor.setMonth(anchor.getMonth() + offset);
  return getMonthlyPeriodForDate(anchor, settings);
}

export function getInstallmentDuePeriod(
  purchaseDate: Date,
  installmentIndex: number,
  frequency: InstallmentFrequency,
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  const settings = resolveFinancePeriodSettings(settingsInput);
  const totalOffset = settings.installmentDueOffset + installmentIndex;

  if (frequency === "biweekly") {
    return getBiweeklyPeriodByOffset(purchaseDate, totalOffset, settings);
  }

  return getMonthlyPeriodByOffset(purchaseDate, totalOffset, settings);
}

export function getInstallmentDueDate(
  purchaseDate: Date,
  installmentIndex: number,
  frequency: InstallmentFrequency,
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  const period = getInstallmentDuePeriod(
    purchaseDate,
    installmentIndex,
    frequency,
    settingsInput,
  );

  return period.end;
}

export function getCurrentPeriodSummaries(
  referenceDate = new Date(),
  settingsInput?: Partial<FinancePeriodSettings> | null,
) {
  return {
    biweekly: getBiweeklyPeriodForDate(referenceDate, settingsInput),
    month: getMonthlyPeriodForDate(referenceDate, settingsInput),
    quarter: getQuarterPeriodForDate(referenceDate, settingsInput),
    year: getYearPeriodForDate(referenceDate, settingsInput),
  };
}

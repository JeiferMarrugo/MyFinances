import type { FinancePeriodSettings } from "@/lib/finance-settings/periods";
import {
  getBiweeklyPeriodForDate,
  getInstallmentDueBiweeklyPeriod,
  getMonthRange as getConfiguredMonthRange,
  resolveFinancePeriodSettings,
} from "@/lib/finance-settings/periods";
import { clampDay, getZonedYMD, zonedStartOfDay } from "@/lib/finance-settings/timezone";
import { Temporal } from "@/lib/temporal";
import type { InstallmentFrequency } from "@/lib/transactions/constants";

export type ExpenseCalculationRow = {
  type: string;
  amount: number;
  occurredAt: Date;
  installmentsCount: number | null;
  installmentAmount: number | null;
  creditAlreadyStarted: boolean;
  installmentsPaid: number;
  installmentFrequency: string | null;
  paidFromSavings: boolean;
  loanId?: string | null;
  paymentPlan?: {
    confirmed: boolean;
    items: Array<{
      installmentIndex: number;
      paymentDate: Date;
      amount: number;
      status: "pending" | "paid";
      paidAt: Date | null;
    }>;
  } | null;
};

export function getMonthRange(
  referenceDate = new Date(),
  settings?: Partial<FinancePeriodSettings> | null,
) {
  return getConfiguredMonthRange(referenceDate, settings);
}

export function isCreditInstallmentExpense(row: ExpenseCalculationRow) {
  return (
    row.type === "expense" &&
    row.installmentsCount != null &&
    row.installmentsCount > 0 &&
    row.installmentAmount != null &&
    row.installmentAmount > 0
  );
}

function getInstallmentFrequency(row: ExpenseCalculationRow): InstallmentFrequency {
  return (row.installmentFrequency ?? "monthly") as InstallmentFrequency;
}

function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date) {
  return date >= rangeStart && date <= rangeEnd;
}

export function getExpenseAmountForMonth(
  row: ExpenseCalculationRow,
  monthStart: Date,
  monthEnd: Date,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  if (row.type !== "expense") return 0;

  if (row.paidFromSavings) return 0;

  if (row.loanId) return 0;

  if (!isCreditInstallmentExpense(row)) {
    return isDateInRange(row.occurredAt, monthStart, monthEnd) ? row.amount : 0;
  }

  if (!row.paymentPlan?.confirmed) {
    return 0;
  }

  let dueTotal = 0;

  for (const item of row.paymentPlan.items) {
    if (item.status !== "paid" || !item.paidAt) continue;

    if (isDateInRange(item.paidAt, monthStart, monthEnd)) {
      dueTotal += item.amount;
    }
  }

  return dueTotal;
}

export function sumExpensesForMonth(
  rows: ExpenseCalculationRow[],
  monthStart: Date,
  monthEnd: Date,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  return rows.reduce(
    (total, row) =>
      total + getExpenseAmountForMonth(row, monthStart, monthEnd, settings),
    0,
  );
}

export function getPaidInstallmentsCount(row: ExpenseCalculationRow) {
  if (!isCreditInstallmentExpense(row)) return 0;

  if (!row.creditAlreadyStarted) {
    return 0;
  }

  return Math.min(
    Math.max(row.installmentsPaid, 0),
    row.installmentsCount ?? 0,
  );
}

export function getNextInstallmentIndex(row: ExpenseCalculationRow) {
  if (!isCreditInstallmentExpense(row)) return null;

  const paidCount = getPaidInstallmentsCount(row);

  if (paidCount >= row.installmentsCount!) {
    return null;
  }

  return paidCount;
}

export function getNextInstallmentNumber(row: ExpenseCalculationRow) {
  const nextIndex = getNextInstallmentIndex(row);
  return nextIndex == null ? null : nextIndex + 1;
}

function getInstallmentScheduleOffset(
  row: ExpenseCalculationRow,
  installmentIndex: number,
) {
  const paidCount = getPaidInstallmentsCount(row);

  if (row.creditAlreadyStarted && paidCount > 0) {
    // occurredAt = fecha de la próxima cuota pendiente; las anteriores se restan mes a mes.
    return installmentIndex - paidCount;
  }

  // occurredAt = día de pago de la 1.ª cuota; cada cuota suma 1 mes.
  return installmentIndex;
}

export function getInstallmentPaymentDateForIndex(
  row: ExpenseCalculationRow,
  installmentIndex: number,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  if (!isCreditInstallmentExpense(row)) return null;

  if (row.paymentPlan?.confirmed) {
    const plannedItem = row.paymentPlan.items.find(
      (item) => item.installmentIndex === installmentIndex,
    );
    if (plannedItem) {
      return plannedItem.paymentDate;
    }
  }

  const resolved = resolveFinancePeriodSettings(settings);
  const frequency = getInstallmentFrequency(row);
  const purchase = getZonedYMD(row.occurredAt);
  const purchaseDay = purchase.day;
  const totalOffset = getInstallmentScheduleOffset(row, installmentIndex);

  if (frequency === "biweekly") {
    const duePeriod = getInstallmentDueBiweeklyPeriod(
      row.occurredAt,
      installmentIndex,
      settings,
      totalOffset,
    );
    const { year, month } = getZonedYMD(duePeriod.end);
    return zonedStartOfDay(year, month, clampDay(year, month, purchaseDay));
  }

  const paymentPlain = Temporal.PlainDate.from({
    year: purchase.year,
    month: purchase.month,
    day: clampDay(purchase.year, purchase.month, purchaseDay),
  }).add({ months: totalOffset });

  return zonedStartOfDay(
    paymentPlain.year,
    paymentPlain.month,
    paymentPlain.day,
  );
}

export type CreditPaymentPlanPreviewItem = {
  installmentIndex: number;
  installmentNumber: number;
  paymentDate: Date;
  amount: number;
  status: "pending" | "paid";
};

export function buildCreditPaymentPlanPreview(
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
): CreditPaymentPlanPreviewItem[] {
  if (!isCreditInstallmentExpense(row)) return [];

  const totalInstallments = row.installmentsCount!;
  const installmentAmount = row.installmentAmount!;
  const paidCount = getPaidInstallmentsCount(row);
  const items: CreditPaymentPlanPreviewItem[] = [];

  for (let index = 0; index < totalInstallments; index += 1) {
    const paymentDate = getInstallmentPaymentDateForIndex(row, index, settings);
    if (!paymentDate) continue;

    items.push({
      installmentIndex: index,
      installmentNumber: index + 1,
      paymentDate,
      amount: installmentAmount,
      status: index < paidCount ? "paid" : "pending",
    });
  }

  return items;
}

export function getPendingInstallmentsCount(row: ExpenseCalculationRow) {
  if (!isCreditInstallmentExpense(row)) return 0;

  return Math.max(row.installmentsCount! - getPaidInstallmentsCount(row), 0);
}

export function getNextInstallmentPaymentDate(
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  const nextIndex = getNextInstallmentIndex(row);
  if (nextIndex == null) return null;

  return getInstallmentPaymentDateForIndex(row, nextIndex, settings);
}

export function getNextInstallmentDueDate(
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  return getNextInstallmentPaymentDate(row, settings);
}

export function isNextInstallmentPaymentDue(
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
) {
  const dueDate = getNextInstallmentDueDate(row, settings);
  if (!dueDate) return false;

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);

  return today.getTime() >= dueDay.getTime();
}

export function isNextInstallmentDueInCurrentBiweeklyPeriod(
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
) {
  const paymentDate = getNextInstallmentPaymentDate(row, settings);
  if (!paymentDate) return false;

  const currentBiweekly = getBiweeklyPeriodForDate(referenceDate, settings);
  return isDateInRange(paymentDate, currentBiweekly.start, currentBiweekly.end);
}

export function canPayNextInstallment(
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
) {
  return (
    isCreditInstallmentExpense(row) &&
    !row.paidFromSavings &&
    getNextInstallmentIndex(row) != null &&
    isNextInstallmentPaymentDue(row, settings, referenceDate)
  );
}

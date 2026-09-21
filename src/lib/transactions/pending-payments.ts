import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import type { FinancePeriodSettings } from "@/lib/finance-settings/periods";
import { getZonedYMD, zonedStartOfDay } from "@/lib/finance-settings/timezone";
import {
  attachPaymentPlansToRows,
  loadPaymentPlansByTransactionIds,
} from "@/lib/transactions/payment-plan";
import {
  canPayNextInstallment,
  getInstallmentPaymentDateForIndex,
  getNextInstallmentIndex,
  getNextInstallmentPaymentDate,
  getPendingInstallmentsCount,
  isCreditInstallmentExpense,
  type ExpenseCalculationRow,
} from "@/lib/transactions/installments";

export type PendingPaymentStatus = "overdue" | "due_today" | "upcoming";

export type PendingPaymentAlert = {
  transactionId: string;
  title: string;
  category: string;
  method: string;
  installmentAmount: number;
  installmentIndex: number;
  installmentNumber: number;
  totalInstallments: number;
  pendingInstallments: number;
  paymentDate: string;
  daysUntilPayment: number;
  status: PendingPaymentStatus;
};

export type PendingPaymentItem = {
  transactionId: string;
  title: string;
  category: string;
  method: string;
  installmentAmount: number;
  installmentIndex: number;
  installmentNumber: number;
  totalInstallments: number;
  pendingInstallments: number;
  paymentDate: string;
  daysUntilPayment: number;
  status: PendingPaymentStatus;
  canPayInstallment: boolean;
};

export type PendingPaymentsOverview = {
  totalPendingAmount: number;
  pendingInstallmentCount: number;
  overdueCount: number;
  dueSoonCount: number;
  items: PendingPaymentItem[];
  alerts: PendingPaymentAlert[];
};

const ALERT_WINDOW_DAYS = 3;

function startOfDay(date: Date) {
  const { year, month, day } = getZonedYMD(date);
  return zonedStartOfDay(year, month, day);
}

export function getDaysUntilPayment(paymentDate: Date, referenceDate = new Date()) {
  const paymentDay = startOfDay(paymentDate);
  const today = startOfDay(referenceDate);
  return Math.round((paymentDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** @deprecated Use getDaysUntilPayment */
export function getDaysUntilDue(paymentDate: Date, referenceDate = new Date()) {
  return getDaysUntilPayment(paymentDate, referenceDate);
}

function getPendingPaymentStatus(daysUntilPayment: number): PendingPaymentStatus {
  if (daysUntilPayment < 0) return "overdue";
  if (daysUntilPayment === 0) return "due_today";
  return "upcoming";
}

export function buildPendingPaymentItem(
  row: ExpenseCalculationRow & { id: string; title: string; category: string; method: string },
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
): PendingPaymentItem | null {
  if (!isCreditInstallmentExpense(row) || row.paidFromSavings) {
    return null;
  }

  const installmentIndex = getNextInstallmentIndex(row);
  if (installmentIndex == null) return null;

  const paymentDate = getNextInstallmentPaymentDate(row, settings);
  if (!paymentDate) return null;

  const daysUntilPayment = getDaysUntilPayment(paymentDate, referenceDate);

  return {
    transactionId: row.id,
    title: row.title,
    category: row.category,
    method: row.method,
    installmentAmount: row.installmentAmount!,
    installmentIndex,
    installmentNumber: installmentIndex + 1,
    totalInstallments: row.installmentsCount!,
    pendingInstallments: getPendingInstallmentsCount(row),
    paymentDate: paymentDate.toISOString(),
    daysUntilPayment,
    status: getPendingPaymentStatus(daysUntilPayment),
    canPayInstallment: canPayNextInstallment(row, settings, referenceDate),
  };
}

export function buildPendingPaymentAlert(
  row: ExpenseCalculationRow & { id: string; title: string; category: string; method: string },
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
): PendingPaymentAlert | null {
  const item = buildPendingPaymentItem(row, settings, referenceDate);
  if (!item || item.daysUntilPayment > ALERT_WINDOW_DAYS) return null;

  const { canPayInstallment: _canPayInstallment, ...alert } = item;
  return alert;
}

export function buildPendingPaymentsOverview(
  rows: Array<
    ExpenseCalculationRow & { id: string; title: string; category: string; method: string }
  >,
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
): PendingPaymentsOverview {
  let totalPendingAmount = 0;
  let pendingInstallmentCount = 0;
  const items: PendingPaymentItem[] = [];
  const alerts: PendingPaymentAlert[] = [];

  for (const row of rows) {
    const item = buildPendingPaymentItem(row, settings, referenceDate);
    if (!item) continue;

    totalPendingAmount += item.installmentAmount;
    pendingInstallmentCount += 1;
    items.push(item);

    if (item.daysUntilPayment <= ALERT_WINDOW_DAYS) {
      const { canPayInstallment: _canPayInstallment, ...alert } = item;
      alerts.push(alert);
    }
  }

  items.sort((a, b) => {
    if (a.daysUntilPayment !== b.daysUntilPayment) {
      return a.daysUntilPayment - b.daysUntilPayment;
    }

    return a.title.localeCompare(b.title);
  });

  alerts.sort((a, b) => {
    if (a.daysUntilPayment !== b.daysUntilPayment) {
      return a.daysUntilPayment - b.daysUntilPayment;
    }

    return a.title.localeCompare(b.title);
  });

  return {
    totalPendingAmount,
    pendingInstallmentCount,
    overdueCount: items.filter((item) => item.status === "overdue").length,
    dueSoonCount: items.filter((item) => item.status !== "overdue").length,
    items,
    alerts,
  };
}

export async function getPendingPaymentsOverview(
  userId: string,
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
): Promise<PendingPaymentsOverview> {
  const rows = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.userId, userId), eq(transaction.type, "expense")));

  const creditIds = rows
    .filter((row) => isCreditInstallmentExpense(row))
    .map((row) => row.id);
  const paymentPlans = await loadPaymentPlansByTransactionIds(creditIds);
  const rowsWithPlans = attachPaymentPlansToRows(rows, paymentPlans);

  return buildPendingPaymentsOverview(rowsWithPlans, settings, referenceDate);
}

export function getInstallmentDueDateForIndex(
  row: ExpenseCalculationRow,
  installmentIndex: number,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  return getInstallmentPaymentDateForIndex(row, installmentIndex, settings);
}

export { ALERT_WINDOW_DAYS };

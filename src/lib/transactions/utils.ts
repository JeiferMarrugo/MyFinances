import type { TransactionInput } from "@/lib/validations/transaction";
import type { FinancePeriodSettings } from "@/lib/finance-settings/periods";
import {
  canPayNextInstallment,
  getNextInstallmentDueDate,
  getNextInstallmentNumber,
  getPendingInstallmentsCount,
  isCreditInstallmentExpense,
} from "@/lib/transactions/installments";
import type { PaymentPlanData, PaymentPlanRecord } from "@/lib/transactions/payment-plan-shared";
import { attachPaymentPlan } from "@/lib/transactions/payment-plan-shared";
import type {
  DisplayTransaction,
  SerializedTransaction,
  TransactionRecord,
  TransactionType,
} from "@/lib/transactions/types";

type TransactionRow = {
  id: string;
  userId: string;
  merchantId: string | null;
  type: string;
  title: string;
  category: string;
  method: string;
  amount: number;
  occurredAt: Date;
  status: string;
  notes: string | null;
  installmentsCount: number | null;
  installmentAmount: number | null;
  creditAlreadyStarted: boolean;
  installmentsPaid: number;
  installmentFrequency: string | null;
  savingsGoalId: string | null;
  paidFromSavings: boolean;
  includes4x1000: boolean;
  gmfAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

export function mapTransactionRow(row: TransactionRow): TransactionRecord {
  return {
    ...row,
    type: row.type as TransactionType,
  };
}

export function serializeTransaction(
  row: TransactionRecord,
): SerializedTransaction {
  return {
    ...row,
    occurredAt: row.occurredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toDisplayTransaction(row: TransactionRecord): DisplayTransaction {
  return {
    id: row.id,
    merchant: row.title,
    category: row.category,
    method: row.method,
    date: row.occurredAt.toISOString(),
    amount: row.type === "income" ? row.amount : -row.amount,
    type: row.type,
    status: row.status === "pending" ? "pending" : "completed",
    merchantId: row.merchantId,
    installmentsCount: row.installmentsCount,
    installmentAmount: row.installmentAmount,
    creditAlreadyStarted: row.creditAlreadyStarted,
    installmentsPaid: row.installmentsPaid,
    installmentFrequency: row.installmentFrequency,
    notes: row.notes,
    paidFromSavings: row.paidFromSavings,
    savingsGoalId: row.savingsGoalId,
    includes4x1000: row.includes4x1000,
    gmfAmount: row.gmfAmount,
  };
}

export function displayTransactionToInput(
  transaction: DisplayTransaction,
): TransactionInput {
  const hasInstallments =
    transaction.installmentsCount != null &&
    transaction.installmentAmount != null;

  return {
    type: transaction.type,
    title: transaction.merchant,
    merchantId: transaction.merchantId,
    category: transaction.category as TransactionInput["category"],
    method: transaction.method as TransactionInput["method"],
    amount: hasInstallments
      ? transaction.installmentsCount! * transaction.installmentAmount!
      : Math.abs(transaction.amount),
    occurredAt: getDefaultDateTimeLocalValue(new Date(transaction.date)),
    notes: transaction.notes,
    installmentsCount: transaction.installmentsCount,
    installmentAmount: transaction.installmentAmount,
    creditAlreadyStarted: transaction.creditAlreadyStarted,
    installmentsPaid: transaction.installmentsPaid,
    installmentFrequency:
      (transaction.installmentFrequency as TransactionInput["installmentFrequency"]) ??
      (hasInstallments ? "monthly" : null),
    paidFromSavings: transaction.paidFromSavings ?? false,
    savingsGoalId: transaction.savingsGoalId ?? null,
    includes4x1000: transaction.includes4x1000 ?? false,
  };
}

export function enrichDisplayTransaction(
  row: TransactionRecord & { paymentPlan?: PaymentPlanData | null },
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
): DisplayTransaction {
  const base = toDisplayTransaction(row);
  const dueDate = getNextInstallmentDueDate(row, settings);
  const hasPaymentPlan = isCreditInstallmentExpense(row);

  return {
    ...base,
    canPayInstallment: canPayNextInstallment(row, settings, referenceDate),
    nextInstallmentDueDate: dueDate?.toISOString() ?? null,
    nextInstallmentNumber: getNextInstallmentNumber(row),
    pendingInstallments: getPendingInstallmentsCount(row),
    paymentPlanConfirmed: row.paymentPlan?.confirmed ?? false,
    hasPaymentPlan,
  };
}

export function enrichDisplayTransactions(
  rows: TransactionRecord[],
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
  paymentPlans?: Map<string, PaymentPlanRecord>,
): DisplayTransaction[] {
  return rows.map((row) =>
    enrichDisplayTransaction(
      paymentPlans ? attachPaymentPlan(row, paymentPlans.get(row.id)) : row,
      settings,
      referenceDate,
    ),
  );
}

export function toDisplayTransactions(
  rows: TransactionRecord[],
): DisplayTransaction[] {
  return rows.map(toDisplayTransaction);
}

export function getDefaultDateTimeLocalValue(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

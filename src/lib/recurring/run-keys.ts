import { formatRunDay } from "@/lib/recurring-incomes/schedule";

export function buildRecurringIncomeRunKey(
  recurringIncomeId: string,
  runDate: Date,
) {
  return `income:${recurringIncomeId}:${formatRunDay(runDate)}`;
}

export function buildRecurringExpenseRunKey(
  recurringExpenseId: string,
  runDate: Date,
) {
  return `expense:${recurringExpenseId}:${formatRunDay(runDate)}`;
}

export function getRecurringRunKeyFromTransaction(row: {
  recurringIncomeId: string | null;
  recurringExpenseId: string | null;
  occurredAt: Date;
}) {
  if (row.recurringIncomeId) {
    return buildRecurringIncomeRunKey(row.recurringIncomeId, row.occurredAt);
  }

  if (row.recurringExpenseId) {
    return buildRecurringExpenseRunKey(row.recurringExpenseId, row.occurredAt);
  }

  return null;
}

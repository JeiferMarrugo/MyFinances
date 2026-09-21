import type { RecurringIncomeRecord } from "@/lib/recurring-incomes/types";

export function serializeRecurringIncome(row: RecurringIncomeRecord) {
  return {
    ...row,
    startDate: row.startDate.toISOString(),
    nextRunAt: row.nextRunAt.toISOString(),
    lastRunAt: row.lastRunAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

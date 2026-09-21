import type { RecurringExpenseWithSpending } from "@/lib/recurring-expenses/types";

export function serializeRecurringExpense(item: RecurringExpenseWithSpending) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    method: item.method,
    budgetAmount: item.budgetAmount,
    frequency: item.frequency,
    dayOfMonth: item.dayOfMonth,
    startDate: item.startDate.toISOString(),
    nextRunAt: item.nextRunAt.toISOString(),
    lastRunAt: item.lastRunAt?.toISOString() ?? null,
    autoRegister: item.autoRegister,
    isActive: item.isActive,
    notes: item.notes,
    spentThisMonth: item.spentThisMonth,
    progressPercent: item.progressPercent,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

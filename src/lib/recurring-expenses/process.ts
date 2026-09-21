import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { recurringExpense, transaction } from "@/db/schema";
import { buildRecurringExpenseRunKey } from "@/lib/recurring/run-keys";
import {
  computeNextRunAt,
  endOfDay,
  isRecurringRunDue,
  startOfDay,
} from "@/lib/recurring-incomes/schedule";
import { mapRecurringExpenseRow } from "@/lib/recurring-expenses/queries";
import type { RecurringExpenseRecord } from "@/lib/recurring-expenses/types";

export type ProcessRecurringExpensesResult = {
  createdCount: number;
  createdTitles: string[];
};

export async function processDueRecurringExpenses(
  userId: string,
): Promise<ProcessRecurringExpensesResult> {
  const now = new Date();
  const dueItems = await db
    .select()
    .from(recurringExpense)
    .where(
      and(
        eq(recurringExpense.userId, userId),
        eq(recurringExpense.isActive, true),
        eq(recurringExpense.autoRegister, true),
        lte(recurringExpense.nextRunAt, endOfDay(now)),
      ),
    );

  let createdCount = 0;
  const createdTitles: string[] = [];

  for (const item of dueItems) {
    const mapped: RecurringExpenseRecord = mapRecurringExpenseRow(item);

    let nextRunAt = new Date(item.nextRunAt);

    while (isRecurringRunDue(nextRunAt, now)) {
      const runDate = startOfDay(nextRunAt);
      const runKey = buildRecurringExpenseRunKey(item.id, runDate);

      const inserted = await db
        .insert(transaction)
        .values({
          id: crypto.randomUUID(),
          userId,
          merchantId: null,
          type: "expense",
          title: item.title,
          category: item.category,
          method: item.method,
          amount: item.budgetAmount,
          occurredAt: runDate,
          status: "completed",
          notes: item.notes
            ? `${item.notes} (Gasto fijo automático)`
            : "Gasto fijo automático",
          recurringExpenseId: item.id,
          recurringRunKey: runKey,
        })
        .onConflictDoNothing({ target: transaction.recurringRunKey })
        .returning({ id: transaction.id });

      if (inserted.length > 0) {
        createdCount += 1;
        createdTitles.push(item.title);
      }

      const advancedNextRunAt = computeNextRunAt(
        mapped.frequency,
        nextRunAt,
        item.dayOfMonth,
      );

      await db
        .update(recurringExpense)
        .set({
          lastRunAt: runDate,
          nextRunAt: advancedNextRunAt,
        })
        .where(eq(recurringExpense.id, item.id));

      nextRunAt = advancedNextRunAt;
    }
  }

  return { createdCount, createdTitles };
}

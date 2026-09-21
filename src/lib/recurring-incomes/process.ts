import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { recurringIncome, transaction } from "@/db/schema";
import { buildRecurringIncomeRunKey } from "@/lib/recurring/run-keys";
import {
  computeNextRunAt,
  endOfDay,
  isRecurringRunDue,
  startOfDay,
} from "@/lib/recurring-incomes/schedule";
import type { RecurringIncomeRecord } from "@/lib/recurring-incomes/types";

export type ProcessRecurringIncomesResult = {
  createdCount: number;
  createdTitles: string[];
};

export async function processDueRecurringIncomes(
  userId: string,
): Promise<ProcessRecurringIncomesResult> {
  const now = new Date();
  const dueItems = await db
    .select()
    .from(recurringIncome)
    .where(
      and(
        eq(recurringIncome.userId, userId),
        eq(recurringIncome.isActive, true),
        lte(recurringIncome.nextRunAt, endOfDay(now)),
      ),
    );

  let createdCount = 0;
  const createdTitles: string[] = [];

  for (const item of dueItems) {
    const mapped: RecurringIncomeRecord = {
      ...item,
      frequency: item.frequency as RecurringIncomeRecord["frequency"],
    };

    let nextRunAt = new Date(item.nextRunAt);

    while (isRecurringRunDue(nextRunAt, now)) {
      const runDate = startOfDay(nextRunAt);
      const runKey = buildRecurringIncomeRunKey(item.id, runDate);

      const inserted = await db
        .insert(transaction)
        .values({
          id: crypto.randomUUID(),
          userId,
          merchantId: null,
          type: "income",
          title: item.title,
          category: item.category,
          method: item.method,
          amount: item.amount,
          occurredAt: runDate,
          status: "completed",
          notes: item.notes
            ? `${item.notes} (Ingreso recurrente automático)`
            : "Ingreso recurrente automático",
          recurringIncomeId: item.id,
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
        .update(recurringIncome)
        .set({
          lastRunAt: runDate,
          nextRunAt: advancedNextRunAt,
        })
        .where(eq(recurringIncome.id, item.id));

      nextRunAt = advancedNextRunAt;
    }
  }

  return { createdCount, createdTitles };
}

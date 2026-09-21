import { and, eq, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { getRecurringRunKeyFromTransaction } from "@/lib/recurring/run-keys";

export async function dedupeAutoRegisteredTransactions(userId: string) {
  const autoTransactions = await db
    .select()
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        or(
          isNotNull(transaction.recurringIncomeId),
          isNotNull(transaction.recurringExpenseId),
        ),
      ),
    );

  const groups = new Map<string, typeof autoTransactions>();

  for (const row of autoTransactions) {
    const key = getRecurringRunKeyFromTransaction(row);
    if (!key) continue;

    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }

  let removedCount = 0;

  for (const [runKey, rows] of groups) {
    rows.sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
    );

    const [keep, ...duplicates] = rows;

    if (!keep.recurringRunKey) {
      await db
        .update(transaction)
        .set({ recurringRunKey: runKey })
        .where(eq(transaction.id, keep.id));
    }

    for (const duplicate of duplicates) {
      await db.delete(transaction).where(eq(transaction.id, duplicate.id));
      removedCount += 1;
    }
  }

  return removedCount;
}

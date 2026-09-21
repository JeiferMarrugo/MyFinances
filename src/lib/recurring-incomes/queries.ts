import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { recurringIncome } from "@/db/schema";
import type { RecurringFrequency } from "@/lib/recurring-incomes/constants";
import type { RecurringIncomeRecord } from "@/lib/recurring-incomes/types";

type RecurringIncomeRow = {
  id: string;
  userId: string;
  title: string;
  category: string;
  method: string;
  amount: number;
  frequency: string;
  dayOfMonth: number;
  startDate: Date;
  nextRunAt: Date;
  lastRunAt: Date | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapRecurringIncomeRow(
  row: RecurringIncomeRow,
): RecurringIncomeRecord {
  return {
    ...row,
    frequency: row.frequency as RecurringFrequency,
  };
}

export async function getRecurringIncomesByUserId(userId: string) {
  const rows = await db
    .select()
    .from(recurringIncome)
    .where(eq(recurringIncome.userId, userId))
    .orderBy(asc(recurringIncome.title));

  return rows.map(mapRecurringIncomeRow);
}

export async function getRecurringIncomeById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(recurringIncome)
    .where(eq(recurringIncome.id, id))
    .limit(1);

  if (!row || row.userId !== userId) {
    return null;
  }

  return mapRecurringIncomeRow(row);
}

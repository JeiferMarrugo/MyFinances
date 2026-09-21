import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { recurringExpense, transaction } from "@/db/schema";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";
import { getMonthRange } from "@/lib/finance-settings/periods";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import type { RecurringFrequency } from "@/lib/recurring-incomes/constants";
import type {
  RecurringExpenseRecord,
  RecurringExpenseWithSpending,
} from "@/lib/recurring-expenses/types";
import { getExpenseAmountForMonth } from "@/lib/transactions/installments";

type RecurringExpenseRow = {
  id: string;
  userId: string;
  title: string;
  category: string;
  method: string;
  budgetAmount: number;
  frequency: string;
  dayOfMonth: number;
  startDate: Date;
  nextRunAt: Date;
  lastRunAt: Date | null;
  autoRegister: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapRecurringExpenseRow(
  row: RecurringExpenseRow,
): RecurringExpenseRecord {
  return {
    ...row,
    frequency: row.frequency as RecurringFrequency,
  };
}

function matchesRecurringExpense(
  expense: RecurringExpenseRecord,
  row: {
    title: string;
    category: string;
    recurringExpenseId: string | null;
  },
) {
  if (row.recurringExpenseId === expense.id) {
    return true;
  }

  return (
    row.category === expense.category &&
    row.title.trim().toLowerCase() === expense.title.trim().toLowerCase()
  );
}

export function calculateSpentForExpense(
  expense: RecurringExpenseRecord,
  expenseRows: Array<{
    title: string;
    category: string;
    recurringExpenseId: string | null;
    type: string;
    amount: number;
    occurredAt: Date;
    installmentsCount: number | null;
    installmentAmount: number | null;
    creditAlreadyStarted: boolean;
    installmentsPaid: number;
    installmentFrequency: string | null;
    paidFromSavings: boolean;
  }>,
  monthStart: Date,
  monthEnd: Date,
  settings?: FinanceSettingsRecord | null,
) {
  return expenseRows
    .filter((row) => matchesRecurringExpense(expense, row))
    .reduce(
      (sum, row) =>
        sum + getExpenseAmountForMonth(row, monthStart, monthEnd, settings),
      0,
    );
}

export async function getRecurringExpensesByUserId(userId: string) {
  const rows = await db
    .select()
    .from(recurringExpense)
    .where(eq(recurringExpense.userId, userId))
    .orderBy(asc(recurringExpense.title));

  return rows.map(mapRecurringExpenseRow);
}

export async function getRecurringExpenseById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(recurringExpense)
    .where(eq(recurringExpense.id, id))
    .limit(1);

  if (!row || row.userId !== userId) {
    return null;
  }

  return mapRecurringExpenseRow(row);
}

export async function getRecurringExpensesWithSpending(
  userId: string,
  referenceDate = new Date(),
  settingsInput?: FinanceSettingsRecord | null,
): Promise<RecurringExpenseWithSpending[]> {
  const settings = settingsInput ?? (await getOrCreateFinanceSettings(userId));
  const items = await getRecurringExpensesByUserId(userId);
  const { start, end } = getMonthRange(referenceDate, settings);

  const expenseRows = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.userId, userId), eq(transaction.type, "expense")));

  return items.map((item) => {
    const spentThisMonth = calculateSpentForExpense(
      item,
      expenseRows,
      start,
      end,
      settings,
    );
    const progressPercent =
      item.budgetAmount > 0
        ? Math.min(Math.round((spentThisMonth / item.budgetAmount) * 100), 999)
        : 0;

    return {
      ...item,
      spentThisMonth,
      progressPercent,
    };
  });
}

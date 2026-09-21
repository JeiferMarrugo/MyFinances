import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";
import { formatPeriodRange } from "@/lib/finance-settings/periods";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { getSavingsOverview, getSavingsPeriodActivity } from "@/lib/savings-goals/queries";
import {
  getExpenseAmountForMonth,
  getMonthRange,
  isCreditInstallmentExpense,
  sumExpensesForMonth,
} from "@/lib/transactions/installments";
import {
  attachPaymentPlansToRows,
  loadPaymentPlansByTransactionIds,
} from "@/lib/transactions/payment-plan";
import type { MonthlySummary, TransactionRecord } from "@/lib/transactions/types";
import { mapTransactionRow } from "@/lib/transactions/utils";

export { getMonthRange } from "@/lib/transactions/installments";

export async function getTransactionsByUserId(
  userId: string,
  limit?: number,
): Promise<TransactionRecord[]> {
  const query = db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId))
    .orderBy(desc(transaction.occurredAt));

  if (limit) {
    return (await query.limit(limit)).map(mapTransactionRow);
  }

  return (await query).map(mapTransactionRow);
}

export async function getRecentTransactionsByUserId(
  userId: string,
  limit = 5,
): Promise<TransactionRecord[]> {
  return getTransactionsByUserId(userId, limit);
}

export async function getRecentExpensesByUserId(
  userId: string,
  limit = 5,
): Promise<TransactionRecord[]> {
  const rows = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.userId, userId), eq(transaction.type, "expense")))
    .orderBy(desc(transaction.occurredAt))
    .limit(limit);

  return rows.map(mapTransactionRow);
}

export async function getExpenseRowsWithPaymentPlans(userId: string) {
  const expenseRows = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.userId, userId), eq(transaction.type, "expense")));

  const creditExpenseIds = expenseRows
    .filter((row) => isCreditInstallmentExpense(row))
    .map((row) => row.id);
  const paymentPlans = await loadPaymentPlansByTransactionIds(creditExpenseIds);

  return attachPaymentPlansToRows(expenseRows, paymentPlans);
}

export async function getMonthlySummary(
  userId: string,
  referenceDate = new Date(),
  settingsInput?: FinanceSettingsRecord | null,
): Promise<MonthlySummary> {
  const settings = settingsInput ?? (await getOrCreateFinanceSettings(userId));
  const { start, end } = getMonthRange(referenceDate, settings);

  const [monthRows, expenseRowsWithPlans] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          gte(transaction.occurredAt, start),
          lte(transaction.occurredAt, end),
        ),
      ),
    getExpenseRowsWithPaymentPlans(userId),
  ]);

  let monthlyIncome = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const row of monthRows) {
    if (row.type === "income") {
      monthlyIncome += row.amount;
      incomeCount += 1;
    } else if (row.type === "expense") {
      expenseCount += 1;
    }
  }

  let cashExpenses = 0;
  let creditDueThisMonth = 0;

  for (const row of expenseRowsWithPlans) {
    const dueAmount = getExpenseAmountForMonth(row, start, end, settings);

    if (row.paidFromSavings) {
      continue;
    }

    if (dueAmount <= 0) continue;

    if (isCreditInstallmentExpense(row)) {
      creditDueThisMonth += dueAmount;
    } else {
      cashExpenses += dueAmount;
    }
  }

  const monthlyExpenses = sumExpensesForMonth(
    expenseRowsWithPlans,
    start,
    end,
    settings,
  );
  const [savingsOverview, savingsActivity] = await Promise.all([
    getSavingsOverview(userId),
    getSavingsPeriodActivity(userId, start, end),
  ]);
  const balance = monthlyIncome - monthlyExpenses;
  const savingsRate =
    monthlyIncome > 0 ? Math.round((balance / monthlyIncome) * 100) : 0;

  return {
    balance,
    monthlyIncome,
    monthlyExpenses,
    cashExpenses,
    creditDueThisMonth,
    expensesFromSavings: savingsActivity.expenseWithdrawals,
    savingsContributions: savingsActivity.contributions,
    savingsWithdrawals: savingsActivity.withdrawals,
    savingsNetChange: savingsActivity.netChange,
    totalSavingsBalance: savingsOverview.totalBalance,
    savingsCapacity: balance,
    savingsRate,
    transactionCount: incomeCount + expenseCount,
    incomeCount,
    expenseCount,
    periodLabel: formatPeriodRange(start, end),
  };
}

export async function getTransactionById(userId: string, transactionId: string) {
  const [record] = await db
    .select()
    .from(transaction)
    .where(eq(transaction.id, transactionId))
    .limit(1);

  if (!record || record.userId !== userId) {
    return null;
  }

  return mapTransactionRow(record);
}

export async function getExpenseRowsByUserId(userId: string) {
  return db
    .select()
    .from(transaction)
    .where(and(eq(transaction.userId, userId), eq(transaction.type, "expense")));
}

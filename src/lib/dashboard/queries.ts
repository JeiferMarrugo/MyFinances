import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import type {
  BalanceTrend,
  CategorySpending,
  DashboardStats,
  MonthlyTrend,
  PaymentMethodBreakdown,
  SavingsOverview,
} from "@/lib/dashboard/types";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";
import {
  buildMonthlyTrendBuckets,
  getMonthRange,
  getPreviousMonthReference,
} from "@/lib/finance-settings/periods";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { getSavingsExpensesForPeriod, getSavingsOverview } from "@/lib/savings-goals/queries";
import type { SavingsOverviewStats } from "@/lib/savings-goals/types";
import { getRecurringExpensesWithSpending } from "@/lib/recurring-expenses/queries";
import {
  getExpenseAmountForMonth,
  sumExpensesForMonth,
} from "@/lib/transactions/installments";
import { getMonthlySummary, getExpenseRowsWithPaymentPlans } from "@/lib/transactions/queries";
import { getPendingPaymentsOverview } from "@/lib/transactions/pending-payments";

const categoryColors = [
  "#7c3aed",
  "#059669",
  "#2563eb",
  "#db2777",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#64748b",
];

const methodGradients: Record<string, string> = {
  Transferencia: "from-[#5b21b6] to-[#7c3aed]",
  "Tarjeta débito": "from-[#1e293b] to-[#334155]",
  "Tarjeta crédito": "from-[#312e81] to-[#4338ca]",
  Efectivo: "from-[#f8fafc] to-[#e2e8f0] text-foreground",
};

export async function getMonthlyTrend(
  userId: string,
  months = 6,
  settingsInput?: FinanceSettingsRecord | null,
): Promise<MonthlyTrend> {
  const settings = settingsInput ?? (await getOrCreateFinanceSettings(userId));
  const buckets = buildMonthlyTrendBuckets(months, new Date(), settings);

  const [incomeRows, expenseRowsWithPlans] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(and(eq(transaction.userId, userId), eq(transaction.type, "income"))),
    getExpenseRowsWithPaymentPlans(userId),
  ]);

  const earliestStart = buckets[0]?.start ?? new Date();

  for (const row of incomeRows) {
    if (row.occurredAt < earliestStart) continue;

    const bucket = buckets.find(
      (item) => row.occurredAt >= item.start && row.occurredAt <= item.end,
    );

    if (bucket) {
      bucket.income += row.amount;
    }
  }

  for (const bucket of buckets) {
    bucket.expenses = sumExpensesForMonth(
      expenseRowsWithPlans,
      bucket.start,
      bucket.end,
      settings,
    );
  }

  return {
    labels: buckets.map((bucket) => bucket.label),
    income: buckets.map((bucket) => bucket.income),
    expenses: buckets.map((bucket) => bucket.expenses),
  };
}

export async function getCategorySpending(
  userId: string,
  referenceDate = new Date(),
  settingsInput?: FinanceSettingsRecord | null,
): Promise<CategorySpending[]> {
  const settings = settingsInput ?? (await getOrCreateFinanceSettings(userId));
  const budgetItems = await getRecurringExpensesWithSpending(
    userId,
    referenceDate,
    settings,
  );
  const activeBudgetItems = budgetItems.filter((item) => item.isActive);

  if (activeBudgetItems.length > 0) {
    return activeBudgetItems.map((item, index) => ({
      name: item.title,
      spent: item.spentThisMonth,
      limit: item.budgetAmount,
      share:
        item.budgetAmount > 0
          ? Math.min(
              Math.round((item.spentThisMonth / item.budgetAmount) * 100),
              999,
            )
          : 0,
      color: categoryColors[index % categoryColors.length],
    }));
  }

  const { start, end } = getMonthRange(referenceDate, settings);

  const expenseRowsWithPlans = await getExpenseRowsWithPaymentPlans(userId);

  const totals = new Map<string, number>();
  let totalExpenses = 0;

  for (const row of expenseRowsWithPlans) {
    const spent = getExpenseAmountForMonth(row, start, end, settings);
    if (spent <= 0) continue;

    totals.set(row.category, (totals.get(row.category) ?? 0) + spent);
    totalExpenses += spent;
  }

  return Array.from(totals.entries())
    .map(([name, spent], index) => ({
      name,
      spent,
      share:
        totalExpenses > 0 ? Math.round((spent / totalExpenses) * 100) : 0,
      color: categoryColors[index % categoryColors.length],
    }))
    .sort((a, b) => b.spent - a.spent);
}

export async function getPaymentMethodBreakdown(
  userId: string,
  referenceDate = new Date(),
  settingsInput?: FinanceSettingsRecord | null,
): Promise<PaymentMethodBreakdown[]> {
  const settings = settingsInput ?? (await getOrCreateFinanceSettings(userId));
  const { start, end } = getMonthRange(referenceDate, settings);

  const [incomeRows, expenseRowsWithPlans] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, "income"),
          gte(transaction.occurredAt, start),
          lte(transaction.occurredAt, end),
        ),
      ),
    getExpenseRowsWithPaymentPlans(userId),
  ]);

  const incomeByMethod = new Map<string, number>();
  const expenseByMethod = new Map<string, number>();

  for (const row of incomeRows) {
    incomeByMethod.set(
      row.method,
      (incomeByMethod.get(row.method) ?? 0) + row.amount,
    );
  }

  for (const row of expenseRowsWithPlans) {
    const spent = getExpenseAmountForMonth(row, start, end, settings);
    if (spent <= 0) continue;

    expenseByMethod.set(
      row.method,
      (expenseByMethod.get(row.method) ?? 0) + spent,
    );
  }

  const methods = new Set([...incomeByMethod.keys(), ...expenseByMethod.keys()]);

  return Array.from(methods)
    .map((name) => {
      const income = incomeByMethod.get(name) ?? 0;
      const expenses = expenseByMethod.get(name) ?? 0;
      const net = income - expenses;

      return {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        amount: net,
        income,
        expenses,
        subtitle:
          income > 0 && expenses > 0
            ? `Ingresos ${income.toLocaleString("es-CO")} · Gastos ${expenses.toLocaleString("es-CO")}`
            : income > 0
              ? `Ingresos ${income.toLocaleString("es-CO")}`
              : `Gastos ${expenses.toLocaleString("es-CO")}`,
        gradient:
          methodGradients[name] ?? "from-[#5b21b6] to-[#7c3aed]",
      };
    })
    .sort((a, b) => Math.abs(b.expenses) + b.income - (Math.abs(a.expenses) + a.income))
    .slice(0, 3);
}

export function buildSavingsOverview(
  summary: Awaited<ReturnType<typeof getMonthlySummary>>,
  savingsStats: SavingsOverviewStats,
): SavingsOverview {
  const activeGoals = savingsStats.goals.filter((goal) => goal.isActive);
  const goalTarget = activeGoals.reduce(
    (sum, goal) => sum + (goal.targetAmount ?? 0),
    0,
  );
  const totalSavings = savingsStats.totalBalance;
  const remaining = Math.max(goalTarget - totalSavings, 0);
  const progress =
    goalTarget > 0
      ? Math.min(Math.round((totalSavings / goalTarget) * 100), 999)
      : 0;

  return {
    title: "Ahorro del mes",
    current: totalSavings,
    target: goalTarget,
    remaining,
    expenses: summary.expensesFromSavings,
    periodContributions: summary.savingsContributions,
    totalSavings,
    activeGoals: savingsStats.activeGoals,
    progress,
    periodExpenses: [],
  };
}

export async function getBalanceTrend(
  userId: string,
  settingsInput?: FinanceSettingsRecord | null,
): Promise<BalanceTrend> {
  const settings = settingsInput ?? (await getOrCreateFinanceSettings(userId));
  const now = new Date();
  const previousReference = getPreviousMonthReference(now);

  const [current, previous] = await Promise.all([
    getMonthlySummary(userId, now, settings),
    getMonthlySummary(userId, previousReference, settings),
  ]);

  let trendPercent: number | null = null;

  if (previous.balance !== 0) {
    trendPercent = Math.round(
      ((current.balance - previous.balance) / Math.abs(previous.balance)) * 100,
    );
  } else if (current.balance !== 0) {
    trendPercent = current.balance > 0 ? 100 : -100;
  }

  return {
    balance: current.balance,
    trendPercent,
    periodLabel: current.periodLabel,
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const settings = await getOrCreateFinanceSettings(userId);
  const { start, end } = getMonthRange(new Date(), settings);

  const [
    summary,
    monthlyTrend,
    categorySpending,
    paymentMethods,
    balanceTrend,
    savingsOverview,
    periodExpenses,
    pendingPayments,
  ] = await Promise.all([
      getMonthlySummary(userId, new Date(), settings),
      getMonthlyTrend(userId, 6, settings),
      getCategorySpending(userId, new Date(), settings),
      getPaymentMethodBreakdown(userId, new Date(), settings),
      getBalanceTrend(userId, settings),
      getSavingsOverview(userId),
      getSavingsExpensesForPeriod(userId, start, end),
      getPendingPaymentsOverview(userId, settings),
    ]);

  return {
    summary,
    monthlyTrend,
    categorySpending,
    paymentMethods,
    savingsOverview: {
      ...buildSavingsOverview(summary, savingsOverview),
      periodExpenses,
    },
    balanceTrend,
    pendingPayments,
  };
}

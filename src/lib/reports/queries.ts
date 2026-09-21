import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import type { CategorySpending, PaymentMethodBreakdown } from "@/lib/dashboard/types";
import {
  buildMonthlyTrendBuckets,
  formatPeriodRange,
  getMonthRange,
  getPreviousMonthReference,
  getQuarterPeriodForDate,
  getYearPeriodForDate,
} from "@/lib/finance-settings/periods";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { getRecurringIncomesByUserId } from "@/lib/recurring-incomes/queries";
import {
  getSavingsOverview,
  getSavingsPeriodActivity,
} from "@/lib/savings-goals/queries";
import {
  getExpenseAmountForMonth,
  getInstallmentPaymentDateForIndex,
  getNextInstallmentIndex,
  getPaidInstallmentsCount,
  getPendingInstallmentsCount,
  isCreditInstallmentExpense,
} from "@/lib/transactions/installments";
import { getExpenseRowsWithPaymentPlans } from "@/lib/transactions/queries";
import { getPendingPaymentsOverview } from "@/lib/transactions/pending-payments";
import type {
  CreditReportItem,
  FixedVariableSpending,
  MerchantSpending,
  ProjectionMonth,
  RecurringIncomeReportItem,
  ReportAlert,
  ReportComparison,
  ReportExportRow,
  ReportPeriod,
  ReportsData,
  ReportSummary,
  SavingsReport,
} from "@/lib/reports/types";

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

function getReportPeriodRange(
  periodType: ReportPeriod,
  referenceDate: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
) {
  if (periodType === "quarter") {
    const period = getQuarterPeriodForDate(referenceDate, settings);
    return {
      start: period.start,
      end: period.end,
      label: period.label,
      rangeLabel: formatPeriodRange(period.start, period.end),
    };
  }

  if (periodType === "year") {
    const period = getYearPeriodForDate(referenceDate, settings);
    return {
      start: period.start,
      end: period.end,
      label: period.label,
      rangeLabel: formatPeriodRange(period.start, period.end),
    };
  }

  const { start, end } = getMonthRange(referenceDate, settings);
  const monthPeriod = getMonthRange(referenceDate, settings);
  const monthLabel = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(referenceDate);

  return {
    start: monthPeriod.start,
    end: monthPeriod.end,
    label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
    rangeLabel: formatPeriodRange(start, end),
  };
}

function getPreviousPeriodReference(
  periodType: ReportPeriod,
  referenceDate: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
) {
  if (periodType === "month") {
    return getPreviousMonthReference(referenceDate);
  }

  const { start } = getReportPeriodRange(periodType, referenceDate, settings);
  const previous = new Date(start);
  previous.setDate(previous.getDate() - 1);
  return previous;
}

function getYearAgoReference(referenceDate: Date) {
  const date = new Date(referenceDate);
  date.setFullYear(date.getFullYear() - 1);
  return date;
}

function sumIncomeForRange(
  incomeRows: Array<{ amount: number; occurredAt: Date }>,
  start: Date,
  end: Date,
) {
  return incomeRows
    .filter((row) => row.occurredAt >= start && row.occurredAt <= end)
    .reduce((sum, row) => sum + row.amount, 0);
}

function sumExpensesForRange(
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
) {
  let total = 0;

  for (const row of expenseRows) {
    total += getExpenseAmountForMonth(row, start, end, settings);
  }

  return total;
}

function sumCreditInstallmentsPaidInRange(
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
) {
  let total = 0;

  for (const row of expenseRows) {
    if (!isCreditInstallmentExpense(row) || !row.paymentPlan?.confirmed) continue;

    for (const item of row.paymentPlan.items) {
      if (item.status !== "paid" || !item.paidAt) continue;
      if (item.paidAt >= start && item.paidAt <= end) {
        total += item.amount;
      }
    }
  }

  return total;
}

function buildSummaryForRange(
  incomeRows: Array<{ amount: number; occurredAt: Date }>,
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
  pendingCreditAmount: number,
): ReportSummary {
  const income = sumIncomeForRange(incomeRows, start, end);
  const expenses = sumExpensesForRange(expenseRows, start, end, settings);

  return {
    income,
    expenses,
    balance: income - expenses,
    creditInstallmentsPaid: sumCreditInstallmentsPaidInRange(
      expenseRows,
      start,
      end,
    ),
    pendingCreditAmount,
  };
}

function getCategorySpendingForRange(
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
): CategorySpending[] {
  const totals = new Map<string, number>();
  let totalExpenses = 0;

  for (const row of expenseRows) {
    const spent = getExpenseAmountForMonth(row, start, end, settings);
    if (spent <= 0) continue;

    totals.set(row.category, (totals.get(row.category) ?? 0) + spent);
    totalExpenses += spent;
  }

  return Array.from(totals.entries())
    .map(([name, spent], index) => ({
      name,
      spent,
      share: totalExpenses > 0 ? Math.round((spent / totalExpenses) * 100) : 0,
      color: categoryColors[index % categoryColors.length],
    }))
    .sort((a, b) => b.spent - a.spent);
}

function getTopMerchantsForRange(
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
  limit = 8,
): MerchantSpending[] {
  const totals = new Map<string, { amount: number; count: number }>();
  let totalExpenses = 0;

  for (const row of expenseRows) {
    const spent = getExpenseAmountForMonth(row, start, end, settings);
    if (spent <= 0) continue;

    const current = totals.get(row.title) ?? { amount: 0, count: 0 };
    totals.set(row.title, {
      amount: current.amount + spent,
      count: current.count + 1,
    });
    totalExpenses += spent;
  }

  return Array.from(totals.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      transactions: data.count,
      share:
        totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

function getFixedVariableSpending(
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
): FixedVariableSpending {
  let fixed = 0;
  let total = 0;

  for (const row of expenseRows) {
    const spent = getExpenseAmountForMonth(row, start, end, settings);
    if (spent <= 0) continue;

    total += spent;

    if (row.recurringExpenseId) {
      fixed += spent;
    }
  }

  const variable = Math.max(total - fixed, 0);

  return {
    fixed,
    variable,
    fixedShare: total > 0 ? Math.round((fixed / total) * 100) : 0,
  };
}

function getCreditReports(
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
): CreditReportItem[] {
  const items: CreditReportItem[] = [];

  for (const row of expenseRows) {
    if (!isCreditInstallmentExpense(row)) continue;

    const paidInstallments = getPaidInstallmentsCount(row);
    const pendingInstallments = getPendingInstallmentsCount(row);
    const nextIndex = getNextInstallmentIndex(row);
    const nextPaymentDate =
      nextIndex != null
        ? getInstallmentPaymentDateForIndex(row, nextIndex, settings)
        : null;

    const pendingPlanItems =
      row.paymentPlan?.confirmed === true
        ? row.paymentPlan.items.filter((item) => item.status === "pending")
        : [];

    items.push({
      transactionId: row.id,
      title: row.title,
      totalInstallments: row.installmentsCount!,
      paidInstallments,
      pendingInstallments,
      installmentAmount: row.installmentAmount!,
      totalPendingAmount: pendingPlanItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      ),
      nextPaymentDate: nextPaymentDate?.toISOString() ?? null,
      nextPaymentAmount:
        nextIndex != null ? row.installmentAmount! : null,
    });
  }

  return items
    .filter((item) => item.pendingInstallments > 0)
    .sort((a, b) => {
      if (!a.nextPaymentDate) return 1;
      if (!b.nextPaymentDate) return -1;
      return a.nextPaymentDate.localeCompare(b.nextPaymentDate);
    });
}

function getPaymentMethodsForRange(
  incomeRows: Array<{ amount: number; occurredAt: Date; method: string }>,
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
): PaymentMethodBreakdown[] {
  const incomeByMethod = new Map<string, number>();
  const expenseByMethod = new Map<string, number>();

  for (const row of incomeRows) {
    if (row.occurredAt < start || row.occurredAt > end) continue;
    incomeByMethod.set(
      row.method,
      (incomeByMethod.get(row.method) ?? 0) + row.amount,
    );
  }

  for (const row of expenseRows) {
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

      return {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        amount: income - expenses,
        income,
        expenses,
        subtitle:
          income > 0 && expenses > 0
            ? `Ingresos ${income.toLocaleString("es-CO")} · Gastos ${expenses.toLocaleString("es-CO")}`
            : income > 0
              ? `Ingresos ${income.toLocaleString("es-CO")}`
              : `Gastos ${expenses.toLocaleString("es-CO")}`,
        gradient: methodGradients[name] ?? "from-[#5b21b6] to-[#7c3aed]",
      };
    })
    .sort(
      (a, b) =>
        Math.abs(b.expenses) + b.income - (Math.abs(a.expenses) + a.income),
    );
}

async function getSavingsReport(
  userId: string,
  start: Date,
  end: Date,
): Promise<SavingsReport> {
  const [overview, activity] = await Promise.all([
    getSavingsOverview(userId),
    getSavingsPeriodActivity(userId, start, end),
  ]);

  return {
    totalBalance: overview.totalBalance,
    activeGoals: overview.activeGoals,
    periodDeposits: activity.contributions,
    periodWithdrawals: activity.withdrawals,
    goals: overview.goals.map((goal) => ({
      name: goal.name,
      currentBalance: goal.currentBalance,
      targetAmount: goal.targetAmount,
      progressPercent: goal.progressPercent,
    })),
  };
}

async function getRecurringIncomeReport(
  userId: string,
  incomeRows: Array<{
    title: string;
    category: string;
    amount: number;
    occurredAt: Date;
  }>,
  start: Date,
  end: Date,
): Promise<RecurringIncomeReportItem[]> {
  const recurringIncomes = await getRecurringIncomesByUserId(userId);

  return recurringIncomes.map((item) => {
    const receivedInPeriod = incomeRows
      .filter(
        (row) =>
          row.occurredAt >= start &&
          row.occurredAt <= end &&
          row.title.trim().toLowerCase() === item.title.trim().toLowerCase() &&
          row.category === item.category,
      )
      .reduce((sum, row) => sum + row.amount, 0);

    return {
      id: item.id,
      title: item.title,
      amount: item.amount,
      frequency: item.frequency,
      isActive: item.isActive,
      receivedInPeriod,
    };
  });
}

function getInstallmentProjection(
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  months = 6,
): ProjectionMonth[] {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setMonth(horizon.getMonth() + months);

  const buckets = new Map<string, ProjectionMonth>();

  for (let index = 0; index < months; index += 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() + index, 1);
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("es-CO", {
      month: "short",
      year: "numeric",
    }).format(cursor);

    buckets.set(key, {
      monthKey: key,
      label,
      amount: 0,
      installmentCount: 0,
    });
  }

  for (const row of expenseRows) {
    if (!isCreditInstallmentExpense(row) || !row.paymentPlan?.confirmed) continue;

    for (const item of row.paymentPlan.items) {
      if (item.status !== "pending") continue;
      if (item.paymentDate < now || item.paymentDate > horizon) continue;

      const key = `${item.paymentDate.getFullYear()}-${String(item.paymentDate.getMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.get(key);
      if (!bucket) continue;

      bucket.amount += item.amount;
      bucket.installmentCount += 1;
    }
  }

  return Array.from(buckets.values());
}

function buildComparison(
  current: ReportSummary,
  previous: ReportSummary,
  previousLabel: string,
  yearAgo: ReportSummary | null,
  yearAgoLabel: string | null,
): ReportComparison {
  const incomeChangePercent =
    previous.income !== 0
      ? Math.round(((current.income - previous.income) / previous.income) * 100)
      : current.income > 0
        ? 100
        : null;

  const expenseChangePercent =
    previous.expenses !== 0
      ? Math.round(
          ((current.expenses - previous.expenses) / previous.expenses) * 100,
        )
      : current.expenses > 0
        ? 100
        : null;

  return {
    previous: {
      label: previousLabel,
      income: previous.income,
      expenses: previous.expenses,
      balance: previous.balance,
    },
    yearAgo: yearAgo
      ? {
          label: yearAgoLabel ?? "Año anterior",
          income: yearAgo.income,
          expenses: yearAgo.expenses,
          balance: yearAgo.balance,
        }
      : null,
    incomeChangePercent,
    expenseChangePercent,
  };
}

function buildAlerts(
  comparison: ReportComparison,
  categories: CategorySpending[],
  credits: CreditReportItem[],
  projection: ProjectionMonth[],
): ReportAlert[] {
  const alerts: ReportAlert[] = [];

  if (
    comparison.expenseChangePercent != null &&
    comparison.expenseChangePercent >= 15
  ) {
    alerts.push({
      id: "expenses-up",
      tone: "warning",
      title: "Gastos en aumento",
      description: `Tus gastos subieron ${comparison.expenseChangePercent}% respecto al periodo anterior.`,
    });
  }

  if (
    comparison.expenseChangePercent != null &&
    comparison.expenseChangePercent <= -10
  ) {
    alerts.push({
      id: "expenses-down",
      tone: "success",
      title: "Gastos bajo control",
      description: `Reduciste tus gastos ${Math.abs(comparison.expenseChangePercent)}% versus el periodo anterior.`,
    });
  }

  const topCategory = categories[0];
  if (topCategory && topCategory.share >= 40) {
    alerts.push({
      id: "category-concentration",
      tone: "info",
      title: "Alta concentración de gasto",
      description: `${topCategory.name} representa el ${topCategory.share}% de tus gastos en este periodo.`,
    });
  }

  const dueSoon = credits.filter((credit) => {
    if (!credit.nextPaymentDate) return false;
    const days =
      (new Date(credit.nextPaymentDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  });

  if (dueSoon.length > 0) {
    alerts.push({
      id: "credit-due-soon",
      tone: "warning",
      title: "Cuotas próximas a vencer",
      description: `Tienes ${dueSoon.length} crédito(s) con cuota en los próximos 7 días.`,
    });
  }

  const nextProjection = projection.find((item) => item.amount > 0);
  if (nextProjection) {
    alerts.push({
      id: "projection-next",
      tone: "info",
      title: "Proyección de cuotas",
      description: `En ${nextProjection.label} tienes ${nextProjection.installmentCount} cuota(s) por un total de ${nextProjection.amount.toLocaleString("es-CO")}.`,
    });
  }

  return alerts.slice(0, 4);
}

function buildExportRows(
  incomeRows: Array<{
    title: string;
    category: string;
    method: string;
    amount: number;
    occurredAt: Date;
  }>,
  expenseRows: Awaited<ReturnType<typeof getExpenseRowsWithPaymentPlans>>,
  start: Date,
  end: Date,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
): ReportExportRow[] {
  const rows: ReportExportRow[] = [];

  for (const row of incomeRows) {
    if (row.occurredAt < start || row.occurredAt > end) continue;

    rows.push({
      date: row.occurredAt.toISOString(),
      type: "Ingreso",
      title: row.title,
      category: row.category,
      method: row.method,
      amount: row.amount,
    });
  }

  for (const row of expenseRows) {
    if (isCreditInstallmentExpense(row) && row.paymentPlan?.confirmed) {
      for (const item of row.paymentPlan.items) {
        if (item.status !== "paid" || !item.paidAt) continue;
        if (item.paidAt < start || item.paidAt > end) continue;

        rows.push({
          date: item.paidAt.toISOString(),
          type: "Gasto crédito",
          title: `${row.title} · Cuota ${item.installmentIndex + 1}`,
          category: row.category,
          method: row.method,
          amount: item.amount,
        });
      }
      continue;
    }

    if (row.occurredAt < start || row.occurredAt > end) continue;
    if (row.paidFromSavings) continue;
    if (row.loanId) continue;

    rows.push({
      date: row.occurredAt.toISOString(),
      type: "Gasto",
      title: row.title,
      category: row.category,
      method: row.method,
      amount: row.amount,
    });
  }

  return rows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

async function getMonthlyTrendForReports(
  userId: string,
  settings: Awaited<ReturnType<typeof getOrCreateFinanceSettings>>,
  months = 12,
) {
  const buckets = buildMonthlyTrendBuckets(months, new Date(), settings);
  const [incomeRows, expenseRows] = await Promise.all([
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
    let total = 0;

    for (const row of expenseRows) {
      total += getExpenseAmountForMonth(row, bucket.start, bucket.end, settings);
    }

    bucket.expenses = total;
  }

  return {
    labels: buckets.map((bucket) => bucket.label),
    income: buckets.map((bucket) => bucket.income),
    expenses: buckets.map((bucket) => bucket.expenses),
  };
}

export function parseReportPeriod(value: string | null | undefined): ReportPeriod {
  if (value === "quarter" || value === "year") return value;
  return "month";
}

export async function getReportsData(
  userId: string,
  periodType: ReportPeriod = "month",
  referenceDate = new Date(),
): Promise<ReportsData> {
  const settings = await getOrCreateFinanceSettings(userId);
  const period = getReportPeriodRange(periodType, referenceDate, settings);
  const previousReference = getPreviousPeriodReference(
    periodType,
    referenceDate,
    settings,
  );
  const previousPeriod = getReportPeriodRange(
    periodType,
    previousReference,
    settings,
  );
  const yearAgoReference = getYearAgoReference(referenceDate);
  const yearAgoPeriod = getReportPeriodRange(
    periodType,
    yearAgoReference,
    settings,
  );

  const [incomeRows, expenseRows, pendingPayments, monthlyTrend] =
    await Promise.all([
      db
        .select()
        .from(transaction)
        .where(and(eq(transaction.userId, userId), eq(transaction.type, "income"))),
      getExpenseRowsWithPaymentPlans(userId),
      getPendingPaymentsOverview(userId, settings, referenceDate),
      getMonthlyTrendForReports(userId, settings, 12),
    ]);

  const currentSummary = buildSummaryForRange(
    incomeRows,
    expenseRows,
    period.start,
    period.end,
    settings,
    pendingPayments.totalPendingAmount,
  );

  const previousSummary = buildSummaryForRange(
    incomeRows,
    expenseRows,
    previousPeriod.start,
    previousPeriod.end,
    settings,
    pendingPayments.totalPendingAmount,
  );

  const yearAgoSummary = buildSummaryForRange(
    incomeRows,
    expenseRows,
    yearAgoPeriod.start,
    yearAgoPeriod.end,
    settings,
    pendingPayments.totalPendingAmount,
  );

  const categories = getCategorySpendingForRange(
    expenseRows,
    period.start,
    period.end,
    settings,
  );
  const merchants = getTopMerchantsForRange(
    expenseRows,
    period.start,
    period.end,
    settings,
  );
  const fixedVariable = getFixedVariableSpending(
    expenseRows,
    period.start,
    period.end,
    settings,
  );
  const credits = getCreditReports(expenseRows, settings);
  const paymentMethods = getPaymentMethodsForRange(
    incomeRows,
    expenseRows,
    period.start,
    period.end,
    settings,
  );
  const projection = getInstallmentProjection(expenseRows, 6);

  const [savings, recurringIncomes] = await Promise.all([
    getSavingsReport(userId, period.start, period.end),
    getRecurringIncomeReport(userId, incomeRows, period.start, period.end),
  ]);

  const comparison = buildComparison(
    currentSummary,
    previousSummary,
    previousPeriod.label,
    yearAgoSummary,
    yearAgoPeriod.label,
  );

  const alerts = buildAlerts(comparison, categories, credits, projection);
  const exportRows = buildExportRows(
    incomeRows,
    expenseRows,
    period.start,
    period.end,
    settings,
  );

  return {
    periodType,
    periodLabel: period.label,
    periodRangeLabel: period.rangeLabel,
    periodStart: period.start.toISOString(),
    periodEnd: period.end.toISOString(),
    summary: currentSummary,
    comparison,
    monthlyTrend,
    categories,
    merchants,
    fixedVariable,
    credits,
    paymentMethods,
    savings,
    recurringIncomes,
    projection,
    alerts,
    exportRows,
  };
}

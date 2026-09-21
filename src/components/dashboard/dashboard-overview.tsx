"use client";

import { BudgetBreakdown } from "@/components/dashboard/budget-breakdown";
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardWallets } from "@/components/dashboard/dashboard-wallets";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { PendingPaymentsCard } from "@/components/dashboard/pending-payments-card";
import { SavingsGoalCard } from "@/components/dashboard/savings-goal-card";
import { RecentTransactionsTable } from "@/components/transactions/transactions-table";
import type {
  CategorySpending,
  MonthlyTrend,
  PaymentMethodBreakdown,
  SavingsOverview,
} from "@/lib/dashboard/types";
import type { PendingPaymentsOverview } from "@/lib/transactions/pending-payments";
import type { MerchantRecord } from "@/lib/merchants/types";
import type {
  DisplayTransaction,
  MonthlySummary,
} from "@/lib/transactions/types";

type DashboardOverviewProps = {
  userName: string;
  merchants: MerchantRecord[];
  transactions: DisplayTransaction[];
  summary: MonthlySummary;
  monthlyTrend: MonthlyTrend;
  categorySpending: CategorySpending[];
  paymentMethods: PaymentMethodBreakdown[];
  savingsOverview: SavingsOverview;
  pendingPayments: PendingPaymentsOverview;
};

export function DashboardOverview({
  userName,
  merchants,
  transactions,
  summary,
  monthlyTrend,
  categorySpending,
  paymentMethods,
  savingsOverview,
  pendingPayments,
}: DashboardOverviewProps) {
  const firstName = userName.split(" ")[0] ?? userName;
  const lastName = userName.split(" ")[1] ?? "";
  const secondLastName = userName.split(" ")[2] ?? "";
  const fullName = `${firstName} ${lastName} ${secondLastName}`;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold brand-text">Resumen personal</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Hola, {fullName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Periodo {summary.periodLabel}. Los gastos normales se registran al crearlos; las cuotas de crédito solo se suman cuando confirmas el pago.
        </p>
        <div className="mt-5">
          <DashboardQuickActions />
        </div>
      </div>

      <DashboardKpiCards summary={summary} pendingPayments={pendingPayments} />
      <PendingPaymentsCard items={pendingPayments.items} />
      <DashboardWallets paymentMethods={paymentMethods} />

      <div className="grid gap-6 xl:grid-cols-2">
        <IncomeExpenseChart
          monthlyTrend={monthlyTrend}
          periodLabel={summary.periodLabel}
        />
        <BudgetBreakdown categories={categorySpending} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <RecentTransactionsTable
          transactions={transactions}
          merchants={merchants}
          title="Gastos recientes"
          description="Tus últimos gastos normales y los pagados con ahorros"
          emptyTitle="Aún no tienes gastos registrados."
          emptyDescription="Registra un gasto para verlo aquí."
        />
        <SavingsGoalCard
          savingsOverview={savingsOverview}
          periodLabel={summary.periodLabel}
        />
      </div>
    </div>
  );
}

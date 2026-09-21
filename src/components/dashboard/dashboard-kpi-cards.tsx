"use client";

import { motion } from "motion/react";
import { formatCurrency } from "@/lib/format/currency";
import type { PendingPaymentsOverview } from "@/lib/transactions/pending-payments";
import type { MonthlySummary } from "@/lib/transactions/types";

type DashboardKpiCardsProps = {
  summary: MonthlySummary;
  pendingPayments: PendingPaymentsOverview;
};

export function DashboardKpiCards({
  summary,
  pendingPayments,
}: DashboardKpiCardsProps) {
  const expenseBreakdown =
    summary.creditDueThisMonth > 0 || summary.expensesFromSavings > 0
      ? `${formatCurrency(summary.cashExpenses)} directos${summary.creditDueThisMonth > 0 ? ` · ${formatCurrency(summary.creditDueThisMonth)} cuotas` : ""}${summary.expensesFromSavings > 0 ? ` · ${formatCurrency(summary.expensesFromSavings)} con ahorros` : ""}`
      : summary.monthlyExpenses > 0
        ? `${summary.expenseCount} egreso${summary.expenseCount === 1 ? "" : "s"} en el periodo`
        : "Sin egresos en este periodo";

  const cards = [
    {
      key: "balance",
      label: "Balance del mes",
      value: summary.balance,
      valueClass:
        summary.balance >= 0 ? "brand-text" : "text-destructive",
      trend:
        summary.balance >= 0
          ? "Ingresos cubren tus obligaciones del periodo"
          : "Tus gastos superan los ingresos del periodo",
      trendClass: summary.balance >= 0 ? "text-success" : "text-destructive",
      progress: null,
    },
    {
      key: "income",
      label: "Ingresos del mes",
      value: summary.monthlyIncome,
      valueClass: "text-success",
      trend:
        summary.incomeCount > 0
          ? `${summary.incomeCount} ingreso${summary.incomeCount === 1 ? "" : "s"} recibidos`
          : "Sin ingresos en este periodo",
      trendClass: "text-success",
      progress: null,
    },
    {
      key: "expenses",
      label: "Gastos del mes",
      value: summary.monthlyExpenses,
      valueClass: "text-destructive",
      trend: expenseBreakdown,
      trendClass: "text-muted-foreground",
      progress: null,
    },
    {
      key: "savings",
      label: "Capacidad de ahorro",
      value: summary.savingsCapacity,
      valueClass: summary.savingsCapacity >= 0 ? "text-success" : "text-destructive",
      trend:
        summary.monthlyIncome > 0
          ? `${summary.savingsRate}% de tus ingresos del periodo`
          : "Registra ingresos para medir tu ahorro",
      trendClass:
        summary.savingsCapacity >= 0 ? "text-success" : "text-destructive",
      progress:
        summary.monthlyIncome > 0
          ? Math.max(0, Math.min(summary.savingsRate, 100))
          : null,
    },
    {
      key: "pending",
      label: "Pendiente por pago",
      value: pendingPayments.totalPendingAmount,
      valueClass:
        pendingPayments.totalPendingAmount > 0
          ? "text-amber-700"
          : "text-success",
      trend:
        pendingPayments.pendingInstallmentCount > 0
          ? `${pendingPayments.pendingInstallmentCount} cuota${pendingPayments.pendingInstallmentCount === 1 ? "" : "s"} por pagar ahora${pendingPayments.overdueCount > 0 ? ` · ${pendingPayments.overdueCount} vencida${pendingPayments.overdueCount === 1 ? "" : "s"}` : pendingPayments.dueSoonCount > 0 ? ` · ${pendingPayments.dueSoonCount} por vencer` : ""}`
          : "Sin cuotas de crédito pendientes",
      trendClass:
        pendingPayments.overdueCount > 0
          ? "text-destructive"
          : pendingPayments.pendingInstallmentCount > 0
            ? "text-amber-700"
            : "text-success",
      progress: null,
    },
  ] as const;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Periodo: {summary.periodLabel}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="rounded-2xl border border-accent/10 bg-card/90 p-5 shadow-sm backdrop-blur-sm brand-card-accent"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${card.valueClass}`}>
              {formatCurrency(card.value)}
            </p>
            <p className={`mt-2 text-xs font-medium ${card.trendClass}`}>
              {card.trend}
            </p>
            {card.progress !== null ? (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="brand-progress h-full rounded-full"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

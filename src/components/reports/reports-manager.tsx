"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { BudgetBreakdown } from "@/components/dashboard/budget-breakdown";
import { DashboardWallets } from "@/components/dashboard/dashboard-wallets";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { ManagerPageHeader } from "@/components/manejadores/manager-page-header";
import {
  ReportAlertInfoIcon,
  ReportAlertSuccessIcon,
  ReportAlertWarningIcon,
  ReportBalanceIcon,
  ReportCalendarIcon,
  ReportCompareIcon,
  ReportCreditIcon,
  ReportCsvIcon,
  ReportExcelIcon,
  ReportExpenseIcon,
  ReportFixedIcon,
  ReportIncomeIcon,
  ReportMerchantIcon,
  ReportPdfIcon,
  ReportProjectionIcon,
  ReportRecurringIcon,
  ReportSavingsIcon,
} from "@/components/reports/report-icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { registerCharts } from "@/lib/chart";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/format/currency";
import type { ReportPeriod, ReportsData } from "@/lib/reports/types";

registerCharts();

type ReportsManagerProps = {
  data: ReportsData;
};

const periodOptions: Array<{ value: ReportPeriod; label: string }> = [
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
];

function formatChange(value: number | null) {
  if (value == null) return "Sin base de comparación";
  if (value === 0) return "Sin cambio";
  return `${value > 0 ? "+" : ""}${value}% vs periodo anterior`;
}

function formatDateLabel(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ReportSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#5b21b6] to-[#7c3aed] text-white shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ReportsManager({ data }: ReportsManagerProps) {
  const [exportingFormat, startExport] = useTransition();

  const handleExport = (format: "csv" | "xlsx" | "pdf") => {
    startExport(() => {
      window.location.href = `/api/reports/export?period=${data.periodType}&format=${format}`;
    });
  };

  const summaryCards = [
    {
      label: "Ingresos",
      value: data.summary.income,
      tone: "text-success",
      icon: ReportIncomeIcon,
      iconWrap: "from-emerald-500 to-emerald-600",
      hint: formatChange(data.comparison.incomeChangePercent),
    },
    {
      label: "Gastos",
      value: data.summary.expenses,
      tone: "text-destructive",
      icon: ReportExpenseIcon,
      iconWrap: "from-red-500 to-red-600",
      hint: formatChange(data.comparison.expenseChangePercent),
    },
    {
      label: "Balance",
      value: data.summary.balance,
      tone: data.summary.balance >= 0 ? "brand-text" : "text-destructive",
      icon: ReportBalanceIcon,
      iconWrap: "from-[#5b21b6] to-[#7c3aed]",
      hint: `${data.summary.creditInstallmentsPaid > 0 ? `${formatCurrency(data.summary.creditInstallmentsPaid)} en cuotas pagadas` : "Flujo neto del periodo"}`,
    },
    {
      label: "Créditos pendientes",
      value: data.summary.pendingCreditAmount,
      tone: data.summary.pendingCreditAmount > 0 ? "text-amber-700" : "text-success",
      icon: ReportCreditIcon,
      iconWrap: "from-amber-500 to-orange-600",
      hint:
        data.credits.length > 0
          ? `${data.credits.length} crédito(s) con cuotas activas`
          : "Sin cuotas pendientes",
    },
  ];

  const projectionData = {
    labels: data.projection.map((item) => item.label),
    datasets: [
      {
        label: "Cuotas proyectadas",
        data: data.projection.map((item) => item.amount),
        backgroundColor: "#7c3aed",
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  const fixedVariableData = {
    labels: ["Fijos", "Variables"],
    datasets: [
      {
        data: [data.fixedVariable.fixed, data.fixedVariable.variable],
        backgroundColor: ["#059669", "#7c3aed"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ManagerPageHeader
          eyebrow="Análisis financiero"
          title="Reportes"
          description={`Resumen de ${data.periodLabel.toLowerCase()} (${data.periodRangeLabel}). Compara periodos, revisa tendencias y exporta tus movimientos.`}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            <ReportCalendarIcon className="size-4 text-accent" />
            Periodo
          </div>
          <div className="inline-flex rounded-xl border border-border bg-secondary/40 p-1">
            {periodOptions.map((option) => (
              <Link
                key={option.value}
                href={`/dashboard/reportes?period=${option.value}`}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  data.periodType === option.value
                    ? "brand-gradient text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>

          <Button
            variant="outline"
            size="md"
            icon={<ReportCsvIcon className="size-4" />}
            onClick={() => handleExport("csv")}
            isLoading={exportingFormat}
            loadingLabel="Exportando CSV..."
          >
            CSV
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<ReportExcelIcon className="size-4" />}
            onClick={() => handleExport("xlsx")}
            isLoading={exportingFormat}
            loadingLabel="Exportando Excel..."
          >
            Excel
          </Button>
          <Button
            variant="accent"
            size="md"
            icon={<ReportPdfIcon className="size-4" />}
            onClick={() => handleExport("pdf")}
            isLoading={exportingFormat}
            loadingLabel="Generando PDF..."
          >
            PDF
          </Button>
        </div>
      </div>

      {data.alerts.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {data.alerts.map((alert) => {
            const AlertIcon =
              alert.tone === "warning"
                ? ReportAlertWarningIcon
                : alert.tone === "success"
                  ? ReportAlertSuccessIcon
                  : ReportAlertInfoIcon;

            return (
            <div
              key={alert.id}
              className={`flex gap-3 rounded-2xl border px-4 py-3 ${
                alert.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : alert.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-accent/15 bg-secondary/40 text-foreground"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <AlertIcon className="size-5" />
              </div>
              <div>
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="mt-1 text-sm opacity-90">{alert.description}</p>
              </div>
            </div>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
          <div
            key={card.label}
            className="rounded-2xl border border-accent/10 bg-card/90 p-5 shadow-sm backdrop-blur-sm brand-card-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-sm ${card.iconWrap}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
            <p className={`mt-3 text-2xl font-bold tracking-tight ${card.tone}`}>
              {formatCurrency(card.value)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{card.hint}</p>
          </div>
          );
        })}
      </div>

      <ReportSection
        title="Comparativa de periodos"
        description="Compara el periodo actual con el anterior y con el mismo periodo del año pasado."
        icon={<ReportCompareIcon className="size-5" />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              label: "Periodo actual",
              slice: {
                label: data.periodLabel,
                income: data.summary.income,
                expenses: data.summary.expenses,
                balance: data.summary.balance,
              },
              highlight: true,
            },
            {
              label: "Periodo anterior",
              slice: data.comparison.previous,
              highlight: false,
            },
            ...(data.comparison.yearAgo
              ? [
                  {
                    label: "Mismo periodo, año anterior",
                    slice: data.comparison.yearAgo,
                    highlight: false,
                  },
                ]
              : []),
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-4 ${
                item.highlight
                  ? "border-accent/20 bg-secondary/30"
                  : "border-border bg-background"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold">{item.slice.label}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ingresos</span>
                  <span className="font-medium text-success">
                    {formatCurrency(item.slice.income)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gastos</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(item.slice.expenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Balance</span>
                  <span
                    className={`font-semibold ${
                      item.slice.balance >= 0 ? "brand-text" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(item.slice.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <IncomeExpenseChart
          monthlyTrend={data.monthlyTrend}
          periodLabel={data.periodLabel}
        />
        <BudgetBreakdown categories={data.categories} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection
          title="Gastos fijos vs variables"
          description="Los gastos fijos provienen de obligaciones recurrentes registradas en el periodo."
          icon={<ReportFixedIcon className="size-5" />}
        >
          {data.fixedVariable.fixed + data.fixedVariable.variable <= 0 ? (
            <EmptyState
              title="Sin gastos en el periodo"
              description="Cuando registres gastos verás aquí la proporción entre fijos y variables."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
              <div className="mx-auto h-44 w-44">
                <Doughnut
                  data={fixedVariableData}
                  options={{
                    cutout: "68%",
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-emerald-700">Fijos</span>
                    <span>
                      {formatCurrency(data.fixedVariable.fixed)} ·{" "}
                      {data.fixedVariable.fixedShare}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${data.fixedVariable.fixedShare}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-accent">Variables</span>
                    <span>
                      {formatCurrency(data.fixedVariable.variable)} ·{" "}
                      {100 - data.fixedVariable.fixedShare}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="brand-progress h-full rounded-full"
                      style={{
                        width: `${100 - data.fixedVariable.fixedShare}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </ReportSection>

        <ReportSection
          title="Proyección de cuotas (6 meses)"
          description="Estimación de cuotas de crédito confirmadas con fecha de pago pendiente."
          icon={<ReportProjectionIcon className="size-5" />}
        >
          {data.projection.every((item) => item.amount === 0) ? (
            <EmptyState
              title="Sin cuotas proyectadas"
              description="No hay cuotas de crédito confirmadas en los próximos 6 meses."
            />
          ) : (
            <div className="h-72">
              <Bar
                data={projectionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `${context.parsed.y?.toLocaleString("es-CO") ?? 0} · ${
                            data.projection[context.dataIndex]?.installmentCount ?? 0
                          } cuota(s)`,
                      },
                    },
                  },
                  scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: {
                      grid: { color: "#f1f5f9" },
                      border: { display: false },
                      ticks: {
                        callback: (value) => formatCompactCurrency(Number(value)),
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </ReportSection>
      </div>

      <ReportSection
        title="Top comercios"
        description="Los conceptos donde más gastaste en este periodo."
        icon={<ReportMerchantIcon className="size-5" />}
      >
        {data.merchants.length === 0 ? (
          <EmptyState
            title="Sin gastos por comercio"
            description="Registra gastos para ver tus principales destinos de dinero."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-3 font-medium">Concepto</th>
                  <th className="px-2 py-3 font-medium">Monto</th>
                  <th className="px-2 py-3 font-medium">Participación</th>
                  <th className="px-2 py-3 font-medium">Movimientos</th>
                </tr>
              </thead>
              <tbody>
                {data.merchants.map((merchant) => (
                  <tr key={merchant.name} className="border-b border-border/70">
                    <td className="px-2 py-3 font-medium">{merchant.name}</td>
                    <td className="px-2 py-3">{formatCurrency(merchant.amount)}</td>
                    <td className="px-2 py-3">{merchant.share}%</td>
                    <td className="px-2 py-3">{merchant.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      <ReportSection
        title="Créditos e instalmentos"
        description="Estado de tus compras a cuotas con saldo pendiente."
        icon={<ReportCreditIcon className="size-5" />}
      >
        {data.credits.length === 0 ? (
          <EmptyState
            title="Sin créditos activos"
            description="Cuando tengas compras a cuotas con saldo pendiente aparecerán aquí."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-3 font-medium">Crédito</th>
                  <th className="px-2 py-3 font-medium">Cuotas</th>
                  <th className="px-2 py-3 font-medium">Pendiente</th>
                  <th className="px-2 py-3 font-medium">Próximo pago</th>
                </tr>
              </thead>
              <tbody>
                {data.credits.map((credit) => (
                  <tr
                    key={credit.transactionId}
                    className="border-b border-border/70"
                  >
                    <td className="px-2 py-3 font-medium">{credit.title}</td>
                    <td className="px-2 py-3">
                      {credit.paidInstallments}/{credit.totalInstallments} pagadas
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(credit.totalPendingAmount)}
                    </td>
                    <td className="px-2 py-3">
                      {credit.nextPaymentDate
                        ? `${formatDateLabel(credit.nextPaymentDate)} · ${formatCurrency(credit.nextPaymentAmount ?? 0)}`
                        : "Completado"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      <DashboardWallets paymentMethods={data.paymentMethods} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection
          title="Ahorros"
          description="Balance acumulado y movimientos de tus metas en el periodo."
          icon={<ReportSavingsIcon className="size-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Balance total</p>
              <p className="mt-2 text-xl font-bold brand-text">
                {formatCurrency(data.savings.totalBalance)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Depósitos</p>
              <p className="mt-2 text-xl font-bold text-success">
                {formatCurrency(data.savings.periodDeposits)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Retiros</p>
              <p className="mt-2 text-xl font-bold text-destructive">
                {formatCurrency(data.savings.periodWithdrawals)}
              </p>
            </div>
          </div>

          {data.savings.goals.length === 0 ? (
            <EmptyState
              className="mt-4"
              title="Sin metas activas"
              description="Crea metas de ahorro para seguir tu progreso desde aquí."
            />
          ) : (
            <div className="mt-5 space-y-4">
              {data.savings.goals.map((goal) => (
                <div key={goal.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.currentBalance)}
                      {goal.targetAmount != null
                        ? ` / ${formatCurrency(goal.targetAmount)}`
                        : ""}
                    </span>
                  </div>
                  {goal.progressPercent != null ? (
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="brand-progress h-full rounded-full"
                        style={{
                          width: `${Math.min(goal.progressPercent, 100)}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection
          title="Ingresos recurrentes"
          description="Compara lo configurado con lo efectivamente recibido en el periodo."
          icon={<ReportRecurringIcon className="size-5" />}
        >
          {data.recurringIncomes.length === 0 ? (
            <EmptyState
              title="Sin ingresos recurrentes"
              description="Configura ingresos fijos para monitorearlos en tus reportes."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-2 py-3 font-medium">Concepto</th>
                    <th className="px-2 py-3 font-medium">Configurado</th>
                    <th className="px-2 py-3 font-medium">Recibido</th>
                    <th className="px-2 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recurringIncomes.map((income) => (
                    <tr key={income.id} className="border-b border-border/70">
                      <td className="px-2 py-3 font-medium">{income.title}</td>
                      <td className="px-2 py-3">
                        {formatCurrency(income.amount)} · {income.frequency}
                      </td>
                      <td className="px-2 py-3">
                        {formatCurrency(income.receivedInPeriod)}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={
                            income.isActive ? "text-success" : "text-muted-foreground"
                          }
                        >
                          {income.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportSection>
      </div>
    </div>
  );
}

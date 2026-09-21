"use client";

import { Bar } from "react-chartjs-2";
import { registerCharts } from "@/lib/chart";
import type { MonthlyTrend } from "@/lib/dashboard/types";
import { formatCompactCurrency } from "@/lib/format/currency";

registerCharts();

type IncomeExpenseChartProps = {
  monthlyTrend: MonthlyTrend;
  periodLabel?: string;
};

export function IncomeExpenseChart({
  monthlyTrend,
  periodLabel,
}: IncomeExpenseChartProps) {
  const totalIncome = monthlyTrend.income.reduce((sum, value) => sum + value, 0);
  const totalExpenses = monthlyTrend.expenses.reduce(
    (sum, value) => sum + value,
    0,
  );

  const data = {
    labels: monthlyTrend.labels,
    datasets: [
      {
        label: "Ingresos",
        data: monthlyTrend.income,
        backgroundColor: "#16a34a",
        borderRadius: 8,
        maxBarThickness: 28,
      },
      {
        label: "Gastos",
        data: monthlyTrend.expenses,
        backgroundColor: "#7c3aed",
        borderRadius: 8,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const label = context.dataset.label ?? "";
            const value = context.parsed.y ?? 0;
            return `${label}: ${formatCompactCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
      },
      y: {
        grid: { color: "#f1f5f9" },
        border: { display: false },
        ticks: {
          callback: (value: string | number) =>
            formatCompactCurrency(Number(value)),
        },
      },
    },
  };

  return (
    <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Ingresos vs. gastos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparativa de los últimos 6 periodos mensuales
          </p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-success">
            {formatCompactCurrency(totalIncome)}
          </span>
          {" · "}
          <span className="font-medium text-destructive">
            {formatCompactCurrency(totalExpenses)}
          </span>
        </div>
      </div>
      {periodLabel ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Periodo actual: {periodLabel}
        </p>
      ) : null}
      <div className="mt-6 h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

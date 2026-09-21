"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { SavingsOverview } from "@/lib/dashboard/types";
import { formatCurrency } from "@/lib/format/currency";
import { formatDateTimeString } from "@/lib/temporal";

type SavingsGoalCardProps = {
  savingsOverview: SavingsOverview;
  periodLabel?: string;
};

export function SavingsGoalCard({
  savingsOverview,
  periodLabel,
}: SavingsGoalCardProps) {
  const progressValue = Math.min(Math.abs(savingsOverview.progress), 100);
  const hasGoal = savingsOverview.target > 0;

  return (
    <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
      <h3 className="text-lg font-semibold">{savingsOverview.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasGoal
          ? "Progreso hacia tu meta de ahorro"
          : "Define una meta en Metas para medir tu avance"}
        {periodLabel ? ` · ${periodLabel.toLowerCase()}` : ""}
      </p>

      <div className="mt-6 flex items-center gap-6">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#ede9fe"
              strokeWidth="10"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${progressValue * 2.64} 264`}
              initial={{ strokeDasharray: "0 264" }}
              animate={{
                strokeDasharray: `${progressValue * 2.64} 264`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <span className="brand-text absolute text-xl font-bold">
            {hasGoal ? `${savingsOverview.progress}%` : "—"}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Lo que tienes</p>
          <p className="brand-text text-2xl font-bold">
            {formatCurrency(savingsOverview.current)}
          </p>
          {hasGoal ? (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                Meta: {formatCurrency(savingsOverview.target)}
              </p>
              <p className="text-sm text-muted-foreground">
                Falta: {formatCurrency(savingsOverview.remaining)}
              </p>
            </>
          ) : null}
          <p className="mt-1 text-sm text-muted-foreground">
            Gastos con ahorros: {formatCurrency(savingsOverview.expenses)}
          </p>
          {savingsOverview.periodContributions > 0 ? (
            <p className="text-sm text-muted-foreground">
              Aportes del periodo:{" "}
              {formatCurrency(savingsOverview.periodContributions)}
            </p>
          ) : null}
        </div>
      </div>

      {savingsOverview.periodExpenses.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-medium">Gastos del periodo</p>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {savingsOverview.periodExpenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-white/70 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{expense.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.category}
                    {expense.savingsGoalName ? ` · ${expense.savingsGoalName}` : ""}
                    {" · "}
                    {formatDateTimeString(expense.occurredAt)}
                  </p>
                  {expense.gmfAmount > 0 ? (
                    <p className="text-xs text-accent">
                      Incluye 4x1000 {formatCurrency(expense.gmfAmount)}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">
                  {formatCurrency(expense.amount)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-secondary bg-secondary/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">Total en tus fondos</p>
        <p className="brand-text mt-1 text-xl font-bold">
          {formatCurrency(savingsOverview.totalSavings)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {savingsOverview.activeGoals} fondo
          {savingsOverview.activeGoals === 1 ? "" : "s"} activo
          {savingsOverview.activeGoals === 1 ? "" : "s"}
          {hasGoal
            ? ` · ${savingsOverview.progress}% de tu meta`
            : savingsOverview.expenses > 0
              ? ` · ${formatCurrency(savingsOverview.expenses)} usados este periodo`
              : ""}
        </p>
      </div>

      <Link
        href="/dashboard/metas"
        className="brand-gradient mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-primary-foreground"
      >
        Administrar ahorros
      </Link>
    </div>
  );
}

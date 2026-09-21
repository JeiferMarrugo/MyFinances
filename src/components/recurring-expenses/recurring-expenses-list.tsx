"use client";

import { DeleteButton, ToggleActiveButton } from "@/components/ui/action-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format/currency";
import { recurringFrequencyLabels } from "@/lib/recurring-incomes/constants";
import { formatNextRunLabel } from "@/lib/recurring-incomes/schedule";
import type { RecurringExpenseWithSpending } from "@/lib/recurring-expenses/types";

type RecurringExpensesListProps = {
  items: RecurringExpenseWithSpending[];
  updatingId?: string | null;
  onToggleActive: (item: RecurringExpenseWithSpending) => void;
  onDelete: (item: RecurringExpenseWithSpending) => void;
};

export function RecurringExpensesList({
  items,
  updatingId = null,
  onToggleActive,
  onDelete,
}: RecurringExpensesListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes gastos fijos configurados."
        description="Define gasolina, servicios o arriendo con un presupuesto mensual al registrar un gasto."
        className="px-4 py-8"
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOverBudget = item.spentThisMonth > item.budgetAmount;

        return (
          <article
            key={item.id}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.isActive
                        ? "bg-secondary text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.isActive ? "Activo" : "Pausado"}
                  </span>
                  {item.autoRegister ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      Automático
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {recurringFrequencyLabels[item.frequency]} · {item.category}
                </p>
                <p className="mt-2 text-lg font-bold">
                  Presupuesto: {formatCurrency(item.budgetAmount)}
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    isOverBudget ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  Gastado este mes: {formatCurrency(item.spentThisMonth)} ·{" "}
                  {item.progressPercent}%
                </p>
                {item.autoRegister ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Próximo registro:{" "}
                    {formatNextRunLabel(new Date(item.nextRunAt))}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Registra tus gastos con el mismo nombre para contarlos aquí.
                  </p>
                )}

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${
                      isOverBudget ? "bg-destructive" : "bg-accent"
                    }`}
                    style={{
                      width: `${Math.min(item.progressPercent, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <ToggleActiveButton
                  isActive={item.isActive}
                  onClick={() => onToggleActive(item)}
                  disabled={updatingId === item.id}
                />
                <DeleteButton
                  onClick={() => onDelete(item)}
                  disabled={updatingId === item.id}
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

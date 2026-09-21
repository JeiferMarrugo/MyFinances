"use client";

import { DeleteButton, ToggleActiveButton } from "@/components/ui/action-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format/currency";
import { recurringFrequencyLabels } from "@/lib/recurring-incomes/constants";
import { formatNextRunLabel } from "@/lib/recurring-incomes/schedule";
import type { RecurringIncomeRecord } from "@/lib/recurring-incomes/types";

type RecurringIncomesListProps = {
  items: RecurringIncomeRecord[];
  updatingId?: string | null;
  onToggleActive: (item: RecurringIncomeRecord) => void;
  onDelete: (item: RecurringIncomeRecord) => void;
};

export function RecurringIncomesList({
  items,
  updatingId = null,
  onToggleActive,
  onDelete,
}: RecurringIncomesListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes ingresos automáticos configurados."
        description="Al registrar un ingreso, activa la opción recurrente para salario, pensión o seguros."
        className="px-4 py-8"
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-border bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
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
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {recurringFrequencyLabels[item.frequency]} · {item.category}
              </p>
              <p className="mt-2 text-lg font-bold">
                {formatCurrency(item.amount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Próximo registro: {formatNextRunLabel(new Date(item.nextRunAt))}
              </p>
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
      ))}
    </div>
  );
}

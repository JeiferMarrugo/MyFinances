"use client";

import { EmptyState } from "@/components/ui/empty-state";
import type { CategorySpending } from "@/lib/dashboard/types";
import { formatCurrency } from "@/lib/format/currency";

type BudgetBreakdownProps = {
  categories: CategorySpending[];
};

export function BudgetBreakdown({ categories }: BudgetBreakdownProps) {
  const hasBudgetLimits = categories.some((item) => item.limit != null);
  const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
  const totalLimit = categories.reduce(
    (sum, item) => sum + (item.limit ?? 0),
    0,
  );
  const consumed =
    hasBudgetLimits && totalLimit > 0
      ? Math.round((totalSpent / totalLimit) * 100)
      : null;

  return (
    <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
      <h3 className="text-lg font-semibold">
        {hasBudgetLimits ? "Presupuesto mensual" : "Gastos por categoría"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasBudgetLimits
          ? consumed !== null
            ? `Has consumido el ${consumed}% de tu presupuesto fijo del periodo`
            : "Configura gastos fijos en movimientos para ver tu presupuesto"
          : totalSpent > 0
            ? `${formatCurrency(totalSpent)} en obligaciones del periodo (incluye cuotas de crédito)`
            : "Aún no hay gastos en el periodo actual"}
      </p>

      {categories.length === 0 ? (
        <EmptyState
          className="mt-6"
          title={
            hasBudgetLimits
              ? "Sin presupuestos configurados"
              : "Sin gastos por categoría"
          }
          description={
            hasBudgetLimits
              ? "Al registrar un gasto, activa la opción de gasto fijo mensual."
              : "Cuando registres gastos, verás aquí cómo se distribuyen."
          }
        />
      ) : (
        <div className="mt-6 space-y-4">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {category.limit != null
                    ? `${formatCurrency(category.spent)} / ${formatCurrency(category.limit)}`
                    : `${formatCurrency(category.spent)} · ${category.share}%`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${
                    category.limit != null && category.spent > category.limit
                      ? "bg-destructive"
                      : ""
                  }`}
                  style={{
                    width: `${Math.min(category.share, 100)}%`,
                    backgroundColor:
                      category.limit != null && category.spent > category.limit
                        ? undefined
                        : category.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

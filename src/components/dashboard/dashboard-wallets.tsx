"use client";

import { motion } from "motion/react";
import { EmptyState } from "@/components/ui/empty-state";
import type { PaymentMethodBreakdown } from "@/lib/dashboard/types";
import { formatCurrency } from "@/lib/format/currency";

type DashboardWalletsProps = {
  paymentMethods: PaymentMethodBreakdown[];
};

export function DashboardWallets({ paymentMethods }: DashboardWalletsProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Métodos de pago</h2>
          <p className="text-sm text-muted-foreground">
            {paymentMethods.length > 0
              ? "Ingresos y gastos del periodo por método"
              : "Sin movimientos en el periodo actual"}
          </p>
        </div>
      </div>

      {paymentMethods.length === 0 ? (
        <EmptyState
          title="Aún no hay movimientos"
          description="Registra ingresos o gastos para ver el resumen por método de pago."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl bg-linear-to-br ${method.gradient} p-5 text-white shadow-md ${
                method.id === "efectivo"
                  ? "border border-border text-foreground shadow-sm"
                  : ""
              }`}
            >
              <p className="text-sm opacity-80">{method.name}</p>
              <div className="mt-3 space-y-1">
                {method.income > 0 ? (
                  <p
                    className={`text-sm font-medium ${
                      method.id === "efectivo" ? "text-success" : "text-emerald-100"
                    }`}
                  >
                    + {formatCurrency(method.income)}
                  </p>
                ) : null}
                {method.expenses > 0 ? (
                  <p
                    className={`text-sm font-medium ${
                      method.id === "efectivo" ? "text-destructive" : "text-rose-100"
                    }`}
                  >
                    - {formatCurrency(method.expenses)}
                  </p>
                ) : null}
              </div>
              <p
                className={`mt-4 text-2xl font-bold ${
                  method.amount >= 0 ? "" : "opacity-90"
                }`}
              >
                {formatCurrency(method.amount)}
              </p>
              <p className="mt-2 text-xs opacity-70">
                {method.amount >= 0 ? "Balance neto positivo" : "Balance neto negativo"}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatAppDate } from "@/lib/format/dates";
import { formatCurrency } from "@/lib/format/currency";
import type { SerializedPaymentPlan } from "@/lib/transactions/payment-plan-shared";
import type { DisplayTransaction } from "@/lib/transactions/types";
import { appToast } from "@/lib/toast";

type PaymentPlanDialogProps = {
  transaction: DisplayTransaction | null;
  onClose: () => void;
  onConfirmed?: (transaction: DisplayTransaction) => void;
};

type PaymentPlanResponse = {
  plan: SerializedPaymentPlan | null;
  transaction: {
    id: string;
    title: string;
    type: string;
    occurredAt: string;
    installmentsCount: number | null;
    installmentAmount: number | null;
  };
};

export function PaymentPlanDialog({
  transaction,
  onClose,
  onConfirmed,
}: PaymentPlanDialogProps) {
  const [plan, setPlan] = useState<SerializedPaymentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!transaction) return;

    setLoading(true);
    setPlan(null);

    fetch(`/api/transactions/${transaction.id}/payment-plan`)
      .then(async (response) => {
        const data = (await response.json()) as PaymentPlanResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "No pudimos cargar el plan de pago");
        }

        setPlan(data.plan);
      })
      .catch((error) => {
        appToast.error("Plan de pago", {
          description:
            error instanceof Error ? error.message : "No pudimos cargar el plan",
        });
        onClose();
      })
      .finally(() => setLoading(false));
  }, [transaction, onClose]);

  if (!transaction) return null;

  const isCredit =
    transaction.installmentsCount != null &&
    transaction.installmentAmount != null &&
    transaction.installmentsCount > 0;

  async function handleConfirm() {
    if (!transaction) return;

    setConfirming(true);

    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}/payment-plan`,
        { method: "POST" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No pudimos confirmar el plan");
      }

      setPlan(data.plan);
      appToast.success("Plan confirmado", {
        description: "Las fechas de pago quedaron guardadas para este crédito.",
      });
      onConfirmed?.(data.transaction);
    } catch (error) {
      appToast.error("Plan de pago", {
        description:
          error instanceof Error ? error.message : "No pudimos confirmar el plan",
      });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Cerrar plan de pago"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold brand-text">Fecha de pago</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {transaction.merchant}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isCredit
                ? "Revisa el plan mes a mes y confírmalo para usar estas fechas."
                : "Fecha en la que registraste este gasto."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Cerrar
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando plan de pago...</p>
        ) : isCredit && plan ? (
          <div className="space-y-4">
            {plan.confirmedAt ? (
              <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                Plan confirmado el {formatAppDate(plan.confirmedAt)}
              </div>
            ) : (
              <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground">
                Este es un borrador calculado automáticamente. Confírmalo si las
                fechas coinciden con tu crédito.
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Cuota
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Fecha de pago
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Monto
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {item.installmentNumber}/{plan.items.length}
                      </td>
                      <td className="px-4 py-3">{formatAppDate(item.paymentDate)}</td>
                      <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.status === "paid"
                              ? "font-medium text-success"
                              : "text-muted-foreground"
                          }
                        >
                          {item.status === "paid" ? "Pagada" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!plan.confirmedAt ? (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Revisar después
                </Button>
                <Button
                  variant="accent"
                  onClick={handleConfirm}
                  isLoading={confirming}
                  loadingLabel="Confirmando..."
                >
                  Confirmar plan de pago
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Fecha de pago</p>
            <p className="mt-1 text-lg font-semibold">
              {formatAppDate(transaction.date)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { formatAppDate } from "@/lib/format/dates";
import { formatCurrency } from "@/lib/format/currency";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import type { PendingPaymentItem } from "@/lib/transactions/pending-payments";

type PendingPaymentsCardProps = {
  items: PendingPaymentItem[];
};

function getStatusLabel(item: PendingPaymentItem) {
  if (item.status === "overdue") {
    const days = Math.abs(item.daysUntilPayment);
    return days === 1
      ? "Pago atrasado ayer"
      : `Pago atrasado hace ${days} días`;
  }

  if (item.status === "due_today") {
    return "Te toca pagar hoy";
  }

  if (item.daysUntilPayment === 1) {
    return "Te toca pagar mañana";
  }

  if (item.daysUntilPayment <= 3) {
    return `Te toca pagar en ${item.daysUntilPayment} días`;
  }

  return `Pago el ${formatAppDate(item.paymentDate)}`;
}

function getItemStyles(item: PendingPaymentItem) {
  if (item.status === "overdue") {
    return {
      container: "border-destructive/20 bg-destructive/5",
      badge: "bg-destructive/10 text-destructive",
      amount: "text-destructive",
    };
  }

  if (item.status === "due_today") {
    return {
      container: "border-amber-500/20 bg-amber-500/5",
      badge: "bg-amber-500/10 text-amber-700",
      amount: "text-amber-700",
    };
  }

  if (item.daysUntilPayment <= 3) {
    return {
      container: "border-accent/15 bg-accent/5",
      badge: "bg-accent/10 text-accent",
      amount: "text-foreground",
    };
  }

  return {
    container: "border-border bg-card/80",
    badge: "bg-muted text-muted-foreground",
    amount: "text-foreground",
  };
}

export function PendingPaymentsCard({ items }: PendingPaymentsCardProps) {
  const router = useRouter();
  const [payingId, setPayingId] = useState<string | null>(null);

  async function payInstallment(item: PendingPaymentItem) {
    setPayingId(item.transactionId);
    const toastId = appToast.loading(toastCopy.transactions.loadingPayInstallment);

    const response = await fetch(
      `/api/transactions/${item.transactionId}/pay-installment`,
      { method: "POST" },
    );

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.transactions.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.transactions.errorDescription,
      });
      setPayingId(null);
      return;
    }

    appToast.success(toastCopy.transactions.payInstallmentSuccessTitle, {
      id: toastId,
      description: toastCopy.transactions.payInstallmentSuccessDescription(
        item.title,
        data.transaction.installmentsPaid,
        data.transaction.installmentsCount ?? item.totalInstallments,
      ),
    });

    setPayingId(null);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.24 }}
      className="rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm brand-card-accent"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold brand-text">Cuotas pendientes</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Confirmar pago de cuotas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando llegue la fecha de pago, confírmala para descontarla de tus ingresos del mes.
          </p>
        </div>
        <Link
          href="/dashboard/movimientos"
          className="text-sm font-semibold text-accent hover:underline"
        >
          Ver en movimientos
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No tienes cuotas de crédito pendientes.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cuando tengas una cuota por pagar, podrás descontarla aquí.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const styles = getItemStyles(item);

            return (
              <div
                key={`${item.transactionId}-${item.installmentIndex}`}
                className={`rounded-xl border px-4 py-3 ${styles.container}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {item.title}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}
                      >
                        {getStatusLabel(item)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cuota {item.installmentNumber}/{item.totalInstallments} ·{" "}
                      {item.method} · {item.category} · Pago:{" "}
                      {formatAppDate(item.paymentDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${styles.amount}`}>
                        {formatCurrency(item.installmentAmount)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {item.pendingInstallments} pendiente
                        {item.pendingInstallments === 1 ? "" : "s"}
                      </p>
                    </div>

                    {item.canPayInstallment ? (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => payInstallment(item)}
                        isLoading={payingId === item.transactionId}
                        loadingLabel="Confirmando..."
                      >
                        Confirmar pago
                      </Button>
                    ) : (
                      <p className="max-w-[9rem] text-right text-[11px] leading-4 text-muted-foreground">
                        Podrás confirmarla cuando llegue su fecha de pago
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

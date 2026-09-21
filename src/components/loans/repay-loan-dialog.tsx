"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatAmountInput, formatCurrency, parseAmountInput } from "@/lib/format/currency";
import type { LoansOverview, LoanWithDetails } from "@/lib/loans/types";
import { repayLoanSchema } from "@/lib/validations/loan";

type RepayLoanDialogProps = {
  loan: LoanWithDetails | null;
  onClose: () => void;
  onRepaid: (loan: LoanWithDetails, overview: LoansOverview) => void;
};

function toInputDateTime(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function RepayLoanDialog({ loan, onClose, onRepaid }: RepayLoanDialogProps) {
  const [repaidAmountInput, setRepaidAmountInput] = useState("");
  const [repaidAt, setRepaidAt] = useState(toInputDateTime());
  const [repaymentDestination, setRepaymentDestination] = useState<
    "cash" | "savings"
  >("cash");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loan) return;

    setRepaidAmountInput(formatAmountInput(String(loan.expectedTotal)));
    setRepaidAt(toInputDateTime());
    setRepaymentDestination(loan.fundedFrom === "savings" ? "savings" : "cash");
    setError(null);
  }, [loan]);

  if (!loan) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!loan) return;

    setError(null);

    const parsed = repayLoanSchema.safeParse({
      repaidAmount: parseAmountInput(repaidAmountInput),
      repaidAt: new Date(repaidAt).toISOString(),
      repaymentDestination,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/loans/${loan.id}/repay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No pudimos registrar el cobro");
        return;
      }

      onRepaid(data.loan, data.overview);
    } catch {
      setError("No pudimos registrar el cobro");
    } finally {
      setIsSubmitting(false);
    }
  }

  const askDestination = loan.fundedFrom === "savings";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-xl font-semibold">Marcar préstamo como recibido</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {loan.borrowerName} · esperado {formatCurrency(loan.expectedTotal)}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="repaid-amount" className="mb-2 block text-sm font-medium">
              Monto recibido
            </label>
            <input
              id="repaid-amount"
              value={repaidAmountInput}
              onChange={(event) =>
                setRepaidAmountInput(formatAmountInput(event.target.value))
              }
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="repaid-at" className="mb-2 block text-sm font-medium">
              Fecha de cobro
            </label>
            <input
              id="repaid-at"
              type="datetime-local"
              value={repaidAt}
              onChange={(event) => setRepaidAt(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>

          {askDestination ? (
            <div className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-medium">
                Este préstamo salió de tus ahorros. ¿Dónde quedará el dinero?
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="repaymentDestination"
                  checked={repaymentDestination === "cash"}
                  onChange={() => setRepaymentDestination("cash")}
                />
                Sumarlo a mi plata (ingreso)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="repaymentDestination"
                  checked={repaymentDestination === "savings"}
                  onChange={() => setRepaymentDestination("savings")}
                />
                Devolverlo al ahorro {loan.savingsGoalName ?? ""}
              </label>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              El cobro se sumará a tu plata como ingreso del periodo.
            </p>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar cobro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { LoanForm } from "@/components/loans/loan-form";
import { LoanPersonsPanel } from "@/components/loans/loan-persons-panel";
import { RepayLoanDialog } from "@/components/loans/repay-loan-dialog";
import { Button } from "@/components/ui/button";
import { formatAppDate } from "@/lib/format/dates";
import { formatCurrency } from "@/lib/format/currency";
import type { LoanPersonRecord, LoansOverview, LoanWithDetails } from "@/lib/loans/types";
import type { SavingsGoalWithBalance } from "@/lib/savings-goals/types";
import { appToast } from "@/lib/toast";

type LoansManagerProps = {
  initialLoans: LoanWithDetails[];
  initialPersons: LoanPersonRecord[];
  initialOverview: LoansOverview;
  savingsGoals: SavingsGoalWithBalance[];
};

type TabId = "loans" | "persons";

function loanStatusLabel(status: LoanWithDetails["status"]) {
  if (status === "repaid") return "Recibido";
  if (status === "cancelled") return "Cancelado";
  return "En espera";
}

export function LoansManager({
  initialLoans,
  initialPersons,
  initialOverview,
  savingsGoals,
}: LoansManagerProps) {
  const [tab, setTab] = useState<TabId>("loans");
  const [loans, setLoans] = useState(initialLoans);
  const [persons, setPersons] = useState(initialPersons);
  const [overview, setOverview] = useState(initialOverview);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [repayTarget, setRepayTarget] = useState<LoanWithDetails | null>(null);

  const outstandingLoans = useMemo(
    () => loans.filter((loan) => loan.status === "outstanding"),
    [loans],
  );

  const historyLoans = useMemo(
    () => loans.filter((loan) => loan.status !== "outstanding"),
    [loans],
  );

  function upsertLoan(record: LoanWithDetails) {
    setLoans((current) => {
      const exists = current.some((item) => item.id === record.id);
      if (exists) {
        return current.map((item) => (item.id === record.id ? record : item));
      }
      return [record, ...current];
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="brand-card-accent rounded-2xl border border-border/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Por cobrar
          </p>
          <p className="brand-text mt-2 text-2xl font-bold">
            {formatCurrency(overview.outstandingTotal)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {overview.outstandingCount} préstamo
            {overview.outstandingCount === 1 ? "" : "s"} en espera
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Activos
          </p>
          <p className="mt-2 text-2xl font-bold">{overview.outstandingCount}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cobrados
          </p>
          <p className="mt-2 text-2xl font-bold">{overview.repaidCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("loans")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "loans"
              ? "bg-[#7c3aed] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Préstamos
        </button>
        <button
          type="button"
          onClick={() => setTab("persons")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "persons"
              ? "bg-[#7c3aed] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Personas
        </button>
      </div>

      {tab === "persons" ? (
        <LoanPersonsPanel persons={persons} onPersonsChange={setPersons} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              El dinero prestado queda en espera hasta que marques el cobro. No
              cuenta como gasto del periodo.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm((value) => !value)}
            >
              {showCreateForm ? "Ocultar formulario" : "Nuevo préstamo"}
            </Button>
          </div>

          {showCreateForm ? (
            <LoanForm
              persons={persons}
              savingsGoals={savingsGoals}
              onCreated={(loan, nextOverview) => {
                upsertLoan(loan);
                setOverview(nextOverview);
                setShowCreateForm(false);
                appToast.success("Préstamo registrado", {
                  description: `${loan.borrowerName} · ${formatCurrency(loan.principalAmount)} en espera`,
                });
              }}
            />
          ) : null}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">En espera de cobro</h2>
            {outstandingLoans.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No tienes préstamos pendientes por cobrar.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {outstandingLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    onRepay={() => setRepayTarget(loan)}
                  />
                ))}
              </div>
            )}
          </section>

          {historyLoans.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Historial</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {historyLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <RepayLoanDialog
        loan={repayTarget}
        onClose={() => setRepayTarget(null)}
        onRepaid={(loan, nextOverview) => {
          upsertLoan(loan);
          setOverview(nextOverview);
          setRepayTarget(null);
          appToast.success("Cobro registrado", {
            description: `${loan.borrowerName} · ${formatCurrency(loan.repaidAmount ?? 0)}`,
          });
        }}
      />
    </div>
  );
}

function LoanCard({
  loan,
  onRepay,
}: {
  loan: LoanWithDetails;
  onRepay?: () => void;
}) {
  const isOutstanding = loan.status === "outstanding";

  return (
    <article className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{loan.borrowerName}</p>
          <p className="text-sm text-muted-foreground">
            Prestado el {formatAppDate(loan.lentAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isOutstanding
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {loanStatusLabel(loan.status)}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Capital</dt>
          <dd className="font-semibold">{formatCurrency(loan.principalAmount)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total esperado</dt>
          <dd className="font-semibold">{formatCurrency(loan.expectedTotal)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Origen</dt>
          <dd className="font-medium">
            {loan.fundedFrom === "savings"
              ? `Ahorros · ${loan.savingsGoalName ?? "Meta"}`
              : "Mi plata"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Fecha de pago</dt>
          <dd className="font-medium">
            {loan.expectedDueDate
              ? formatAppDate(loan.expectedDueDate)
              : "Sin fecha"}
          </dd>
        </div>
      </dl>

      {loan.interestAmount > 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Interés: {formatCurrency(loan.interestAmount)}
        </p>
      ) : null}

      {loan.notes ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{loan.notes}</p>
      ) : null}

      {loan.status === "repaid" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Recibido el {loan.repaidAt ? formatAppDate(loan.repaidAt) : "—"} ·{" "}
          {formatCurrency(loan.repaidAmount ?? 0)} ·{" "}
          {loan.repaymentDestination === "savings"
            ? "Devuelto al ahorro"
            : "Sumado a tu plata"}
        </p>
      ) : null}

      {isOutstanding && onRepay ? (
        <div className="mt-5">
          <Button variant="primary" onClick={onRepay}>
            Marcar como recibido
          </Button>
        </div>
      ) : null}
    </article>
  );
}

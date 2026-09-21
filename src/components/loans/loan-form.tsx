"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatAmountInput, parseAmountInput } from "@/lib/format/currency";
import type { LoanPersonRecord, LoansOverview, LoanWithDetails } from "@/lib/loans/types";
import type { SavingsGoalWithBalance } from "@/lib/savings-goals/types";
import { createLoanSchema, type CreateLoanInput } from "@/lib/validations/loan";

type LoanFormProps = {
  persons: LoanPersonRecord[];
  savingsGoals: SavingsGoalWithBalance[];
  onCreated: (loan: LoanWithDetails, overview: LoansOverview) => void;
};

function toInputDateTime(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function LoanForm({ persons, savingsGoals, onCreated }: LoanFormProps) {
  const [borrowerId, setBorrowerId] = useState(persons[0]?.id ?? "");
  const [principalInput, setPrincipalInput] = useState("");
  const [hasInterest, setHasInterest] = useState(false);
  const [interestInput, setInterestInput] = useState("");
  const [expectedDueDate, setExpectedDueDate] = useState("");
  const [fundedFrom, setFundedFrom] = useState<"cash" | "savings">("cash");
  const [savingsGoalId, setSavingsGoalId] = useState(
    savingsGoals[0]?.id ?? "",
  );
  const [lentAt, setLentAt] = useState(toInputDateTime());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const savingsOptions = useMemo(
    () => savingsGoals.filter((goal) => goal.currentBalance > 0),
    [savingsGoals],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: CreateLoanInput = {
      borrowerId,
      principalAmount: parseAmountInput(principalInput),
      hasInterest,
      interestAmount: hasInterest ? parseAmountInput(interestInput) : 0,
      expectedDueDate: expectedDueDate || null,
      fundedFrom,
      savingsGoalId: fundedFrom === "savings" ? savingsGoalId : null,
      lentAt: new Date(lentAt).toISOString(),
      notes: notes.trim() || null,
    };

    const parsed = createLoanSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No pudimos registrar el préstamo");
        return;
      }

      onCreated(data.loan, data.overview);
      setPrincipalInput("");
      setInterestInput("");
      setHasInterest(false);
      setExpectedDueDate("");
      setNotes("");
      setLentAt(toInputDateTime());
    } catch {
      setError("No pudimos registrar el préstamo");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (persons.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
        Registra al menos una persona en la pestaña Personas antes de crear un
        préstamo.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border/70 bg-white p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold">Registrar préstamo</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="loan-borrower" className="mb-2 block text-sm font-medium">
            Persona
          </label>
          <select
            id="loan-borrower"
            value={borrowerId}
            onChange={(event) => setBorrowerId(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          >
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="loan-amount" className="mb-2 block text-sm font-medium">
            Monto prestado
          </label>
          <input
            id="loan-amount"
            value={principalInput}
            onChange={(event) =>
              setPrincipalInput(formatAmountInput(event.target.value))
            }
            placeholder="0"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="loan-date" className="mb-2 block text-sm font-medium">
            Fecha del préstamo
          </label>
          <input
            id="loan-date"
            type="datetime-local"
            value={lentAt}
            onChange={(event) => setLentAt(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="loan-due" className="mb-2 block text-sm font-medium">
            Fecha aprox. de pago (opcional)
          </label>
          <input
            id="loan-due"
            type="date"
            value={expectedDueDate}
            onChange={(event) => setExpectedDueDate(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={hasInterest}
              onChange={(event) => setHasInterest(event.target.checked)}
            />
            Incluye interés
          </label>
          {hasInterest ? (
            <input
              value={interestInput}
              onChange={(event) =>
                setInterestInput(formatAmountInput(event.target.value))
              }
              placeholder="Monto del interés"
              className="mt-2 h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
            />
          ) : null}
        </div>

        <div className="sm:col-span-2 space-y-3">
          <p className="text-sm font-medium">¿De dónde sale el dinero?</p>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="fundedFrom"
                checked={fundedFrom === "cash"}
                onChange={() => setFundedFrom("cash")}
              />
              Mi plata
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="fundedFrom"
                checked={fundedFrom === "savings"}
                onChange={() => setFundedFrom("savings")}
                disabled={savingsOptions.length === 0}
              />
              Mis ahorros
            </label>
          </div>
          {fundedFrom === "savings" ? (
            <select
              value={savingsGoalId}
              onChange={(event) => setSavingsGoalId(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
            >
              {savingsOptions.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name} · {goal.currentBalance.toLocaleString("es-CO")}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="loan-notes" className="mb-2 block text-sm font-medium">
            Notas (opcional)
          </label>
          <textarea
            id="loan-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Registrar en espera"}
      </Button>
    </form>
  );
}

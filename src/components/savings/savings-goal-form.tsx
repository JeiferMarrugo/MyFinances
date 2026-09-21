"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { CardRecord } from "@/lib/cards/types";
import { formatAmountInput, formatCurrency, parseAmountInput } from "@/lib/format/currency";
import type { SavingsGoalWithBalance } from "@/lib/savings-goals/types";
import {
  savingsGoalSchema,
  type SavingsGoalInput,
} from "@/lib/validations/savings-goal";

type SavingsGoalFormProps = {
  cards: CardRecord[];
  initialValues?: SavingsGoalWithBalance | null;
  onSubmit: (values: SavingsGoalInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const emptyValues: SavingsGoalInput = {
  name: "",
  cardId: null,
  targetAmount: null,
  targetMonths: null,
  color: "#7c3aed",
  notes: null,
};

export function SavingsGoalForm({
  cards,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar ahorro",
}: SavingsGoalFormProps) {
  const [values, setValues] = useState<SavingsGoalInput>(
    initialValues
      ? {
          name: initialValues.name,
          cardId: initialValues.cardId,
          targetAmount: initialValues.targetAmount,
          targetMonths: initialValues.targetMonths,
          color: initialValues.color,
          notes: initialValues.notes,
        }
      : emptyValues,
  );
  const [targetInput, setTargetInput] = useState(
    initialValues?.targetAmount
      ? formatAmountInput(String(initialValues.targetAmount))
      : "",
  );
  const [targetMonthsInput, setTargetMonthsInput] = useState(
    initialValues?.targetMonths ? String(initialValues.targetMonths) : "",
  );
  const [balanceInput, setBalanceInput] = useState(
    initialValues
      ? formatAmountInput(String(initialValues.currentBalance))
      : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        cardId: initialValues.cardId,
        targetAmount: initialValues.targetAmount,
        color: initialValues.color,
        notes: initialValues.notes,
      });
      setTargetInput(
        initialValues.targetAmount
          ? formatAmountInput(String(initialValues.targetAmount))
          : "",
      );
      setTargetMonthsInput(
        initialValues.targetMonths ? String(initialValues.targetMonths) : "",
      );
      setBalanceInput(formatAmountInput(String(initialValues.currentBalance)));
    } else {
      setValues(emptyValues);
      setTargetInput("");
      setTargetMonthsInput("");
      setBalanceInput("");
    }
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const targetAmount = targetInput ? parseAmountInput(targetInput) : null;
    const targetMonths = targetMonthsInput ? Number(targetMonthsInput) : null;
    const balanceAmount = balanceInput ? parseAmountInput(balanceInput) : undefined;
    const parsed = savingsGoalSchema.safeParse({
      ...values,
      targetAmount:
        targetInput && !Number.isNaN(targetAmount) ? targetAmount : null,
      targetMonths:
        targetMonthsInput &&
        !Number.isNaN(targetMonths) &&
        targetMonths != null &&
        targetMonths > 0
          ? targetMonths
          : null,
      initialBalance:
        !initialValues &&
        balanceInput &&
        !Number.isNaN(balanceAmount) &&
        balanceAmount != null &&
        balanceAmount > 0
          ? balanceAmount
          : undefined,
      currentBalance:
        initialValues &&
        balanceInput &&
        !Number.isNaN(balanceAmount) &&
        balanceAmount != null
          ? balanceAmount
          : undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(parsed.data);
      if (!initialValues) {
        setValues(emptyValues);
        setTargetInput("");
        setTargetMonthsInput("");
        setBalanceInput("");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos guardar el ahorro",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="savings-name" className="mb-2 block text-sm font-medium">
          Nombre del ahorro
        </label>
        <input
          id="savings-name"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Fondo de emergencia"
          className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="savings-card" className="mb-2 block text-sm font-medium">
          Tarjeta asociada
        </label>
        <Select
          id="savings-card"
          value={values.cardId ?? ""}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              cardId: event.target.value || null,
            }))
          }
          searchable={false}
        >
          <option value="">Sin tarjeta</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
              {card.bankName ? ` · ${card.bankName}` : ""}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="savings-target" className="mb-2 block text-sm font-medium">
            Meta (opcional)
          </label>
          <input
            id="savings-target"
            value={targetInput}
            onChange={(event) =>
              setTargetInput(formatAmountInput(event.target.value))
            }
            placeholder="1.000.000"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm tabular-nums outline-none ring-ring focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="savings-target-months"
            className="mb-2 block text-sm font-medium"
          >
            Plazo en meses (opcional)
          </label>
          <input
            id="savings-target-months"
            type="number"
            min={1}
            max={600}
            value={targetMonthsInput}
            onChange={(event) => setTargetMonthsInput(event.target.value)}
            placeholder="12"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm tabular-nums outline-none ring-ring focus:ring-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            En cuántos meses quieres llegar a la meta.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="savings-balance" className="mb-2 block text-sm font-medium">
          Saldo actual
        </label>
        <input
          id="savings-balance"
          value={balanceInput}
          onChange={(event) => setBalanceInput(formatAmountInput(event.target.value))}
          placeholder="500.000"
          className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm tabular-nums outline-none ring-ring focus:ring-2"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {initialValues
            ? "Corrige el saldo real de tu fondo. Se registrará un ajuste automático."
            : "Cuánto tienes guardado hoy en este fondo."}
        </p>
      </div>

      <div>
        <label htmlFor="savings-color" className="mb-2 block text-sm font-medium">
          Color
        </label>
        <input
          id="savings-color"
          type="color"
          value={values.color}
          onChange={(event) =>
            setValues((current) => ({ ...current, color: event.target.value }))
          }
          className="h-11 w-full rounded-xl border border-border bg-white px-2"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}

type SavingsDepositFormProps = {
  goal: SavingsGoalWithBalance;
  onSubmit: (amount: number, occurredAt: string) => Promise<void>;
};

export function SavingsDepositForm({ goal, onSubmit }: SavingsDepositFormProps) {
  const [amountInput, setAmountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = parseAmountInput(amountInput);

    if (Number.isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);

    try {
      await onSubmit(amount, new Date().toISOString());
      setAmountInput("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[180px] flex-1">
        <label className="mb-2 block text-xs font-medium text-muted-foreground">
          Aportar a {goal.name}
        </label>
        <input
          value={amountInput}
          onChange={(event) => setAmountInput(formatAmountInput(event.target.value))}
          placeholder="0"
          className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm tabular-nums outline-none ring-ring focus:ring-2"
        />
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Aportar"}
      </Button>
      <p className="w-full text-xs text-muted-foreground">
        Saldo actual: {formatCurrency(goal.currentBalance)}
      </p>
    </form>
  );
}

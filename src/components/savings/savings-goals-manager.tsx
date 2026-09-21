"use client";

import Link from "next/link";
import { useState } from "react";
import { SavingsDepositForm, SavingsGoalForm } from "@/components/savings/savings-goal-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { CardRecord } from "@/lib/cards/types";
import { formatCurrency } from "@/lib/format/currency";
import { getMonthlySavingsTarget } from "@/lib/savings-goals/utils";
import type { SavingsGoalWithBalance } from "@/lib/savings-goals/types";
import type { SavingsGoalInput } from "@/lib/validations/savings-goal";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { appConfirm } from "@/stores/confirm-dialog-store";

type SavingsGoalsManagerProps = {
  initialGoals: SavingsGoalWithBalance[];
  cards: CardRecord[];
};

export function SavingsGoalsManager({
  initialGoals,
  cards,
}: SavingsGoalsManagerProps) {
  const [goals, setGoals] = useState(initialGoals);
  const [editingGoal, setEditingGoal] = useState<SavingsGoalWithBalance | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function createGoal(values: SavingsGoalInput) {
    const toastId = appToast.loading(toastCopy.savingsGoals.loadingCreate);
    const response = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.savingsGoals.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.savingsGoals.errorDescription,
      });
      throw new Error(data.error);
    }

    setGoals((current) =>
      [...current, data.goal].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setShowForm(false);
    appToast.success(toastCopy.savingsGoals.createSuccessTitle, {
      id: toastId,
      description: toastCopy.savingsGoals.createSuccessDescription(values.name),
    });
  }

  async function updateGoal(values: SavingsGoalInput) {
    if (!editingGoal) return;

    const toastId = appToast.loading(toastCopy.savingsGoals.loadingUpdate);
    const response = await fetch(`/api/savings-goals/${editingGoal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.savingsGoals.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.savingsGoals.errorDescription,
      });
      throw new Error(data.error);
    }

    setGoals((current) =>
      current
        .map((goal) => (goal.id === editingGoal.id ? data.goal : goal))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingGoal(null);
    appToast.success(toastCopy.savingsGoals.updateSuccessTitle, {
      id: toastId,
      description: toastCopy.savingsGoals.updateSuccessDescription(values.name),
    });
  }

  async function deleteGoal(goal: SavingsGoalWithBalance) {
    const confirmed = await appConfirm({
      title: "Eliminar ahorro",
      description: `¿Eliminar "${goal.name}"? Se perderá el historial de aportes.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    const toastId = appToast.loading(toastCopy.savingsGoals.loadingDelete);
    const response = await fetch(`/api/savings-goals/${goal.id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.savingsGoals.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.savingsGoals.errorDescription,
      });
      return;
    }

    setGoals((current) => current.filter((item) => item.id !== goal.id));
    appToast.success(toastCopy.savingsGoals.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.savingsGoals.deleteSuccessDescription(goal.name),
    });
  }

  async function depositToGoal(goalId: string, amount: number, occurredAt: string) {
    const toastId = appToast.loading(toastCopy.savingsGoals.loadingDeposit);
    const response = await fetch(`/api/savings-goals/${goalId}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, occurredAt }),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.savingsGoals.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.savingsGoals.errorDescription,
      });
      throw new Error(data.error);
    }

    setGoals((current) =>
      current.map((goal) => (goal.id === goalId ? data.goal : goal)),
    );
    appToast.success(toastCopy.savingsGoals.depositSuccessTitle, {
      id: toastId,
      description: toastCopy.savingsGoals.depositSuccessDescription(amount),
    });
  }

  const totalBalance = goals
    .filter((goal) => goal.isActive)
    .reduce((sum, goal) => sum + goal.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/90 p-5">
        <p className="text-sm text-muted-foreground">Total en ahorros</p>
        <p className="brand-text mt-2 text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Asocia cada ahorro a una tarjeta. Al pagar un gasto con ahorros, no afecta
          negativamente tu balance del periodo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            setEditingGoal(null);
            setShowForm(true);
          }}
        >
          Nuevo ahorro
        </Button>
        <Link
          href="/dashboard/manejadores/tarjetas"
          className="inline-flex h-10 items-center rounded-xl border border-accent/15 bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:border-accent/30 hover:bg-secondary/30"
        >
          Administrar tarjetas
        </Link>
      </div>

      {showForm || editingGoal ? (
        <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5">
          <h2 className="mb-4 text-lg font-semibold">
            {editingGoal ? "Editar ahorro" : "Crear ahorro"}
          </h2>
          <SavingsGoalForm
            cards={cards}
            initialValues={editingGoal}
            onSubmit={editingGoal ? updateGoal : createGoal}
            onCancel={() => {
              setShowForm(false);
              setEditingGoal(null);
            }}
            submitLabel={editingGoal ? "Guardar cambios" : "Crear ahorro"}
          />
        </div>
      ) : null}

      {goals.length === 0 ? (
        <EmptyState
          title="Aún no tienes ahorros"
          description="Crea un fondo y asígnale la tarjeta donde guardas ese dinero."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {goal.cardName
                      ? `Tarjeta: ${goal.cardName}${goal.bankName ? ` · ${goal.bankName}` : ""}`
                      : "Sin tarjeta asociada"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowForm(false);
                      setEditingGoal(goal);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => deleteGoal(goal)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              <p className="brand-text mt-4 text-2xl font-bold">
                {formatCurrency(goal.currentBalance)}
              </p>

              {goal.targetAmount != null ? (
                <>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between gap-3">
                      <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                      <span>{goal.progressPercent ?? 0}%</span>
                    </div>
                    {goal.targetMonths ? (
                      <p>
                        Plazo: {goal.targetMonths} mes
                        {goal.targetMonths === 1 ? "" : "es"}
                        {getMonthlySavingsTarget(goal) != null ? (
                          <>
                            {" · "}
                            Ahorro mensual sugerido:{" "}
                            {formatCurrency(getMonthlySavingsTarget(goal)!)}
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(goal.progressPercent ?? 0, 100)}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                </>
              ) : null}

              <SavingsDepositForm
                goal={goal}
                onSubmit={(amount, occurredAt) => depositToGoal(goal.id, amount, occurredAt)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

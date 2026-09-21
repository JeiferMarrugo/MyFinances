"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";
import type { MerchantRecord } from "@/lib/merchants/types";
import type { SavingsGoalWithBalance } from "@/lib/savings-goals/types";
import type { RecurringIncomeInput } from "@/lib/validations/recurring-income";
import type { TransactionInput } from "@/lib/validations/transaction";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { useTransactionModalStore } from "@/stores/transaction-modal-store";

type TransactionFormDialogProps = {
  merchants: MerchantRecord[];
};

export function TransactionFormDialog({ merchants }: TransactionFormDialogProps) {
  const router = useRouter();
  const isOpen = useTransactionModalStore((state) => state.isOpen);
  const defaultType = useTransactionModalStore((state) => state.defaultType);
  const close = useTransactionModalStore((state) => state.close);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalWithBalance[]>([]);
  const [financeSettings, setFinanceSettings] =
    useState<FinanceSettingsRecord | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/savings-goals")
      .then((response) => response.json())
      .then((data) => {
        setSavingsGoals(
          (data.goals ?? []).filter(
            (goal: SavingsGoalWithBalance) => goal.isActive && goal.currentBalance > 0,
          ),
        );
      })
      .catch(() => setSavingsGoals([]));

    fetch("/api/finance-settings")
      .then((response) => response.json())
      .then((data) => setFinanceSettings(data.settings ?? null))
      .catch(() => setFinanceSettings(null));
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(values: TransactionInput) {
    const toastId = appToast.loading(toastCopy.transactions.loadingCreate);

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.transactions.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.transactions.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.transactions.errorDescription);
    }

    appToast.success(
      values.type === "income"
        ? toastCopy.transactions.incomeSuccessTitle
        : toastCopy.transactions.expenseSuccessTitle,
      {
        id: toastId,
        description: toastCopy.transactions.successDescription(values.title),
      },
    );

    close();
    router.refresh();
  }

  async function handleSubmitRecurring(values: RecurringIncomeInput) {
    const toastId = appToast.loading(toastCopy.recurringIncomes.loadingCreate);

    const response = await fetch("/api/recurring-incomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.recurringIncomes.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.recurringIncomes.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.recurringIncomes.errorDescription);
    }

    appToast.success(toastCopy.recurringIncomes.createSuccessTitle, {
      id: toastId,
      description: toastCopy.recurringIncomes.createSuccessDescription(
        values.title,
      ),
    });

    close();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Cerrar formulario"
        className="absolute inset-0"
        onClick={close}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold brand-text">Nuevo movimiento</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {defaultType === "income" ? "Registrar ingreso" : "Registrar gasto"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Cerrar
          </button>
        </div>

        <TransactionForm
          merchants={merchants}
          financeSettings={financeSettings}
          savingsGoals={savingsGoals}
          defaultType={defaultType}
          onSubmit={handleSubmit}
          onSubmitRecurring={
            defaultType === "income" ? handleSubmitRecurring : undefined
          }
          onCancel={close}
          submitLabel="Guardar movimiento"
        />
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RecurringExpensesList } from "@/components/recurring-expenses/recurring-expenses-list";
import { RecurringIncomesList } from "@/components/recurring-incomes/recurring-incomes-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { PaymentPlanDialog } from "@/components/transactions/payment-plan-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";
import type { MerchantRecord } from "@/lib/merchants/types";
import type { RecurringExpenseWithSpending } from "@/lib/recurring-expenses/types";
import type { SavingsGoalWithBalance } from "@/lib/savings-goals/types";
import type { RecurringIncomeRecord } from "@/lib/recurring-incomes/types";
import type {
  DisplayTransaction,
  MonthlySummary,
} from "@/lib/transactions/types";
import type { RecurringExpenseInput } from "@/lib/validations/recurring-expense";
import type { RecurringIncomeInput } from "@/lib/validations/recurring-income";
import type { TransactionInput } from "@/lib/validations/transaction";
import { formatCurrency } from "@/lib/format/currency";
import { displayTransactionToInput } from "@/lib/transactions/utils";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { appConfirm } from "@/stores/confirm-dialog-store";
import { useTransactionModalStore } from "@/stores/transaction-modal-store";

type TransactionsManagerProps = {
  initialTransactions: DisplayTransaction[];
  initialSummary: MonthlySummary;
  merchants: MerchantRecord[];
  financeSettings: FinanceSettingsRecord;
  initialRecurringIncomes: RecurringIncomeRecord[];
  initialRecurringExpenses: RecurringExpenseWithSpending[];
  initialSavingsGoals: SavingsGoalWithBalance[];
};

export function TransactionsManager({
  initialTransactions,
  initialSummary,
  merchants,
  financeSettings,
  initialRecurringIncomes,
  initialRecurringExpenses,
  initialSavingsGoals,
}: TransactionsManagerProps) {
  const router = useRouter();
  const openModal = useTransactionModalStore((state) => state.open);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [summary, setSummary] = useState(initialSummary);
  const [recurringIncomes, setRecurringIncomes] = useState(
    initialRecurringIncomes,
  );
  const [recurringExpenses, setRecurringExpenses] = useState(
    initialRecurringExpenses,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(
    null,
  );
  const [recurringUpdatingId, setRecurringUpdatingId] = useState<string | null>(
    null,
  );
  const [recurringExpenseUpdatingId, setRecurringExpenseUpdatingId] =
    useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<DisplayTransaction | null>(null);
  const [paymentPlanTransaction, setPaymentPlanTransaction] =
    useState<DisplayTransaction | null>(null);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [inlineFormType, setInlineFormType] = useState<"income" | "expense">(
    "expense",
  );

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  async function createTransaction(values: TransactionInput) {
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

    setTransactions((current) => [data.transaction, ...current]);
    setSummary(data.summary);
    setShowInlineForm(false);

    appToast.success(
      values.type === "income"
        ? toastCopy.transactions.incomeSuccessTitle
        : toastCopy.transactions.expenseSuccessTitle,
      {
        id: toastId,
        description: toastCopy.transactions.successDescription(values.title),
      },
    );

    router.refresh();
  }

  async function createRecurringIncome(values: RecurringIncomeInput) {
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

    setRecurringIncomes((current) =>
      [...current, data.recurringIncome].sort((a, b) =>
        a.title.localeCompare(b.title),
      ),
    );
    setShowInlineForm(false);

    appToast.success(toastCopy.recurringIncomes.createSuccessTitle, {
      id: toastId,
      description: toastCopy.recurringIncomes.createSuccessDescription(
        values.title,
      ),
    });

    router.refresh();
  }

  async function toggleRecurringIncome(item: RecurringIncomeRecord) {
    setRecurringUpdatingId(item.id);

    const response = await fetch(`/api/recurring-incomes/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });

    const data = await response.json();
    setRecurringUpdatingId(null);

    if (!response.ok) {
      appToast.error(toastCopy.recurringIncomes.errorTitle, {
        description: data.error ?? toastCopy.recurringIncomes.errorDescription,
      });
      return;
    }

    setRecurringIncomes((current) =>
      current.map((entry) =>
        entry.id === item.id ? data.recurringIncome : entry,
      ),
    );

    router.refresh();
  }

  async function deleteRecurringIncome(item: RecurringIncomeRecord) {
    const confirmed = await appConfirm({
      title: "¿Eliminar ingreso recurrente?",
      description: "Ya no se registrará automáticamente en tus movimientos:",
      highlight: item.title,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    setRecurringUpdatingId(item.id);
    const toastId = appToast.loading(toastCopy.recurringIncomes.loadingDelete);

    const response = await fetch(`/api/recurring-incomes/${item.id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    setRecurringUpdatingId(null);

    if (!response.ok) {
      appToast.error(toastCopy.recurringIncomes.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.recurringIncomes.errorDescription,
      });
      return;
    }

    setRecurringIncomes((current) =>
      current.filter((entry) => entry.id !== item.id),
    );

    appToast.success(toastCopy.recurringIncomes.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.recurringIncomes.deleteSuccessDescription(
        item.title,
      ),
    });

    router.refresh();
  }

  async function createRecurringExpense(values: RecurringExpenseInput) {
    const toastId = appToast.loading(toastCopy.recurringExpenses.loadingCreate);

    const response = await fetch("/api/recurring-expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.recurringExpenses.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.recurringExpenses.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.recurringExpenses.errorDescription);
    }

    setRecurringExpenses((current) =>
      [...current, data.recurringExpense].sort((a, b) =>
        a.title.localeCompare(b.title),
      ),
    );
    setShowInlineForm(false);

    appToast.success(toastCopy.recurringExpenses.createSuccessTitle, {
      id: toastId,
      description: toastCopy.recurringExpenses.createSuccessDescription(
        values.title,
      ),
    });

    router.refresh();
  }

  async function toggleRecurringExpense(item: RecurringExpenseWithSpending) {
    setRecurringExpenseUpdatingId(item.id);

    const response = await fetch(`/api/recurring-expenses/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });

    const data = await response.json();
    setRecurringExpenseUpdatingId(null);

    if (!response.ok) {
      appToast.error(toastCopy.recurringExpenses.errorTitle, {
        description: data.error ?? toastCopy.recurringExpenses.errorDescription,
      });
      return;
    }

    setRecurringExpenses((current) =>
      current.map((entry) =>
        entry.id === item.id ? data.recurringExpense : entry,
      ),
    );

    router.refresh();
  }

  async function deleteRecurringExpense(item: RecurringExpenseWithSpending) {
    const confirmed = await appConfirm({
      title: "¿Eliminar gasto fijo?",
      description: "Ya no formará parte de tu presupuesto mensual:",
      highlight: item.title,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    setRecurringExpenseUpdatingId(item.id);
    const toastId = appToast.loading(toastCopy.recurringExpenses.loadingDelete);

    const response = await fetch(`/api/recurring-expenses/${item.id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    setRecurringExpenseUpdatingId(null);

    if (!response.ok) {
      appToast.error(toastCopy.recurringExpenses.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.recurringExpenses.errorDescription,
      });
      return;
    }

    setRecurringExpenses((current) =>
      current.filter((entry) => entry.id !== item.id),
    );

    appToast.success(toastCopy.recurringExpenses.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.recurringExpenses.deleteSuccessDescription(
        item.title,
      ),
    });

    router.refresh();
  }

  async function updateTransaction(values: TransactionInput) {
    if (!editingTransaction) return;

    const toastId = appToast.loading(toastCopy.transactions.loadingUpdate);

    const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
      method: "PATCH",
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

    setTransactions((current) =>
      current
        .map((item) =>
          item.id === editingTransaction.id ? data.transaction : item,
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    );
    setSummary(data.summary);
    setEditingTransaction(null);

    appToast.success(toastCopy.transactions.updateSuccessTitle, {
      id: toastId,
      description: toastCopy.transactions.updateSuccessDescription(values.title),
    });

    router.refresh();
  }

  async function deleteTransaction(transaction: DisplayTransaction) {
    const confirmed = await appConfirm({
      title: "¿Eliminar movimiento?",
      description:
        "Se quitará de tu historial y ya no contará en los totales del mes:",
      highlight: transaction.merchant,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    setDeletingId(transaction.id);
    const toastId = appToast.loading(toastCopy.transactions.loadingDelete);

    const response = await fetch(`/api/transactions/${transaction.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.transactions.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.transactions.errorDescription,
      });
      setDeletingId(null);
      return;
    }

    setTransactions((current) =>
      current.filter((item) => item.id !== transaction.id),
    );
    if (editingTransaction?.id === transaction.id) {
      setEditingTransaction(null);
    }
    setSummary(data.summary);

    appToast.success(toastCopy.transactions.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.transactions.deleteSuccessDescription(
        transaction.merchant,
      ),
    });

    setDeletingId(null);
    router.refresh();
  }

  async function payInstallment(transaction: DisplayTransaction) {
    setPayingInstallmentId(transaction.id);
    const toastId = appToast.loading(toastCopy.transactions.loadingPayInstallment);

    const response = await fetch(
      `/api/transactions/${transaction.id}/pay-installment`,
      { method: "POST" },
    );

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.transactions.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.transactions.errorDescription,
      });
      setPayingInstallmentId(null);
      return;
    }

    setTransactions((current) =>
      current
        .map((item) =>
          item.id === transaction.id ? data.transaction : item,
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    );
    setSummary(data.summary);

    appToast.success(toastCopy.transactions.payInstallmentSuccessTitle, {
      id: toastId,
      description: toastCopy.transactions.payInstallmentSuccessDescription(
        transaction.merchant,
        data.transaction.installmentsPaid,
        data.transaction.installmentsCount ?? 0,
      ),
    });

    setPayingInstallmentId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">Ingresos del mes</p>
          <p className="mt-2 text-2xl font-bold text-success">
            {formatCurrency(summary.monthlyIncome)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.incomeCount} ingreso{summary.incomeCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">Gastos del mes</p>
          <p className="mt-2 text-2xl font-bold text-destructive">
            {formatCurrency(summary.monthlyExpenses)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.creditDueThisMonth > 0 || summary.expensesFromSavings > 0
              ? `${formatCurrency(summary.cashExpenses)} directos${summary.creditDueThisMonth > 0 ? ` · ${formatCurrency(summary.creditDueThisMonth)} cuotas` : ""}${summary.expensesFromSavings > 0 ? ` · ${formatCurrency(summary.expensesFromSavings)} con ahorros` : ""}`
              : `${summary.expenseCount} egreso${summary.expenseCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">Balance del mes</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              summary.balance >= 0 ? "brand-text" : "text-destructive"
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{summary.periodLabel}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="success"
          onClick={() => {
            setEditingTransaction(null);
            setInlineFormType("income");
            setShowInlineForm(true);
          }}
        >
          Agregar ingreso
        </Button>
        <Button
          type="button"
          variant="destructive-soft"
          onClick={() => {
            setEditingTransaction(null);
            setInlineFormType("expense");
            setShowInlineForm(true);
          }}
        >
          Registrar gasto
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => openModal("expense")}
        >
          Abrir formulario rápido
        </Button>
      </div>

      {showInlineForm ? (
        <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {inlineFormType === "income" ? "Nuevo ingreso" : "Nuevo gasto"}
            </h2>
            <button
              type="button"
              onClick={() => setShowInlineForm(false)}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          <TransactionForm
            merchants={merchants}
            financeSettings={financeSettings}
            savingsGoals={initialSavingsGoals.filter((goal) => goal.isActive)}
            defaultType={inlineFormType}
            onSubmit={createTransaction}
            onSubmitRecurring={
              inlineFormType === "income" ? createRecurringIncome : undefined
            }
            onSubmitRecurringExpense={
              inlineFormType === "expense" ? createRecurringExpense : undefined
            }
            onCancel={() => setShowInlineForm(false)}
          />
        </div>
      ) : null}

      <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Ingresos recurrentes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Activa la opción recurrente al agregar un ingreso para salario, pensión o seguros.
          </p>
        </div>
        <RecurringIncomesList
          items={recurringIncomes}
          updatingId={recurringUpdatingId}
          onToggleActive={toggleRecurringIncome}
          onDelete={deleteRecurringIncome}
        />
      </div>

      <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Gastos fijos mensuales</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define presupuestos para gasolina, servicios o arriendo. Registra tus
            gastos con el mismo nombre para llevar el control.
          </p>
        </div>
        <RecurringExpensesList
          items={recurringExpenses}
          updatingId={recurringExpenseUpdatingId}
          onToggleActive={toggleRecurringExpense}
          onDelete={deleteRecurringExpense}
        />
      </div>

      {editingTransaction ? (
        <div className="rounded-2xl border border-secondary bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Editar movimiento</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {editingTransaction.merchant}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingTransaction(null)}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
          <TransactionForm
            merchants={merchants}
            financeSettings={financeSettings}
            savingsGoals={initialSavingsGoals.filter((goal) => goal.isActive)}
            initialValues={displayTransactionToInput(editingTransaction)}
            onSubmit={updateTransaction}
            onCancel={() => setEditingTransaction(null)}
            submitLabel="Guardar cambios"
          />
        </div>
      ) : null}

      <div className="brand-card-accent rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Historial de movimientos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.transactionCount} movimiento
            {summary.transactionCount === 1 ? "" : "s"} este mes
          </p>
        </div>

        <TransactionsTable
          transactions={transactions}
          merchants={merchants}
          showActions
          onEdit={(transaction) => {
            setShowInlineForm(false);
            setEditingTransaction(transaction);
          }}
          onDelete={deleteTransaction}
          onPayInstallment={payInstallment}
          onShowPaymentPlan={setPaymentPlanTransaction}
          deletingId={deletingId}
          payingInstallmentId={payingInstallmentId}
        />
      </div>

      <PaymentPlanDialog
        transaction={paymentPlanTransaction}
        onClose={() => setPaymentPlanTransaction(null)}
        onConfirmed={(updated) => {
          setTransactions((current) =>
            current.map((entry) =>
              entry.id === updated.id ? updated : entry,
            ),
          );
          setPaymentPlanTransaction(null);
          router.refresh();
        }}
      />
    </div>
  );
}

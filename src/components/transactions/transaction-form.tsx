"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormToggle } from "@/components/ui/form-toggle";
import { Select } from "@/components/ui/select";
import {
  expenseCategories,
  incomeCategories,
  installmentFrequencies,
  paymentMethods,
} from "@/lib/transactions/constants";
import { recurringFrequencies } from "@/lib/recurring-incomes/constants";
import { getDefaultDateTimeLocalValue } from "@/lib/transactions/utils";
import { PaymentPlanPreviewTable } from "@/components/transactions/payment-plan-preview-table";
import { formatAmountInput, formatCurrency, parseAmountInput } from "@/lib/format/currency";
import { formatAppDate } from "@/lib/format/dates";
import { calculateGmf4x1000 } from "@/lib/format/gmf";
import type { FinancePeriodSettings } from "@/lib/finance-settings/periods";
import {
  buildCreditPaymentPlanPreview,
  getNextInstallmentNumber,
  getNextInstallmentPaymentDate,
} from "@/lib/transactions/installments";
import type { MerchantRecord } from "@/lib/merchants/types";
import type { SavingsGoalWithBalance } from "@/lib/savings-goals/types";
import {
  recurringIncomeSchema,
  type RecurringIncomeInput,
} from "@/lib/validations/recurring-income";
import {
  recurringExpenseSchema,
  type RecurringExpenseInput,
} from "@/lib/validations/recurring-expense";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transaction";

type TransactionFormProps = {
  merchants: MerchantRecord[];
  savingsGoals?: SavingsGoalWithBalance[];
  financeSettings?: Partial<FinancePeriodSettings> | null;
  defaultType?: "income" | "expense";
  initialValues?: TransactionInput | null;
  onSubmit: (values: TransactionInput) => Promise<void>;
  onSubmitRecurring?: (values: RecurringIncomeInput) => Promise<void>;
  onSubmitRecurringExpense?: (values: RecurringExpenseInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

function getTodayDateValue() {
  const today = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function getDayFromDateValue(dateValue: string) {
  if (!dateValue) return new Date().getDate();
  const datePart = dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
  return new Date(`${datePart}T12:00:00`).getDate();
}

function getInitialValues(
  defaultType: "income" | "expense",
): TransactionInput {
  return {
    type: defaultType,
    title: "",
    merchantId: null,
    category:
      defaultType === "income" ? incomeCategories[0] : expenseCategories[0],
    method: paymentMethods[0],
    amount: 0,
    occurredAt: getDefaultDateTimeLocalValue(),
    notes: null,
    paidFromSavings: false,
    savingsGoalId: null,
    includes4x1000: false,
  };
}

export function TransactionForm({
  merchants,
  savingsGoals = [],
  financeSettings = null,
  defaultType = "expense",
  initialValues = null,
  onSubmit,
  onSubmitRecurring,
  onSubmitRecurringExpense,
  onCancel,
  submitLabel = "Guardar movimiento",
}: TransactionFormProps) {
  const [values, setValues] = useState<TransactionInput>(
    initialValues ?? getInitialValues(defaultType),
  );
  const [amountInput, setAmountInput] = useState(
    initialValues?.installmentsCount && initialValues.installmentAmount
      ? ""
      : initialValues
        ? formatAmountInput(String(initialValues.amount))
        : "",
  );
  const [installmentsCountInput, setInstallmentsCountInput] = useState(
    initialValues?.installmentsCount
      ? String(initialValues.installmentsCount)
      : "1",
  );
  const [installmentAmountInput, setInstallmentAmountInput] = useState(
    initialValues?.installmentAmount
      ? formatAmountInput(String(initialValues.installmentAmount))
      : "",
  );
  const [creditAlreadyStarted, setCreditAlreadyStarted] = useState(
    initialValues?.creditAlreadyStarted ?? false,
  );
  const [hasPrepaidInstallments, setHasPrepaidInstallments] = useState(
    Boolean(
      initialValues?.creditAlreadyStarted &&
        (initialValues.installmentsPaid ?? 0) > 0,
    ),
  );
  const [installmentsPaidInput, setInstallmentsPaidInput] = useState(
    initialValues?.creditAlreadyStarted && initialValues.installmentsPaid
      ? String(initialValues.installmentsPaid)
      : "0",
  );
  const [installmentFrequency, setInstallmentFrequency] = useState<
    NonNullable<TransactionInput["installmentFrequency"]>
  >(
    (initialValues?.installmentFrequency as TransactionInput["installmentFrequency"]) ??
      "monthly",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isFixedExpense, setIsFixedExpense] = useState(false);
  const [autoRegister, setAutoRegister] = useState(false);
  const [frequency, setFrequency] =
    useState<RecurringIncomeInput["frequency"]>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState(getDayFromDateValue(getTodayDateValue()));
  const [startDate, setStartDate] = useState(getTodayDateValue());
  const [paidFromSavings, setPaidFromSavings] = useState(
    initialValues?.paidFromSavings ?? false,
  );
  const [savingsGoalId, setSavingsGoalId] = useState<string | null>(
    initialValues?.savingsGoalId ?? null,
  );
  const [includes4x1000, setIncludes4x1000] = useState(
    initialValues?.includes4x1000 ?? false,
  );

  const selectedMerchant = merchants.find(
    (item) => item.id === values.merchantId,
  );
  const showCreditInstallments =
    values.type === "expense" &&
    Boolean(selectedMerchant?.allowsCredit) &&
    values.method === "Tarjeta crédito";

  const canConfigureRecurring =
    values.type === "income" && !initialValues && Boolean(onSubmitRecurring);
  const canConfigureFixedExpense =
    values.type === "expense" &&
    !initialValues &&
    Boolean(onSubmitRecurringExpense) &&
    !showCreditInstallments;
  const showRecurringFields =
    (canConfigureRecurring && isRecurring) ||
    (canConfigureFixedExpense && isFixedExpense);
  const showSavingsPayment =
    values.type === "expense" &&
    !showRecurringFields &&
    (savingsGoals.length > 0 || Boolean(initialValues?.paidFromSavings));
  const shouldPersistSavings =
    values.type === "expense" &&
    !showRecurringFields &&
    (showSavingsPayment || Boolean(initialValues?.paidFromSavings));
  const selectedSavingsGoal = savingsGoals.find((goal) => goal.id === savingsGoalId);
  const showDayOfMonth = frequency === "monthly" || frequency === "yearly";

  const installmentsCount = Number(installmentsCountInput) || 0;
  const installmentAmount = parseAmountInput(installmentAmountInput);
  const installmentsPaid =
    hasPrepaidInstallments && creditAlreadyStarted
      ? Number(installmentsPaidInput) || 0
      : 0;
  const parsedAmount = parseAmountInput(amountInput);
  const savingsBaseAmount =
    showCreditInstallments && !Number.isNaN(installmentAmount) && installmentAmount > 0
      ? installmentAmount
      : !Number.isNaN(parsedAmount) && parsedAmount > 0
        ? parsedAmount
        : 0;
  const savingsGmfAmount =
    paidFromSavings && includes4x1000 ? calculateGmf4x1000(savingsBaseAmount) : 0;
  const savingsTotalWithdrawal = savingsBaseAmount + savingsGmfAmount;
  const remainingInstallments =
    installmentsCount > 0 ? Math.max(installmentsCount - installmentsPaid, 0) : 0;
  const calculatedTotal =
    showCreditInstallments &&
    installmentsCount > 0 &&
    !Number.isNaN(installmentAmount)
      ? installmentsCount * installmentAmount
      : 0;
  const creditPreviewRow =
    showCreditInstallments &&
    installmentsCount > 0 &&
    !Number.isNaN(installmentAmount) &&
    installmentAmount > 0 &&
    values.occurredAt &&
    !Number.isNaN(new Date(values.occurredAt).getTime())
      ? {
          type: "expense" as const,
          amount: calculatedTotal,
          occurredAt: new Date(values.occurredAt),
          installmentsCount,
          installmentAmount,
          creditAlreadyStarted,
          installmentsPaid,
          installmentFrequency,
          paidFromSavings: false,
        }
      : null;
  const paymentPlanPreview = creditPreviewRow
    ? buildCreditPaymentPlanPreview(creditPreviewRow, financeSettings)
    : [];
  const previewNextPayment =
    creditPreviewRow
      ? (() => {
          const nextDate = getNextInstallmentPaymentDate(
            creditPreviewRow,
            financeSettings,
          );
          const nextNumber = getNextInstallmentNumber(creditPreviewRow);

          return nextDate && nextNumber
            ? {
                date: nextDate,
                number: nextNumber,
              }
            : null;
        })()
      : null;

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);

      if (initialValues.installmentsCount && initialValues.installmentAmount) {
        setInstallmentsCountInput(String(initialValues.installmentsCount));
        setInstallmentAmountInput(
          formatAmountInput(String(initialValues.installmentAmount)),
        );
        setAmountInput("");
        setCreditAlreadyStarted(initialValues.creditAlreadyStarted ?? false);
        setHasPrepaidInstallments(
          Boolean(
            initialValues.creditAlreadyStarted &&
              (initialValues.installmentsPaid ?? 0) > 0,
          ),
        );
        setInstallmentsPaidInput(
          initialValues.creditAlreadyStarted &&
            (initialValues.installmentsPaid ?? 0) > 0
            ? String(initialValues.installmentsPaid ?? 0)
            : "0",
        );
        setInstallmentFrequency(
          (initialValues.installmentFrequency as TransactionInput["installmentFrequency"]) ??
            "monthly",
        );
      } else {
        setAmountInput(formatAmountInput(String(initialValues.amount)));
        setInstallmentsCountInput("1");
        setInstallmentAmountInput("");
        setCreditAlreadyStarted(false);
        setHasPrepaidInstallments(false);
        setInstallmentsPaidInput("0");
        setInstallmentFrequency("monthly");
      }

      setPaidFromSavings(initialValues.paidFromSavings ?? false);
      setSavingsGoalId(initialValues.savingsGoalId ?? null);
      setIncludes4x1000(initialValues.includes4x1000 ?? false);
      setError(null);
      return;
    }

    setValues(getInitialValues(defaultType));
    setAmountInput("");
    setInstallmentsCountInput("1");
    setInstallmentAmountInput("");
    setCreditAlreadyStarted(false);
    setHasPrepaidInstallments(false);
    setInstallmentsPaidInput("0");
    setInstallmentFrequency("monthly");
    setIsRecurring(false);
    setIsFixedExpense(false);
    setAutoRegister(false);
    setFrequency("monthly");
    setStartDate(getTodayDateValue());
    setDayOfMonth(getDayFromDateValue(getTodayDateValue()));
    setPaidFromSavings(false);
    setSavingsGoalId(null);
    setIncludes4x1000(false);
    setError(null);
  }, [defaultType, initialValues]);

  const categories =
    values.type === "income" ? incomeCategories : expenseCategories;

  function handleTypeChange(type: "income" | "expense") {
    setValues((current) => ({
      ...current,
      type,
      category: type === "income" ? incomeCategories[0] : expenseCategories[0],
    }));

    if (type === "expense") {
      setIsRecurring(false);
    } else {
      setIsFixedExpense(false);
      setAutoRegister(false);
    }
  }

  function handleMerchantChange(merchantId: string) {
    const merchant = merchants.find((item) => item.id === merchantId);

    setValues((current) => ({
      ...current,
      merchantId: merchantId || null,
      title: merchant?.name ?? current.title,
      method:
        current.type === "expense" && merchant?.allowsCredit
          ? "Tarjeta crédito"
          : current.method,
    }));

    if (!merchant?.allowsCredit) {
      setInstallmentsCountInput("1");
      setInstallmentAmountInput("");
      setCreditAlreadyStarted(false);
      setHasPrepaidInstallments(false);
      setInstallmentsPaidInput("0");
      setInstallmentFrequency("monthly");
    }
  }

  function handleAmountChange(value: string) {
    setAmountInput(formatAmountInput(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const amount = showCreditInstallments
      ? calculatedTotal
      : parseAmountInput(amountInput);

    if (canConfigureRecurring && isRecurring) {
      const parsedRecurring = recurringIncomeSchema.safeParse({
        title: values.title,
        category: values.category,
        method: values.method,
        amount,
        frequency,
        dayOfMonth,
        startDate,
        notes: values.notes,
      });

      if (!parsedRecurring.success) {
        setError(
          parsedRecurring.error.issues[0]?.message ??
            "Revisa los datos del formulario",
        );
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmitRecurring?.(parsedRecurring.data);

        if (!initialValues) {
          setValues(getInitialValues(defaultType));
          setAmountInput("");
          setInstallmentsCountInput("1");
          setInstallmentAmountInput("");
          setIsRecurring(false);
          setFrequency("monthly");
          setStartDate(getTodayDateValue());
          setDayOfMonth(getDayFromDateValue(getTodayDateValue()));
        }
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "No pudimos guardar el ingreso recurrente",
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (canConfigureFixedExpense && isFixedExpense) {
      const parsedFixedExpense = recurringExpenseSchema.safeParse({
        title: values.title,
        category: values.category,
        method: values.method,
        budgetAmount: amount,
        frequency,
        dayOfMonth,
        startDate,
        autoRegister,
        notes: values.notes,
      });

      if (!parsedFixedExpense.success) {
        setError(
          parsedFixedExpense.error.issues[0]?.message ??
            "Revisa los datos del formulario",
        );
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmitRecurringExpense?.(parsedFixedExpense.data);

        if (!initialValues) {
          setValues(getInitialValues(defaultType));
          setAmountInput("");
          setInstallmentsCountInput("1");
          setInstallmentAmountInput("");
          setIsFixedExpense(false);
          setAutoRegister(false);
          setFrequency("monthly");
          setStartDate(getTodayDateValue());
          setDayOfMonth(getDayFromDateValue(getTodayDateValue()));
        }
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "No pudimos guardar el gasto fijo",
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const parsed = transactionSchema.safeParse({
      ...values,
      amount,
      installmentsCount: showCreditInstallments ? installmentsCount : null,
      installmentAmount: showCreditInstallments ? installmentAmount : null,
      creditAlreadyStarted: showCreditInstallments ? creditAlreadyStarted : false,
      installmentsPaid:
        showCreditInstallments && creditAlreadyStarted && hasPrepaidInstallments
          ? installmentsPaid
          : 0,
      installmentFrequency: showCreditInstallments ? installmentFrequency : null,
      paidFromSavings: shouldPersistSavings ? paidFromSavings : false,
      savingsGoalId: shouldPersistSavings && paidFromSavings ? savingsGoalId : null,
      includes4x1000:
        shouldPersistSavings && paidFromSavings ? includes4x1000 : false,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario");
      return;
    }

    if (showCreditInstallments && calculatedTotal <= 0) {
      setError("Ingresa el número de cuotas y el valor de cada cuota");
      return;
    }

    if (
      showCreditInstallments &&
      creditAlreadyStarted &&
      installmentsPaid >= installmentsCount
    ) {
      setError("Las cuotas pagadas deben ser menores al total de cuotas");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(parsed.data);

      if (!initialValues) {
        setValues(getInitialValues(defaultType));
        setAmountInput("");
        setInstallmentsCountInput("1");
        setInstallmentAmountInput("");
        setCreditAlreadyStarted(false);
        setHasPrepaidInstallments(false);
        setInstallmentsPaidInput("0");
        setInstallmentFrequency("monthly");
        setPaidFromSavings(false);
        setSavingsGoalId(null);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos guardar el movimiento",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 brand-segment rounded-xl p-1">
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            values.type === "income"
              ? "bg-[#ecfdf5] text-success shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Ingreso
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            values.type === "expense"
              ? "bg-[#fef2f2] text-destructive shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Gasto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="transaction-title" className="mb-2 block text-sm font-medium">
            Descripción
          </label>
          <input
            id="transaction-title"
            type="text"
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({ ...current, title: event.target.value }))
            }
            placeholder={
              values.type === "income"
                ? "Ej. Salario mensual"
                : "Ej. Compra en supermercado"
            }
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        {values.type === "expense" ? (
          <div className="sm:col-span-2">
            <label
              htmlFor="transaction-merchant"
              className="mb-2 block text-sm font-medium"
            >
              Empresa (opcional)
            </label>
            <Select
              id="transaction-merchant"
              value={values.merchantId ?? ""}
              onChange={(event) => handleMerchantChange(event.target.value)}
              placeholder="Sin empresa registrada"
              searchPlaceholder="Buscar empresa..."
            >
              <option value="">Sin empresa registrada</option>
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="transaction-category"
            className="mb-2 block text-sm font-medium"
          >
            Categoría
          </label>
          <Select
            id="transaction-category"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value as TransactionInput["category"],
              }))
            }
            searchPlaceholder="Buscar categoría..."
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="transaction-method" className="mb-2 block text-sm font-medium">
            Método de pago
          </label>
          <Select
            id="transaction-method"
            value={values.method}
            onChange={(event) => {
              const method = event.target.value as TransactionInput["method"];
              setValues((current) => ({ ...current, method }));
              if (method !== "Tarjeta crédito") {
                setInstallmentsCountInput("1");
                setInstallmentAmountInput("");
                setCreditAlreadyStarted(false);
                setHasPrepaidInstallments(false);
                setInstallmentsPaidInput("0");
                setInstallmentFrequency("monthly");
              }
            }}
            searchPlaceholder="Buscar método..."
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
        </div>

        {showCreditInstallments ? (
          <>
            <div>
              <label
                htmlFor="transaction-installments"
                className="mb-2 block text-sm font-medium"
              >
                Total de cuotas
              </label>
              <input
                id="transaction-installments"
                type="number"
                min={1}
                max={60}
                value={installmentsCountInput}
                onChange={(event) => setInstallmentsCountInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="transaction-installment-amount"
                className="mb-2 block text-sm font-medium"
              >
                Valor de la cuota
              </label>
              <input
                id="transaction-installment-amount"
                type="text"
                inputMode="numeric"
                value={installmentAmountInput}
                onChange={(event) =>
                  setInstallmentAmountInput(formatAmountInput(event.target.value))
                }
                placeholder="0"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm tabular-nums outline-none ring-ring focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="transaction-installment-frequency"
                className="mb-2 block text-sm font-medium"
              >
                Frecuencia de cuota
              </label>
              <Select
                id="transaction-installment-frequency"
                value={installmentFrequency}
                onChange={(event) =>
                  setInstallmentFrequency(
                    event.target.value as NonNullable<
                      TransactionInput["installmentFrequency"]
                    >,
                  )
                }
                searchable={false}
              >
                {installmentFrequencies.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-2">
              <FormToggle
                label="Primera cuota el mismo mes de la compra"
                description="Usa el día de la compra como fecha de pago (por ejemplo, compra el 2 → pagas el 2 de cada mes)."
                checked={creditAlreadyStarted}
                onChange={(checked) => {
                  setCreditAlreadyStarted(checked);
                  if (!checked) {
                    setHasPrepaidInstallments(false);
                    setInstallmentsPaidInput("0");
                  }
                }}
                ariaLabel="Primera cuota el mismo mes de la compra"
              />
            </div>

            {creditAlreadyStarted ? (
              <div className="sm:col-span-2">
                <FormToggle
                  label="¿Ya pagaste cuotas antes de registrar?"
                  description="Solo actívalo si llevabas cuotas pagadas fuera de la app. Si es un crédito nuevo, déjalo apagado."
                  checked={hasPrepaidInstallments}
                  onChange={(checked) => {
                    setHasPrepaidInstallments(checked);
                    if (!checked) {
                      setInstallmentsPaidInput("0");
                    }
                  }}
                  ariaLabel="Cuotas pagadas antes de registrar"
                />
              </div>
            ) : null}

            {creditAlreadyStarted && hasPrepaidInstallments ? (
              <div>
                <label
                  htmlFor="transaction-installments-paid"
                  className="mb-2 block text-sm font-medium"
                >
                  Cuotas ya pagadas
                </label>
                <input
                  id="transaction-installments-paid"
                  type="number"
                  min={0}
                  max={Math.max(installmentsCount - 1, 0)}
                  value={installmentsPaidInput}
                  onChange={(event) => setInstallmentsPaidInput(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
                />
              </div>
            ) : null}

            <div className="sm:col-span-2 rounded-xl border border-secondary bg-secondary/40 px-4 py-3">
              <p className="text-sm font-semibold brand-text">Compra a crédito</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {installmentsCountInput || "0"} cuota
                {Number(installmentsCountInput) === 1 ? "" : "s"}{" "}
                {installmentFrequencies.find((item) => item.value === installmentFrequency)
                  ?.label.toLowerCase() ?? "mensual"}{" "}
                ×{" "}
                {installmentAmountInput
                  ? formatCurrency(installmentAmount)
                  : formatCurrency(0)}
              </p>
              {creditAlreadyStarted && hasPrepaidInstallments ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Pagadas: {installmentsPaidInput || "0"} · Restantes:{" "}
                  {remainingInstallments}
                </p>
              ) : null}
              {previewNextPayment ? (
                <p className="mt-1 text-sm font-medium text-accent">
                  Próxima cuota ({previewNextPayment.number}/{installmentsCount}):{" "}
                  {formatAppDate(previewNextPayment.date)}
                </p>
              ) : null}
              <p className="mt-2 text-lg font-bold text-foreground">
                Total: {formatCurrency(calculatedTotal)}
              </p>
            </div>

            {paymentPlanPreview.length > 0 ? (
              <div className="sm:col-span-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-4">
                <PaymentPlanPreviewTable
                  items={paymentPlanPreview}
                  description={
                    creditAlreadyStarted && hasPrepaidInstallments
                      ? "La fecha del movimiento corresponde a tu próxima cuota pendiente. Las anteriores se marcan como pagadas. Se confirmará al guardar."
                      : "Revisa el calendario antes de guardar. El plan se confirmará automáticamente al registrar el gasto."
                  }
                />
              </div>
            ) : null}
          </>
        ) : (
          <div>
            <label htmlFor="transaction-amount" className="mb-2 block text-sm font-medium">
              {canConfigureFixedExpense && isFixedExpense
                ? "Presupuesto mensual"
                : "Monto"}
            </label>
            <input
              id="transaction-amount"
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(event) => handleAmountChange(event.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm tabular-nums outline-none ring-ring focus:ring-2"
            />
          </div>
        )}

        {canConfigureRecurring ? (
          <div className="sm:col-span-2">
            <FormToggle
              label="Ingreso recurrente"
              description="Se registrará automáticamente según la frecuencia elegida."
              checked={isRecurring}
              onChange={(checked) => {
                setIsRecurring(checked);
                if (checked) setIsFixedExpense(false);
              }}
              ariaLabel="Ingreso recurrente"
            />
          </div>
        ) : null}

        {canConfigureFixedExpense ? (
          <div className="sm:col-span-2">
            <FormToggle
              label="Gasto fijo mensual"
              description="Define un presupuesto para gasolina, servicios, arriendo u otros gastos recurrentes."
              checked={isFixedExpense}
              onChange={(checked) => {
                setIsFixedExpense(checked);
                if (checked) setIsRecurring(false);
              }}
              ariaLabel="Gasto fijo mensual"
            />
          </div>
        ) : null}

        {canConfigureFixedExpense && isFixedExpense ? (
          <div className="sm:col-span-2">
            <FormToggle
              label="Registrar automáticamente"
              description="Crea el gasto solo cada mes (ideal para servicios con valor fijo)."
              checked={autoRegister}
              onChange={setAutoRegister}
              ariaLabel="Registrar automáticamente"
            />
          </div>
        ) : null}

        {showRecurringFields ? (
          <>
            <div>
              <label
                htmlFor="transaction-frequency"
                className="mb-2 block text-sm font-medium"
              >
                Frecuencia
              </label>
              <Select
                id="transaction-frequency"
                value={frequency}
                onChange={(event) =>
                  setFrequency(
                    event.target.value as RecurringIncomeInput["frequency"],
                  )
                }
                searchPlaceholder="Buscar frecuencia..."
              >
                {recurringFrequencies.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label
                htmlFor="transaction-start-date"
                className="mb-2 block text-sm font-medium"
              >
                Fecha de inicio
              </label>
              <input
                id="transaction-start-date"
                type="date"
                value={startDate}
                onChange={(event) => {
                  const nextDate = event.target.value;
                  setStartDate(nextDate);
                  setDayOfMonth(getDayFromDateValue(nextDate));
                }}
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
              />
            </div>

            {showDayOfMonth ? (
              <div>
                <label
                  htmlFor="transaction-day-of-month"
                  className="mb-2 block text-sm font-medium"
                >
                  Día del mes
                </label>
                <input
                  id="transaction-day-of-month"
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(event) =>
                    setDayOfMonth(Number(event.target.value))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
                />
              </div>
            ) : null}
          </>
        ) : (
          <div>
            <label htmlFor="transaction-date" className="mb-2 block text-sm font-medium">
              Fecha y hora
            </label>
            <input
              id="transaction-date"
              type="datetime-local"
              value={values.occurredAt}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  occurredAt: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="transaction-notes" className="mb-2 block text-sm font-medium">
            Notas (opcional)
          </label>
          <textarea
            id="transaction-notes"
            value={values.notes ?? ""}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                notes: event.target.value || null,
              }))
            }
            rows={3}
            placeholder="Detalle adicional del movimiento..."
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
          />
        </div>

        {showSavingsPayment ? (
          <div className="sm:col-span-2 space-y-3 rounded-xl border border-secondary bg-secondary/30 px-4 py-4">
            <FormToggle
              label="Pagar con ahorros"
              description="El gasto se registra, pero no resta de tu balance del periodo."
              checked={paidFromSavings}
              onChange={(checked) => {
                setPaidFromSavings(checked);
                if (!checked) {
                  setSavingsGoalId(null);
                  setIncludes4x1000(false);
                } else if (!savingsGoalId && savingsGoals[0]) {
                  setSavingsGoalId(savingsGoals[0].id);
                }
              }}
              ariaLabel="Pagar con ahorros"
            />
            {paidFromSavings ? (
              <div>
                <label
                  htmlFor="transaction-savings-goal"
                  className="mb-2 block text-sm font-medium"
                >
                  Fondo de ahorro
                </label>
                <Select
                  id="transaction-savings-goal"
                  value={savingsGoalId ?? ""}
                  onChange={(event) =>
                    setSavingsGoalId(event.target.value || null)
                  }
                  searchable={false}
                >
                  <option value="">Selecciona un ahorro</option>
                  {savingsGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} · {formatCurrency(goal.currentBalance)} disponible
                      {goal.cardName ? ` · ${goal.cardName}` : ""}
                    </option>
                  ))}
                </Select>
                {selectedSavingsGoal ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Se descontará de tu ahorro en{" "}
                    {selectedSavingsGoal.cardName ?? "la tarjeta asociada"}.
                  </p>
                ) : null}
                <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                  <FormToggle
                    label="Aplica cobro 4x1000"
                    description="Gravamen de $4 por cada $1.000 movidos desde tu ahorro."
                    checked={includes4x1000}
                    onChange={setIncludes4x1000}
                    ariaLabel="Aplica cobro 4x1000"
                  />
                  {savingsBaseAmount > 0 ? (
                    <div className="rounded-xl border border-border bg-white/80 px-3 py-2 text-xs text-muted-foreground">
                      <p>
                        Gasto: {formatCurrency(savingsBaseAmount)}
                        {includes4x1000 ? (
                          <>
                            {" · "}
                            4x1000: {formatCurrency(savingsGmfAmount)}
                          </>
                        ) : null}
                      </p>
                      <p className="mt-1 font-medium text-foreground">
                        Total a descontar del ahorro:{" "}
                        {formatCurrency(savingsTotalWithdrawal)}
                      </p>
                      {selectedSavingsGoal &&
                      savingsTotalWithdrawal > selectedSavingsGoal.currentBalance ? (
                        <p className="mt-1 text-destructive">
                          Saldo insuficiente. Disponible:{" "}
                          {formatCurrency(selectedSavingsGoal.currentBalance)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          size="lg"
          className="min-w-[160px]"
          isLoading={isSubmitting}
          loadingLabel="Guardando..."
        >
          {canConfigureRecurring && isRecurring
            ? "Guardar ingreso recurrente"
            : canConfigureFixedExpense && isFixedExpense
              ? "Guardar gasto fijo"
              : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}

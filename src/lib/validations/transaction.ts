import { z } from "zod";
import {
  expenseCategories,
  incomeCategories,
  installmentFrequencies,
  paymentMethods,
} from "@/lib/transactions/constants";

const installmentFrequencyValues = installmentFrequencies.map(
  (item) => item.value,
) as [
  (typeof installmentFrequencies)[number]["value"],
  ...Array<(typeof installmentFrequencies)[number]["value"]>,
];

const categoryValues = [...incomeCategories, ...expenseCategories] as [
  string,
  ...string[],
];

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    title: z
      .string()
      .trim()
      .min(2, "La descripción debe tener al menos 2 caracteres")
      .max(120, "La descripción es demasiado larga"),
    merchantId: z.string().nullable().optional(),
    category: z.enum(categoryValues, {
      message: "Selecciona una categoría válida",
    }),
    method: z.enum(paymentMethods, {
      message: "Selecciona un método de pago válido",
    }),
    amount: z
      .number({ message: "Ingresa un monto válido" })
      .positive("El monto debe ser mayor a 0")
      .max(999_999_999, "El monto es demasiado alto"),
    occurredAt: z.string().min(1, "Selecciona la fecha del movimiento"),
    notes: z.string().trim().max(500).optional().nullable(),
    installmentsCount: z
      .number()
      .int("Las cuotas deben ser un número entero")
      .min(1, "Debe haber al menos 1 cuota")
      .max(60, "Máximo 60 cuotas")
      .nullable()
      .optional(),
    installmentAmount: z
      .number()
      .positive("El valor de la cuota debe ser mayor a 0")
      .max(999_999_999, "El valor de la cuota es demasiado alto")
      .nullable()
      .optional(),
    creditAlreadyStarted: z.boolean().optional(),
    installmentsPaid: z
      .number()
      .int("Las cuotas pagadas deben ser un número entero")
      .min(0, "Las cuotas pagadas no pueden ser negativas")
      .max(60, "Máximo 60 cuotas pagadas")
      .nullable()
      .optional(),
    installmentFrequency: z
      .enum(installmentFrequencyValues, {
        message: "Selecciona una frecuencia de cuota válida",
      })
      .nullable()
      .optional(),
    paidFromSavings: z.boolean().optional(),
    savingsGoalId: z.string().nullable().optional(),
    includes4x1000: z.boolean().optional(),
  })
  .superRefine((data, context) => {
    const allowedCategories =
      data.type === "income" ? incomeCategories : expenseCategories;

    if (!allowedCategories.includes(data.category as never)) {
      context.addIssue({
        code: "custom",
        message: "La categoría no corresponde al tipo de movimiento",
        path: ["category"],
      });
    }

    if (
      data.installmentsCount != null &&
      data.installmentAmount != null &&
      Math.abs(data.amount - data.installmentsCount * data.installmentAmount) > 0.01
    ) {
      context.addIssue({
        code: "custom",
        message: "El monto total debe coincidir con cuotas × valor de cuota",
        path: ["amount"],
      });
    }

    if (
      data.installmentsCount != null &&
      data.creditAlreadyStarted &&
      data.installmentsPaid != null &&
      data.installmentsPaid >= data.installmentsCount
    ) {
      context.addIssue({
        code: "custom",
        message: "Las cuotas pagadas deben ser menores al total de cuotas",
        path: ["installmentsPaid"],
      });
    }

    if (
      data.installmentsCount != null &&
      !data.creditAlreadyStarted &&
      data.installmentsPaid != null &&
      data.installmentsPaid > 0
    ) {
      context.addIssue({
        code: "custom",
        message: "Solo indica cuotas pagadas si el crédito ya empezó",
        path: ["installmentsPaid"],
      });
    }

    if (data.paidFromSavings && data.type !== "expense") {
      context.addIssue({
        code: "custom",
        message: "Solo los gastos pueden pagarse con ahorros",
        path: ["paidFromSavings"],
      });
    }

    if (data.paidFromSavings && !data.savingsGoalId) {
      context.addIssue({
        code: "custom",
        message: "Selecciona de qué ahorro proviene el pago",
        path: ["savingsGoalId"],
      });
    }

    if (!data.paidFromSavings && data.savingsGoalId) {
      context.addIssue({
        code: "custom",
        message: "Activa pagar con ahorros para seleccionar un fondo",
        path: ["savingsGoalId"],
      });
    }

    if (data.includes4x1000 && !data.paidFromSavings) {
      context.addIssue({
        code: "custom",
        message: "El cobro 4x1000 solo aplica al pagar con ahorros",
        path: ["includes4x1000"],
      });
    }
  });

export type TransactionInput = z.infer<typeof transactionSchema>;

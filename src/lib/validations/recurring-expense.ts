import { z } from "zod";
import {
  expenseCategories,
  paymentMethods,
} from "@/lib/transactions/constants";
import { recurringFrequencies } from "@/lib/recurring-incomes/constants";

const frequencyValues = recurringFrequencies.map((item) => item.value) as [
  (typeof recurringFrequencies)[number]["value"],
  ...Array<(typeof recurringFrequencies)[number]["value"]>,
];

export const recurringExpenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(120, "La descripción es demasiado larga"),
  category: z.enum(expenseCategories, {
    message: "Selecciona una categoría válida",
  }),
  method: z.enum(paymentMethods, {
    message: "Selecciona un método de pago válido",
  }),
  budgetAmount: z
    .number({ message: "Ingresa un presupuesto válido" })
    .positive("El presupuesto debe ser mayor a 0")
    .max(999_999_999, "El presupuesto es demasiado alto"),
  frequency: z.enum(frequencyValues, {
    message: "Selecciona una frecuencia válida",
  }),
  dayOfMonth: z
    .number()
    .int()
    .min(1, "El día debe estar entre 1 y 31")
    .max(31, "El día debe estar entre 1 y 31"),
  startDate: z.string().min(1, "Selecciona la fecha de inicio"),
  autoRegister: z.boolean().default(false),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;

export const recurringExpenseUpdateSchema = recurringExpenseSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export type RecurringExpenseUpdateInput = z.infer<
  typeof recurringExpenseUpdateSchema
>;

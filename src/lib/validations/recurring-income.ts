import { z } from "zod";
import {
  incomeCategories,
  paymentMethods,
} from "@/lib/transactions/constants";
import { recurringFrequencies } from "@/lib/recurring-incomes/constants";

const frequencyValues = recurringFrequencies.map((item) => item.value) as [
  (typeof recurringFrequencies)[number]["value"],
  ...Array<(typeof recurringFrequencies)[number]["value"]>,
];

export const recurringIncomeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(120, "La descripción es demasiado larga"),
  category: z.enum(incomeCategories, {
    message: "Selecciona una categoría válida",
  }),
  method: z.enum(paymentMethods, {
    message: "Selecciona un método de pago válido",
  }),
  amount: z
    .number({ message: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0")
    .max(999_999_999, "El monto es demasiado alto"),
  frequency: z.enum(frequencyValues, {
    message: "Selecciona una frecuencia válida",
  }),
  dayOfMonth: z
    .number()
    .int()
    .min(1, "El día debe estar entre 1 y 31")
    .max(31, "El día debe estar entre 1 y 31"),
  startDate: z.string().min(1, "Selecciona la fecha de inicio"),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type RecurringIncomeInput = z.infer<typeof recurringIncomeSchema>;

export const recurringIncomeUpdateSchema = recurringIncomeSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export type RecurringIncomeUpdateInput = z.infer<
  typeof recurringIncomeUpdateSchema
>;

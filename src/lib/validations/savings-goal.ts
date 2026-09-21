import { z } from "zod";

export const savingsGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo"),
  cardId: z.string().nullable().optional(),
  targetAmount: z
    .number()
    .positive("La meta debe ser mayor a 0")
    .max(999_999_999, "La meta es demasiado alta")
    .nullable()
    .optional(),
  targetMonths: z
    .number({ message: "Ingresa un número de meses válido" })
    .int("Los meses deben ser un número entero")
    .min(1, "Debe ser al menos 1 mes")
    .max(600, "El plazo es demasiado largo")
    .nullable()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Selecciona un color válido")
    .default("#7c3aed"),
  notes: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  initialBalance: z
    .number({ message: "Ingresa un saldo válido" })
    .min(0, "El saldo no puede ser negativo")
    .max(999_999_999, "El saldo es demasiado alto")
    .optional(),
  currentBalance: z
    .number({ message: "Ingresa un saldo válido" })
    .min(0, "El saldo no puede ser negativo")
    .max(999_999_999, "El saldo es demasiado alto")
    .optional(),
}).superRefine((data, context) => {
  if (data.targetMonths != null && !data.targetAmount) {
    context.addIssue({
      code: "custom",
      message: "Indica el monto de la meta para definir un plazo en meses",
      path: ["targetAmount"],
    });
  }
});

export const savingsDepositSchema = z.object({
  amount: z
    .number({ message: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0")
    .max(999_999_999, "El monto es demasiado alto"),
  occurredAt: z.string().min(1, "Selecciona la fecha"),
  notes: z.string().trim().max(500).nullable().optional(),
});

export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type SavingsDepositInput = z.infer<typeof savingsDepositSchema>;

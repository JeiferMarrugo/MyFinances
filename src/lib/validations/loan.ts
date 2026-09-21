import { z } from "zod";

export const loanPersonSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre de la persona"),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type LoanPersonInput = z.infer<typeof loanPersonSchema>;

export const createLoanSchema = z
  .object({
    borrowerId: z.string().min(1, "Selecciona una persona"),
    principalAmount: z.number().positive("El monto debe ser mayor a cero"),
    hasInterest: z.boolean(),
    interestAmount: z.number().min(0).optional(),
    expectedDueDate: z.string().optional().nullable(),
    fundedFrom: z.enum(["cash", "savings"]),
    savingsGoalId: z.string().optional().nullable(),
    lentAt: z.string().min(1, "Ingresa la fecha del préstamo"),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.hasInterest && (data.interestAmount ?? 0) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa el monto del interés",
        path: ["interestAmount"],
      });
    }

    if (data.fundedFrom === "savings" && !data.savingsGoalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona el ahorro de origen",
        path: ["savingsGoalId"],
      });
    }
  });

export type CreateLoanInput = z.infer<typeof createLoanSchema>;

export const repayLoanSchema = z
  .object({
    repaidAmount: z.number().positive("El monto recibido debe ser mayor a cero"),
    repaidAt: z.string().min(1, "Ingresa la fecha de cobro"),
    repaymentDestination: z.enum(["cash", "savings"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.repaymentDestination) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica dónde quedará el dinero recibido",
        path: ["repaymentDestination"],
      });
    }
  });

export type RepayLoanInput = z.infer<typeof repayLoanSchema>;

export const updateLoanSchema = z.object({
  expectedDueDate: z.string().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

import { z } from "zod";

const dayOfMonthSchema = z
  .number()
  .int("Debe ser un número entero")
  .min(1, "El día mínimo es 1")
  .max(31, "El día máximo es 31");

const monthSchema = z
  .number()
  .int("Debe ser un número entero")
  .min(1, "El mes mínimo es 1")
  .max(12, "El mes máximo es 12");

export const financeSettingsSchema = z
  .object({
    biweeklyFirstStartDay: dayOfMonthSchema,
    biweeklyFirstEndDay: dayOfMonthSchema,
    biweeklySecondStartDay: dayOfMonthSchema,
    biweeklySecondEndDay: dayOfMonthSchema.nullable(),
    monthStartDay: dayOfMonthSchema.max(28, "Usa máximo día 28 para evitar meses cortos"),
    quarterStartMonth: monthSchema,
    yearStartMonth: monthSchema,
    yearStartDay: dayOfMonthSchema,
    installmentDueOffset: z
      .number()
      .int()
      .min(0, "El desfase mínimo es 0")
      .max(3, "El desfase máximo es 3"),
  })
  .superRefine((data, ctx) => {
    if (data.biweeklyFirstStartDay > data.biweeklyFirstEndDay) {
      ctx.addIssue({
        code: "custom",
        message: "La quincena 1 debe tener inicio antes del fin",
        path: ["biweeklyFirstEndDay"],
      });
    }

    if (data.biweeklySecondStartDay <= data.biweeklyFirstEndDay) {
      ctx.addIssue({
        code: "custom",
        message: "La quincena 2 debe empezar después de la quincena 1",
        path: ["biweeklySecondStartDay"],
      });
    }

    if (
      data.biweeklySecondEndDay != null &&
      data.biweeklySecondEndDay < data.biweeklySecondStartDay
    ) {
      ctx.addIssue({
        code: "custom",
        message: "El fin de la quincena 2 no puede ser anterior al inicio",
        path: ["biweeklySecondEndDay"],
      });
    }
  });

export type FinanceSettingsInput = z.infer<typeof financeSettingsSchema>;

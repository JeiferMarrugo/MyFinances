import { z } from "zod";
import { expenseCategories } from "@/lib/transactions/constants";

export const serviceTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo"),
  category: z.enum(expenseCategories, {
    message: "Selecciona una categoría válida",
  }),
  description: z.string().trim().max(200).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Selecciona un color válido"),
});

export type ServiceTypeInput = z.infer<typeof serviceTypeSchema>;

export const serviceTypeUpdateSchema = serviceTypeSchema.partial();

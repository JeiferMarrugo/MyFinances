import { z } from "zod";

const logoSchema = z
  .string()
  .max(1_400_000, "La imagen es demasiado grande (máx. 1 MB)")
  .optional()
  .nullable();

export const bankSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo"),
  logoUrl: logoSchema,
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Selecciona un color válido"),
});

export type BankInput = z.infer<typeof bankSchema>;

export const bankUpdateSchema = bankSchema.partial();

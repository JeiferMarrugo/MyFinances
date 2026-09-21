import { z } from "zod";

const logoSchema = z
  .string()
  .max(1_400_000, "La imagen es demasiado grande (máx. 1 MB)")
  .optional()
  .nullable();

export const merchantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo"),
  logoUrl: logoSchema,
  allowsCredit: z.boolean(),
});

export type MerchantInput = z.infer<typeof merchantSchema>;

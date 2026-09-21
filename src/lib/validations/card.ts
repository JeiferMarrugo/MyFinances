import { z } from "zod";
import { cardTypes } from "@/lib/cards/constants";

const cardTypeValues = cardTypes.map((item) => item.value) as [
  (typeof cardTypes)[number]["value"],
  ...Array<(typeof cardTypes)[number]["value"]>,
];

export const cardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo"),
  bankId: z.string().trim().optional().nullable(),
  cardType: z.enum(cardTypeValues, {
    message: "Selecciona un tipo de tarjeta",
  }),
  lastFourDigits: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z
      .string()
      .regex(/^\d{4}$/, "Ingresa los 4 últimos dígitos")
      .nullable()
      .optional(),
  ),
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Selecciona un color válido")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

export type CardInput = z.infer<typeof cardSchema>;

export const cardUpdateSchema = cardSchema.partial();

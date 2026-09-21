export const incomeCategories = [
  "Ingreso",
  "Ingreso extra",
  "Seguro / Pensión",
  "Freelance",
  "Otros ingresos",
] as const;

export const expenseCategories = [
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Suscripciones",
  "Ocio",
  "Salud",
  "Otros",
] as const;

export const paymentMethods = [
  "Transferencia",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Efectivo",
] as const;

export const installmentFrequencies = [
  { value: "monthly", label: "Mensual" },
  { value: "biweekly", label: "Quincenal" },
] as const;

export type InstallmentFrequency =
  (typeof installmentFrequencies)[number]["value"];

export const installmentFrequencyLabels = Object.fromEntries(
  installmentFrequencies.map((item) => [item.value, item.label]),
) as Record<InstallmentFrequency, string>;

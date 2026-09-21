export const cardTypes = [
  { value: "credit", label: "Crédito" },
  { value: "debit", label: "Débito" },
] as const;

export type CardType = (typeof cardTypes)[number]["value"];

export const cardTypeLabels = Object.fromEntries(
  cardTypes.map((item) => [item.value, item.label]),
) as Record<CardType, string>;

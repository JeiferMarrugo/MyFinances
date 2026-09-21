export const recurringFrequencies = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
] as const;

export type RecurringFrequency =
  (typeof recurringFrequencies)[number]["value"];

export const recurringFrequencyLabels = Object.fromEntries(
  recurringFrequencies.map((item) => [item.value, item.label]),
) as Record<RecurringFrequency, string>;

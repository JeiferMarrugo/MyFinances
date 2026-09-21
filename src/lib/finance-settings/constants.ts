export const defaultFinanceSettings = {
  biweeklyFirstStartDay: 1,
  biweeklyFirstEndDay: 15,
  biweeklySecondStartDay: 16,
  biweeklySecondEndDay: null as number | null,
  monthStartDay: 1,
  quarterStartMonth: 1,
  yearStartMonth: 1,
  yearStartDay: 1,
  installmentDueOffset: 1,
} as const;

export const quarterStartMonthOptions = [
  { value: 1, label: "Enero (Ene–Mar, Abr–Jun, Jul–Sep, Oct–Dic)" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
] as const;

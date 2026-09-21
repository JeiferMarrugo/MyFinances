export type FinanceSettingsRecord = {
  userId: string;
  biweeklyFirstStartDay: number;
  biweeklyFirstEndDay: number;
  biweeklySecondStartDay: number;
  biweeklySecondEndDay: number | null;
  monthStartDay: number;
  quarterStartMonth: number;
  yearStartMonth: number;
  yearStartDay: number;
  installmentDueOffset: number;
  createdAt: Date;
  updatedAt: Date;
};

export type FinanceSettingsInput = Omit<
  FinanceSettingsRecord,
  "userId" | "createdAt" | "updatedAt"
>;

export type PeriodRange = {
  start: Date;
  end: Date;
  label: string;
};

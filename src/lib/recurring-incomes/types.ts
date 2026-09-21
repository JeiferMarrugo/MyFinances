import type { RecurringFrequency } from "@/lib/recurring-incomes/constants";

export type RecurringIncomeRecord = {
  id: string;
  userId: string;
  title: string;
  category: string;
  method: string;
  amount: number;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  startDate: Date;
  nextRunAt: Date;
  lastRunAt: Date | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializedRecurringIncome = Omit<
  RecurringIncomeRecord,
  "startDate" | "nextRunAt" | "lastRunAt" | "createdAt" | "updatedAt"
> & {
  startDate: string;
  nextRunAt: string;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
};

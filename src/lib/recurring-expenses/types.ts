import type { RecurringFrequency } from "@/lib/recurring-incomes/constants";

export type RecurringExpenseRecord = {
  id: string;
  userId: string;
  title: string;
  category: string;
  method: string;
  budgetAmount: number;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  startDate: Date;
  nextRunAt: Date;
  lastRunAt: Date | null;
  autoRegister: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RecurringExpenseWithSpending = RecurringExpenseRecord & {
  spentThisMonth: number;
  progressPercent: number;
};

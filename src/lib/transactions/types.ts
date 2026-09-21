export type TransactionType = "income" | "expense";

export type TransactionRecord = {
  id: string;
  userId: string;
  merchantId: string | null;
  type: TransactionType;
  title: string;
  category: string;
  method: string;
  amount: number;
  installmentsCount: number | null;
  installmentAmount: number | null;
  creditAlreadyStarted: boolean;
  installmentsPaid: number;
  installmentFrequency: string | null;
  savingsGoalId: string | null;
  paidFromSavings: boolean;
  includes4x1000: boolean;
  gmfAmount: number;
  occurredAt: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializedTransaction = Omit<
  TransactionRecord,
  "occurredAt" | "createdAt" | "updatedAt"
> & {
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DisplayTransaction = {
  id: string;
  merchant: string;
  category: string;
  method: string;
  date: string;
  amount: number;
  type: TransactionType;
  status: "completed" | "pending";
  merchantId: string | null;
  installmentsCount: number | null;
  installmentAmount: number | null;
  creditAlreadyStarted: boolean;
  installmentsPaid: number;
  installmentFrequency: string | null;
  notes: string | null;
  paidFromSavings: boolean;
  savingsGoalId: string | null;
  includes4x1000: boolean;
  gmfAmount: number;
  canPayInstallment?: boolean;
  nextInstallmentDueDate?: string | null;
  nextInstallmentNumber?: number | null;
  pendingInstallments?: number;
  savingsGoalName?: string | null;
  paymentPlanConfirmed?: boolean;
  hasPaymentPlan?: boolean;
};

export type MonthlySummary = {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cashExpenses: number;
  creditDueThisMonth: number;
  expensesFromSavings: number;
  savingsContributions: number;
  savingsWithdrawals: number;
  savingsNetChange: number;
  totalSavingsBalance: number;
  savingsCapacity: number;
  savingsRate: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  periodLabel: string;
};

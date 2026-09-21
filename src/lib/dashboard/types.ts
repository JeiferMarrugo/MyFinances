export type MonthlyTrend = {
  labels: string[];
  income: number[];
  expenses: number[];
};

export type CategorySpending = {
  name: string;
  spent: number;
  share: number;
  color: string;
  limit?: number | null;
};

export type PaymentMethodBreakdown = {
  id: string;
  name: string;
  amount: number;
  income: number;
  expenses: number;
  subtitle: string;
  gradient: string;
};

export type SavingsPeriodExpense = {
  id: string;
  title: string;
  category: string;
  occurredAt: string;
  amount: number;
  gmfAmount: number;
  savingsGoalName: string | null;
};

export type SavingsOverview = {
  title: string;
  current: number;
  target: number;
  remaining: number;
  expenses: number;
  periodContributions: number;
  totalSavings: number;
  activeGoals: number;
  progress: number;
  periodExpenses: SavingsPeriodExpense[];
};

export type BalanceTrend = {
  balance: number;
  trendPercent: number | null;
  periodLabel: string;
};

export type DashboardStats = {
  summary: import("@/lib/transactions/types").MonthlySummary;
  monthlyTrend: MonthlyTrend;
  categorySpending: CategorySpending[];
  paymentMethods: PaymentMethodBreakdown[];
  savingsOverview: SavingsOverview;
  balanceTrend: BalanceTrend;
  pendingPayments: import("@/lib/transactions/pending-payments").PendingPaymentsOverview;
};

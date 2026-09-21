import type { CategorySpending, MonthlyTrend, PaymentMethodBreakdown } from "@/lib/dashboard/types";

export type ReportPeriod = "month" | "quarter" | "year";

export type ReportSummary = {
  income: number;
  expenses: number;
  balance: number;
  creditInstallmentsPaid: number;
  pendingCreditAmount: number;
};

export type ReportComparisonSlice = {
  label: string;
  income: number;
  expenses: number;
  balance: number;
};

export type ReportComparison = {
  previous: ReportComparisonSlice;
  yearAgo: ReportComparisonSlice | null;
  incomeChangePercent: number | null;
  expenseChangePercent: number | null;
};

export type MerchantSpending = {
  name: string;
  amount: number;
  share: number;
  transactions: number;
};

export type FixedVariableSpending = {
  fixed: number;
  variable: number;
  fixedShare: number;
};

export type CreditReportItem = {
  transactionId: string;
  title: string;
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  installmentAmount: number;
  totalPendingAmount: number;
  nextPaymentDate: string | null;
  nextPaymentAmount: number | null;
};

export type RecurringIncomeReportItem = {
  id: string;
  title: string;
  amount: number;
  frequency: string;
  isActive: boolean;
  receivedInPeriod: number;
};

export type SavingsReport = {
  totalBalance: number;
  activeGoals: number;
  periodDeposits: number;
  periodWithdrawals: number;
  goals: Array<{
    name: string;
    currentBalance: number;
    targetAmount: number | null;
    progressPercent: number | null;
  }>;
};

export type ProjectionMonth = {
  label: string;
  monthKey: string;
  amount: number;
  installmentCount: number;
};

export type ReportAlert = {
  id: string;
  tone: "info" | "warning" | "success";
  title: string;
  description: string;
};

export type ReportExportRow = {
  date: string;
  type: string;
  title: string;
  category: string;
  method: string;
  amount: number;
};

export type ReportsData = {
  periodType: ReportPeriod;
  periodLabel: string;
  periodRangeLabel: string;
  periodStart: string;
  periodEnd: string;
  summary: ReportSummary;
  comparison: ReportComparison;
  monthlyTrend: MonthlyTrend;
  categories: CategorySpending[];
  merchants: MerchantSpending[];
  fixedVariable: FixedVariableSpending;
  credits: CreditReportItem[];
  paymentMethods: PaymentMethodBreakdown[];
  savings: SavingsReport;
  recurringIncomes: RecurringIncomeReportItem[];
  projection: ProjectionMonth[];
  alerts: ReportAlert[];
  exportRows: ReportExportRow[];
};

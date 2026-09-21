export type LoanFundSource = "cash" | "savings";
export type LoanStatus = "outstanding" | "repaid" | "cancelled";
export type LoanRepaymentDestination = "cash" | "savings";

export type LoanPersonRecord = {
  id: string;
  userId: string;
  name: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LoanRecord = {
  id: string;
  userId: string;
  borrowerId: string;
  principalAmount: number;
  interestAmount: number;
  expectedDueDate: Date | null;
  fundedFrom: LoanFundSource;
  savingsGoalId: string | null;
  status: LoanStatus;
  lentAt: Date;
  repaidAt: Date | null;
  repaymentDestination: LoanRepaymentDestination | null;
  repaidAmount: number | null;
  notes: string | null;
  disbursementTransactionId: string | null;
  repaymentTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LoanWithDetails = LoanRecord & {
  borrowerName: string;
  savingsGoalName: string | null;
  expectedTotal: number;
};

export type LoansOverview = {
  outstandingCount: number;
  outstandingTotal: number;
  repaidCount: number;
};

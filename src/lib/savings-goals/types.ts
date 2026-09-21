export type SavingsMovementType = "deposit" | "withdrawal";

export type SavingsGoalRecord = {
  id: string;
  userId: string;
  cardId: string | null;
  name: string;
  targetAmount: number | null;
  targetMonths: number | null;
  color: string;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SavingsGoalWithBalance = SavingsGoalRecord & {
  currentBalance: number;
  cardName: string | null;
  bankName: string | null;
  progressPercent: number | null;
};

export type SavingsMovementRecord = {
  id: string;
  userId: string;
  savingsGoalId: string;
  type: SavingsMovementType;
  amount: number;
  occurredAt: Date;
  transactionId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SavingsOverviewStats = {
  totalBalance: number;
  activeGoals: number;
  goals: SavingsGoalWithBalance[];
};

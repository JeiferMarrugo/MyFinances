import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { bank, card, savingsGoal, savingsMovement, transaction } from "@/db/schema";
import type {
  SavingsGoalRecord,
  SavingsGoalWithBalance,
  SavingsMovementRecord,
  SavingsMovementType,
  SavingsOverviewStats,
} from "@/lib/savings-goals/types";

function mapSavingsGoalRow(
  row: typeof savingsGoal.$inferSelect,
): SavingsGoalRecord {
  return row;
}

function mapSavingsMovementRow(
  row: typeof savingsMovement.$inferSelect,
): SavingsMovementRecord {
  return {
    ...row,
    type: row.type as SavingsMovementType,
  };
}

export async function getSavingsGoalsByUserId(userId: string) {
  const rows = await db
    .select({
      goal: savingsGoal,
      cardName: card.name,
      bankName: bank.name,
    })
    .from(savingsGoal)
    .leftJoin(card, eq(savingsGoal.cardId, card.id))
    .leftJoin(bank, eq(card.bankId, bank.id))
    .where(eq(savingsGoal.userId, userId))
    .orderBy(asc(savingsGoal.name));

  const balances = await getBalancesByGoalIds(rows.map((row) => row.goal.id));

  return rows.map(({ goal, cardName, bankName }) => {
    const currentBalance = balances.get(goal.id) ?? 0;
    const progressPercent =
      goal.targetAmount != null && goal.targetAmount > 0
        ? Math.min(Math.round((currentBalance / goal.targetAmount) * 100), 999)
        : null;

    return {
      ...mapSavingsGoalRow(goal),
      currentBalance,
      cardName,
      bankName,
      progressPercent,
    } satisfies SavingsGoalWithBalance;
  });
}

async function getBalancesByGoalIds(goalIds: string[]) {
  const balances = new Map<string, number>();
  if (goalIds.length === 0) return balances;

  const rows = await db
    .select({
      savingsGoalId: savingsMovement.savingsGoalId,
      balance: sql<number>`coalesce(sum(case when ${savingsMovement.type} = 'deposit' then ${savingsMovement.amount} else -${savingsMovement.amount} end), 0)`,
    })
    .from(savingsMovement)
    .where(inArray(savingsMovement.savingsGoalId, goalIds))
    .groupBy(savingsMovement.savingsGoalId);

  for (const row of rows) {
    balances.set(row.savingsGoalId, row.balance);
  }

  return balances;
}

export async function getSavingsGoalById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(savingsGoal)
    .where(and(eq(savingsGoal.id, id), eq(savingsGoal.userId, userId)))
    .limit(1);

  return row ? mapSavingsGoalRow(row) : null;
}

export async function getSavingsGoalBalance(savingsGoalId: string) {
  const [row] = await db
    .select({
      balance: sql<number>`coalesce(sum(case when ${savingsMovement.type} = 'deposit' then ${savingsMovement.amount} else -${savingsMovement.amount} end), 0)`,
    })
    .from(savingsMovement)
    .where(eq(savingsMovement.savingsGoalId, savingsGoalId));

  return row?.balance ?? 0;
}

export async function getSavingsOverview(userId: string): Promise<SavingsOverviewStats> {
  const goals = await getSavingsGoalsByUserId(userId);
  const activeGoals = goals.filter((goal) => goal.isActive);

  return {
    totalBalance: activeGoals.reduce((sum, goal) => sum + goal.currentBalance, 0),
    activeGoals: activeGoals.length,
    goals: activeGoals,
  };
}

export async function createSavingsMovement(input: {
  userId: string;
  savingsGoalId: string;
  type: SavingsMovementType;
  amount: number;
  occurredAt: Date;
  transactionId?: string | null;
  notes?: string | null;
}) {
  const [created] = await db
    .insert(savingsMovement)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      savingsGoalId: input.savingsGoalId,
      type: input.type,
      amount: input.amount,
      occurredAt: input.occurredAt,
      transactionId: input.transactionId ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  return mapSavingsMovementRow(created);
}

export async function getSavingsWithdrawalByTransactionId(transactionId: string) {
  const [row] = await db
    .select()
    .from(savingsMovement)
    .where(
      and(
        eq(savingsMovement.transactionId, transactionId),
        eq(savingsMovement.type, "withdrawal"),
      ),
    )
    .limit(1);

  return row ? mapSavingsMovementRow(row) : null;
}

export async function deleteSavingsMovementByTransactionId(transactionId: string) {
  await db
    .delete(savingsMovement)
    .where(eq(savingsMovement.transactionId, transactionId));
}

export async function getActiveSavingsGoalsForSelect(userId: string) {
  const goals = await getSavingsGoalsByUserId(userId);
  return goals.filter((goal) => goal.isActive && goal.currentBalance > 0);
}

const SYSTEM_DEPOSIT_NOTES = new Set(["Saldo inicial", "Ajuste manual de saldo"]);

export async function getSavingsPeriodActivity(
  userId: string,
  start: Date,
  end: Date,
) {
  const rows = await db
    .select({
      type: savingsMovement.type,
      amount: savingsMovement.amount,
      transactionId: savingsMovement.transactionId,
      notes: savingsMovement.notes,
      loanId: transaction.loanId,
    })
    .from(savingsMovement)
    .leftJoin(transaction, eq(savingsMovement.transactionId, transaction.id))
    .where(
      and(
        eq(savingsMovement.userId, userId),
        gte(savingsMovement.occurredAt, start),
        lte(savingsMovement.occurredAt, end),
      ),
    );

  let contributions = 0;
  let withdrawals = 0;
  let expenseWithdrawals = 0;

  for (const row of rows) {
    if (row.type === "deposit") {
      if (!row.notes || !SYSTEM_DEPOSIT_NOTES.has(row.notes)) {
        contributions += row.amount;
      }
      continue;
    }

    withdrawals += row.amount;

    if (row.transactionId && !row.loanId) {
      expenseWithdrawals += row.amount;
    }
  }

  return {
    contributions,
    withdrawals,
    expenseWithdrawals,
    netChange: contributions - withdrawals,
  };
}

export async function getSavingsExpensesForPeriod(
  userId: string,
  start: Date,
  end: Date,
) {
  const rows = await db
    .select({
      movementId: savingsMovement.id,
      amount: savingsMovement.amount,
      occurredAt: savingsMovement.occurredAt,
      title: transaction.title,
      category: transaction.category,
      gmfAmount: transaction.gmfAmount,
      goalName: savingsGoal.name,
    })
    .from(savingsMovement)
    .innerJoin(transaction, eq(savingsMovement.transactionId, transaction.id))
    .leftJoin(savingsGoal, eq(savingsMovement.savingsGoalId, savingsGoal.id))
    .where(
      and(
        eq(savingsMovement.userId, userId),
        eq(savingsMovement.type, "withdrawal"),
        gte(savingsMovement.occurredAt, start),
        lte(savingsMovement.occurredAt, end),
      ),
    )
    .orderBy(desc(savingsMovement.occurredAt));

  return rows.map((row) => ({
    id: row.movementId,
    title: row.title,
    category: row.category,
    occurredAt: row.occurredAt.toISOString(),
    amount: row.amount,
    gmfAmount: row.gmfAmount ?? 0,
    savingsGoalName: row.goalName,
  }));
}

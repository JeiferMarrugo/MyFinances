import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { loan, loanPerson, savingsGoal } from "@/db/schema";
import type {
  LoanPersonRecord,
  LoanWithDetails,
  LoansOverview,
} from "@/lib/loans/types";

function mapLoanPerson(row: typeof loanPerson.$inferSelect): LoanPersonRecord {
  return row;
}

export async function getLoanPersonsByUserId(userId: string) {
  const rows = await db
    .select()
    .from(loanPerson)
    .where(eq(loanPerson.userId, userId))
    .orderBy(asc(loanPerson.name));

  return rows.map(mapLoanPerson);
}

export async function getLoanPersonById(userId: string, personId: string) {
  const [row] = await db
    .select()
    .from(loanPerson)
    .where(eq(loanPerson.id, personId))
    .limit(1);

  if (!row || row.userId !== userId) {
    return null;
  }

  return mapLoanPerson(row);
}

export async function getLoansByUserId(userId: string): Promise<LoanWithDetails[]> {
  const rows = await db
    .select({
      loan,
      borrowerName: loanPerson.name,
      savingsGoalName: savingsGoal.name,
    })
    .from(loan)
    .innerJoin(loanPerson, eq(loan.borrowerId, loanPerson.id))
    .leftJoin(savingsGoal, eq(loan.savingsGoalId, savingsGoal.id))
    .where(eq(loan.userId, userId))
    .orderBy(desc(loan.lentAt));

  return rows.map(({ loan: record, borrowerName, savingsGoalName }) => ({
    ...record,
    fundedFrom: record.fundedFrom as LoanWithDetails["fundedFrom"],
    status: record.status as LoanWithDetails["status"],
    repaymentDestination:
      record.repaymentDestination as LoanWithDetails["repaymentDestination"],
    borrowerName,
    savingsGoalName,
    expectedTotal: record.principalAmount + record.interestAmount,
  }));
}

export async function getLoanById(userId: string, loanId: string) {
  const loans = await getLoansByUserId(userId);
  return loans.find((item) => item.id === loanId) ?? null;
}

export async function getLoansOverview(userId: string): Promise<LoansOverview> {
  const [row] = await db
    .select({
      outstandingCount: sql<number>`count(*) filter (where ${loan.status} = 'outstanding')`,
      outstandingTotal: sql<number>`coalesce(sum(case when ${loan.status} = 'outstanding' then ${loan.principalAmount} + ${loan.interestAmount} else 0 end), 0)`,
      repaidCount: sql<number>`count(*) filter (where ${loan.status} = 'repaid')`,
    })
    .from(loan)
    .where(eq(loan.userId, userId));

  return {
    outstandingCount: Number(row?.outstandingCount ?? 0),
    outstandingTotal: Number(row?.outstandingTotal ?? 0),
    repaidCount: Number(row?.repaidCount ?? 0),
  };
}

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { loan, transaction } from "@/db/schema";
import { getLoanById, getLoanPersonById } from "@/lib/loans/queries";
import type { CreateLoanInput, RepayLoanInput } from "@/lib/validations/loan";
import {
  createSavingsMovement,
  getSavingsGoalById,
} from "@/lib/savings-goals/queries";
import { validateSavingsPayment } from "@/lib/savings-goals/service";

const LOAN_CATEGORY = "Préstamos";

function parseOptionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createLoan(userId: string, input: CreateLoanInput) {
  const borrower = await getLoanPersonById(userId, input.borrowerId);
  if (!borrower) {
    throw new Error("La persona seleccionada no existe");
  }

  const lentAt = new Date(input.lentAt);
  if (Number.isNaN(lentAt.getTime())) {
    throw new Error("La fecha del préstamo no es válida");
  }

  const interestAmount = input.hasInterest ? (input.interestAmount ?? 0) : 0;
  const expectedDueDate = parseOptionalDate(input.expectedDueDate ?? null);
  const loanId = crypto.randomUUID();
  const disbursementTransactionId = crypto.randomUUID();
  const title = `Préstamo a ${borrower.name}`;

  if (input.fundedFrom === "savings") {
    if (!input.savingsGoalId) {
      throw new Error("Selecciona el ahorro de origen");
    }

    const goal = await getSavingsGoalById(userId, input.savingsGoalId);
    if (!goal?.isActive) {
      throw new Error("El ahorro seleccionado no está disponible");
    }

    const savingsError = await validateSavingsPayment(
      userId,
      input.savingsGoalId,
      input.principalAmount,
    );
    if (savingsError) {
      throw new Error(savingsError);
    }

    await db.insert(transaction).values({
      id: disbursementTransactionId,
      userId,
      type: "expense",
      title,
      category: LOAN_CATEGORY,
      method: "Transferencia",
      amount: input.principalAmount,
      occurredAt: lentAt,
      status: "completed",
      notes: input.notes?.trim() || "Préstamo en espera de cobro",
      paidFromSavings: true,
      savingsGoalId: input.savingsGoalId,
      loanId,
    });

    await createSavingsMovement({
      userId,
      savingsGoalId: input.savingsGoalId,
      type: "withdrawal",
      amount: input.principalAmount,
      occurredAt: lentAt,
      transactionId: disbursementTransactionId,
      notes: `Préstamo en espera · ${borrower.name}`,
    });
  } else {
    await db.insert(transaction).values({
      id: disbursementTransactionId,
      userId,
      type: "expense",
      title,
      category: LOAN_CATEGORY,
      method: "Transferencia",
      amount: input.principalAmount,
      occurredAt: lentAt,
      status: "completed",
      notes: input.notes?.trim() || "Préstamo en espera de cobro",
      paidFromSavings: false,
      savingsGoalId: null,
      loanId,
    });
  }

  await db.insert(loan).values({
    id: loanId,
    userId,
    borrowerId: input.borrowerId,
    principalAmount: input.principalAmount,
    interestAmount,
    expectedDueDate,
    fundedFrom: input.fundedFrom,
    savingsGoalId: input.fundedFrom === "savings" ? input.savingsGoalId ?? null : null,
    status: "outstanding",
    lentAt,
    notes: input.notes?.trim() || null,
    disbursementTransactionId,
  });

  const created = await getLoanById(userId, loanId);
  if (!created) {
    throw new Error("No pudimos registrar el préstamo");
  }

  return created;
}

export async function repayLoan(
  userId: string,
  loanId: string,
  input: RepayLoanInput,
) {
  const existing = await getLoanById(userId, loanId);
  if (!existing) {
    throw new Error("El préstamo no existe");
  }

  if (existing.status !== "outstanding") {
    throw new Error("Este préstamo ya fue cerrado");
  }

  const repaidAt = new Date(input.repaidAt);
  if (Number.isNaN(repaidAt.getTime())) {
    throw new Error("La fecha de cobro no es válida");
  }

  const repaymentDestination = input.repaymentDestination;
  if (!repaymentDestination) {
    throw new Error("Indica dónde quedará el dinero recibido");
  }

  if (existing.fundedFrom === "cash" && repaymentDestination !== "cash") {
    throw new Error("Un préstamo salido de tu plata debe volver a tu plata");
  }

  if (
    existing.fundedFrom === "savings" &&
    repaymentDestination === "savings" &&
    !existing.savingsGoalId
  ) {
    throw new Error("No encontramos el ahorro de origen");
  }

  let repaymentTransactionId: string | null = null;

  if (repaymentDestination === "cash") {
    repaymentTransactionId = crypto.randomUUID();
    await db.insert(transaction).values({
      id: repaymentTransactionId,
      userId,
      type: "income",
      title: `Cobro préstamo · ${existing.borrowerName}`,
      category: "Otros ingresos",
      method: "Transferencia",
      amount: input.repaidAmount,
      occurredAt: repaidAt,
      status: "completed",
      notes: "Préstamo marcado como recibido",
      loanId,
    });
  } else if (existing.savingsGoalId) {
    await createSavingsMovement({
      userId,
      savingsGoalId: existing.savingsGoalId,
      type: "deposit",
      amount: input.repaidAmount,
      occurredAt: repaidAt,
      notes: `Cobro préstamo · ${existing.borrowerName}`,
    });
  }

  await db
    .update(loan)
    .set({
      status: "repaid",
      repaidAt,
      repaidAmount: input.repaidAmount,
      repaymentDestination,
      repaymentTransactionId,
    })
    .where(eq(loan.id, loanId));

  const updated = await getLoanById(userId, loanId);
  if (!updated) {
    throw new Error("No pudimos actualizar el préstamo");
  }

  return updated;
}

export async function updateLoanNotes(
  userId: string,
  loanId: string,
  input: { expectedDueDate?: string | null; notes?: string | null },
) {
  const existing = await getLoanById(userId, loanId);
  if (!existing) {
    throw new Error("El préstamo no existe");
  }

  if (existing.status !== "outstanding") {
    throw new Error("Solo puedes editar préstamos en espera");
  }

  await db
    .update(loan)
    .set({
      expectedDueDate: parseOptionalDate(input.expectedDueDate ?? null),
      notes: input.notes?.trim() || null,
    })
    .where(eq(loan.id, loanId));

  const updated = await getLoanById(userId, loanId);
  if (!updated) {
    throw new Error("No pudimos actualizar el préstamo");
  }

  return updated;
}

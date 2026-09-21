import { getCardById } from "@/lib/cards/queries";
import {
  createSavingsMovement,
  getSavingsGoalBalance,
  getSavingsGoalById,
  getSavingsWithdrawalByTransactionId,
} from "@/lib/savings-goals/queries";

export async function validateSavingsPayment(
  userId: string,
  savingsGoalId: string,
  amount: number,
) {
  const goal = await getSavingsGoalById(userId, savingsGoalId);

  if (!goal) {
    return "El ahorro seleccionado no existe";
  }

  if (!goal.isActive) {
    return "Este ahorro está pausado";
  }

  const balance = await getSavingsGoalBalance(savingsGoalId);

  if (amount > balance) {
    return `Saldo insuficiente. Disponible: ${balance.toLocaleString("es-CO")}`;
  }

  return null;
}

export async function validateSavingsPaymentForUpdate(
  userId: string,
  savingsGoalId: string,
  amount: number,
  transactionId: string,
) {
  const goal = await getSavingsGoalById(userId, savingsGoalId);

  if (!goal) {
    return "El ahorro seleccionado no existe";
  }

  if (!goal.isActive) {
    return "Este ahorro está pausado";
  }

  const existingMovement = await getSavingsWithdrawalByTransactionId(transactionId);
  let available = await getSavingsGoalBalance(savingsGoalId);

  if (existingMovement?.savingsGoalId === savingsGoalId) {
    available += existingMovement.amount;
  }

  if (amount > available) {
    return `Saldo insuficiente. Disponible: ${available.toLocaleString("es-CO")}`;
  }

  return null;
}

export async function validateSavingsGoalCard(userId: string, cardId: string | null) {
  if (!cardId) return null;

  const card = await getCardById(userId, cardId);

  if (!card) {
    return "La tarjeta seleccionada no existe";
  }

  return null;
}

export async function registerSavingsWithdrawalForExpense(input: {
  userId: string;
  savingsGoalId: string;
  amount: number;
  occurredAt: Date;
  transactionId: string;
  notes?: string | null;
}) {
  const error = await validateSavingsPayment(
    input.userId,
    input.savingsGoalId,
    input.amount,
  );

  if (error) {
    throw new Error(error);
  }

  return createSavingsMovement({
    userId: input.userId,
    savingsGoalId: input.savingsGoalId,
    type: "withdrawal",
    amount: input.amount,
    occurredAt: input.occurredAt,
    transactionId: input.transactionId,
    notes: input.notes ?? "Gasto pagado con ahorros",
  });
}

export async function createSavingsWithdrawalForExpense(input: {
  userId: string;
  savingsGoalId: string;
  amount: number;
  occurredAt: Date;
  transactionId: string;
  notes?: string | null;
}) {
  return createSavingsMovement({
    userId: input.userId,
    savingsGoalId: input.savingsGoalId,
    type: "withdrawal",
    amount: input.amount,
    occurredAt: input.occurredAt,
    transactionId: input.transactionId,
    notes: input.notes ?? "Gasto pagado con ahorros",
  });
}

export function getSavingsExpenseAmount(
  row: {
    paidFromSavings: boolean;
    installmentsCount: number | null;
    installmentAmount: number | null;
    amount: number;
  },
  dueAmount: number,
) {
  if (!row.paidFromSavings) {
    return dueAmount;
  }

  if (
    row.installmentsCount != null &&
    row.installmentAmount != null &&
    row.installmentsCount > 0
  ) {
    return row.installmentAmount;
  }

  return row.amount;
}

export async function adjustSavingsGoalBalance(
  userId: string,
  savingsGoalId: string,
  targetBalance: number,
) {
  const goal = await getSavingsGoalById(userId, savingsGoalId);

  if (!goal) {
    throw new Error("El ahorro no existe");
  }

  const currentBalance = await getSavingsGoalBalance(savingsGoalId);
  const delta = targetBalance - currentBalance;

  if (Math.abs(delta) < 0.01) {
    return null;
  }

  return createSavingsMovement({
    userId,
    savingsGoalId,
    type: delta > 0 ? "deposit" : "withdrawal",
    amount: Math.abs(delta),
    occurredAt: new Date(),
    notes: "Ajuste manual de saldo",
  });
}

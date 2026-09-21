import { db } from "@/db";
import { transaction } from "@/db/schema";
import {
  getSavingsWithdrawalAmount,
  getTransactionGmfAmount,
} from "@/lib/format/gmf";
import { deleteSavingsMovementByTransactionId } from "@/lib/savings-goals/queries";
import {
  createSavingsWithdrawalForExpense,
  registerSavingsWithdrawalForExpense,
  validateSavingsPaymentForUpdate,
} from "@/lib/savings-goals/service";
import type { TransactionInput } from "@/lib/validations/transaction";

export function buildTransactionValues(
  userId: string,
  data: TransactionInput,
  occurredAt: Date,
  savingsFields: {
    savingsGoalId: string | null;
    paidFromSavings: boolean;
    includes4x1000: boolean;
    gmfAmount: number;
  },
) {
  return {
    merchantId: data.merchantId ?? null,
    type: data.type,
    title: data.title.trim(),
    category: data.category,
    method: data.method,
    amount: data.amount,
    installmentsCount: data.installmentsCount ?? null,
    installmentAmount: data.installmentAmount ?? null,
    creditAlreadyStarted: data.creditAlreadyStarted ?? false,
    installmentsPaid: data.creditAlreadyStarted ? (data.installmentsPaid ?? 0) : 0,
    installmentFrequency: data.installmentFrequency ?? null,
    occurredAt,
    status: "completed" as const,
    notes: data.notes?.trim() || null,
    savingsGoalId: savingsFields.savingsGoalId,
    paidFromSavings: savingsFields.paidFromSavings,
    includes4x1000: savingsFields.includes4x1000,
    gmfAmount: savingsFields.gmfAmount,
  };
}

function getSavingsFields(data: TransactionInput) {
  const paidFromSavings = data.type === "expense" && (data.paidFromSavings ?? false);
  const includes4x1000 = paidFromSavings && (data.includes4x1000 ?? false);

  return {
    savingsGoalId: paidFromSavings ? (data.savingsGoalId ?? null) : null,
    paidFromSavings,
    includes4x1000,
    gmfAmount: getTransactionGmfAmount(data),
  };
}

export { getSavingsWithdrawalAmount } from "@/lib/format/gmf";

export async function revertSavingsForTransaction(transactionId: string) {
  await deleteSavingsMovementByTransactionId(transactionId);
}

export async function registerSavingsForTransaction(
  userId: string,
  data: TransactionInput,
  transactionId: string,
  occurredAt: Date,
) {
  if (!data.paidFromSavings || !data.savingsGoalId) {
    return;
  }

  await registerSavingsWithdrawalForExpense({
    userId,
    savingsGoalId: data.savingsGoalId,
    amount: getSavingsWithdrawalAmount(data),
    occurredAt,
    transactionId,
    notes: data.notes ?? null,
  });
}

export async function insertTransactionWithSavings(
  userId: string,
  data: TransactionInput,
  occurredAt: Date,
) {
  const transactionId = crypto.randomUUID();
  const savingsFields = getSavingsFields(data);

  const [created] = await db
    .insert(transaction)
    .values({
      id: transactionId,
      userId,
      ...buildTransactionValues(userId, data, occurredAt, savingsFields),
    })
    .returning();

  await registerSavingsForTransaction(userId, data, created.id, occurredAt);

  return created;
}

export async function syncSavingsOnTransactionUpdate(
  userId: string,
  transactionId: string,
  data: TransactionInput,
  occurredAt: Date,
) {
  const savingsFields = getSavingsFields(data);
  const withdrawalAmount = getSavingsWithdrawalAmount(data);

  if (savingsFields.paidFromSavings && savingsFields.savingsGoalId) {
    const error = await validateSavingsPaymentForUpdate(
      userId,
      savingsFields.savingsGoalId,
      withdrawalAmount,
      transactionId,
    );

    if (error) {
      throw new Error(error);
    }
  }

  await revertSavingsForTransaction(transactionId);

  if (savingsFields.paidFromSavings && savingsFields.savingsGoalId) {
    await createSavingsWithdrawalForExpense({
      userId,
      savingsGoalId: savingsFields.savingsGoalId,
      amount: withdrawalAmount,
      occurredAt,
      transactionId,
      notes: data.notes ?? null,
    });
  }

  return savingsFields;
}

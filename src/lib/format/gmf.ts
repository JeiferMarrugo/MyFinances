import type { TransactionInput } from "@/lib/validations/transaction";

/** Gravamen 4x1000: $4 por cada $1.000 (Colombia). */
export function calculateGmf4x1000(amount: number) {
  if (amount <= 0) return 0;
  return Math.floor(amount / 1000) * 4;
}

export function getSavingsWithdrawalBaseAmount(data: TransactionInput) {
  if (data.installmentsCount && data.installmentAmount) {
    return data.installmentAmount;
  }

  return data.amount;
}

export function getSavingsWithdrawalAmount(data: TransactionInput) {
  const baseAmount = getSavingsWithdrawalBaseAmount(data);

  if (data.paidFromSavings && data.includes4x1000) {
    return baseAmount + calculateGmf4x1000(baseAmount);
  }

  return baseAmount;
}

export function getTransactionGmfAmount(data: TransactionInput) {
  if (!data.paidFromSavings || !data.includes4x1000) {
    return 0;
  }

  return calculateGmf4x1000(getSavingsWithdrawalBaseAmount(data));
}

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import {
  canPayNextInstallment,
  getPaidInstallmentsCount,
  isCreditInstallmentExpense,
} from "@/lib/transactions/installments";
import {
  attachPaymentPlan,
  loadPaymentPlansByTransactionIds,
  markPlanInstallmentPaid,
} from "@/lib/transactions/payment-plan";
import { mapTransactionRow } from "@/lib/transactions/utils";

export async function payCreditInstallment(
  userId: string,
  transactionId: string,
  settingsInput?: FinanceSettingsRecord | null,
) {
  const settings = settingsInput ?? (await getOrCreateFinanceSettings(userId));

  const [row] = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.id, transactionId), eq(transaction.userId, userId)))
    .limit(1);

  if (!row) {
    throw new Error("Movimiento no encontrado");
  }

  const record = mapTransactionRow(row);
  const paymentPlans = await loadPaymentPlansByTransactionIds([transactionId]);
  const recordWithPlan = attachPaymentPlan(record, paymentPlans.get(transactionId));

  if (!isCreditInstallmentExpense(recordWithPlan)) {
    throw new Error("Este movimiento no tiene cuotas de crédito");
  }

  if (recordWithPlan.paidFromSavings) {
    throw new Error("Los gastos pagados con ahorros no usan cuotas de crédito");
  }

  if (!canPayNextInstallment(recordWithPlan, settings)) {
    throw new Error(
      "Esta cuota aún no llega a su fecha de pago. Podrás confirmarla cuando la fecha programada sea hoy o ya haya pasado.",
    );
  }

  const nextPaidCount = getPaidInstallmentsCount(recordWithPlan) + 1;

  if (nextPaidCount > recordWithPlan.installmentsCount!) {
    throw new Error("Ya no quedan cuotas pendientes");
  }

  const installmentIndex = getPaidInstallmentsCount(recordWithPlan);

  const [updated] = await db
    .update(transaction)
    .set({
      creditAlreadyStarted: true,
      installmentsPaid: nextPaidCount,
    })
    .where(and(eq(transaction.id, transactionId), eq(transaction.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error("No pudimos registrar el pago de la cuota");
  }

  await markPlanInstallmentPaid(transactionId, installmentIndex);

  return updated;
}

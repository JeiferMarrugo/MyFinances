import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  creditPaymentPlan,
  creditPaymentPlanItem,
  transaction,
} from "@/db/schema";
import type { FinancePeriodSettings } from "@/lib/finance-settings/periods";
import {
  getInstallmentPaymentDateForIndex,
  getPaidInstallmentsCount,
  isCreditInstallmentExpense,
  type ExpenseCalculationRow,
} from "@/lib/transactions/installments";
import {
  attachPaymentPlan,
  attachPaymentPlansToRows,
  serializePaymentPlan,
  type PaymentPlanItemRecord,
  type PaymentPlanItemStatus,
  type PaymentPlanRecord,
} from "@/lib/transactions/payment-plan-shared";
import type { TransactionRecord } from "@/lib/transactions/types";
import { mapTransactionRow } from "@/lib/transactions/utils";

export type {
  PaymentPlanData,
  PaymentPlanItemRecord,
  PaymentPlanItemStatus,
  PaymentPlanRecord,
  SerializedPaymentPlan,
  SerializedPaymentPlanItem,
} from "@/lib/transactions/payment-plan-shared";

export {
  attachPaymentPlan,
  attachPaymentPlansToRows,
  serializePaymentPlan,
} from "@/lib/transactions/payment-plan-shared";

function buildDraftItems(
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
): Omit<PaymentPlanItemRecord, "id">[] {
  const totalInstallments = row.installmentsCount!;
  const installmentAmount = row.installmentAmount!;
  const paidCount = getPaidInstallmentsCount(row);
  const items: Omit<PaymentPlanItemRecord, "id">[] = [];

  for (let index = 0; index < totalInstallments; index += 1) {
    const paymentDate = getInstallmentPaymentDateForIndex(row, index, settings);
    if (!paymentDate) continue;

    items.push({
      installmentIndex: index,
      installmentNumber: index + 1,
      paymentDate,
      amount: installmentAmount,
      status: index < paidCount ? "paid" : "pending",
      paidAt: null,
    });
  }

  return items;
}

function hasCreditStructureChanged(
  existing: PaymentPlanRecord,
  row: ExpenseCalculationRow,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  if (existing.items.length !== (row.installmentsCount ?? 0)) {
    return true;
  }

  const firstAmount = existing.items[0]?.amount;
  if (firstAmount != null && firstAmount !== row.installmentAmount) {
    return true;
  }

  const paidCount = getPaidInstallmentsCount(row);
  const paidItems = existing.items.filter((item) => item.status === "paid").length;
  if (paidItems !== paidCount) {
    return true;
  }

  const nextPending = existing.items.find((item) => item.status === "pending");
  if (nextPending && row.creditAlreadyStarted && paidCount > 0) {
    const expectedDate = getInstallmentPaymentDateForIndex(row, paidCount, settings);
    if (
      expectedDate &&
      expectedDate.toISOString() !== nextPending.paymentDate.toISOString()
    ) {
      return true;
    }
  }

  return false;
}

async function getPlanRecordByTransactionId(transactionId: string) {
  const [plan] = await db
    .select()
    .from(creditPaymentPlan)
    .where(eq(creditPaymentPlan.transactionId, transactionId))
    .limit(1);

  if (!plan) return null;

  const items = await db
    .select()
    .from(creditPaymentPlanItem)
    .where(eq(creditPaymentPlanItem.planId, plan.id))
    .orderBy(asc(creditPaymentPlanItem.installmentIndex));

  return {
    id: plan.id,
    transactionId: plan.transactionId,
    confirmedAt: plan.confirmedAt,
    items: items.map((item) => ({
      id: item.id,
      installmentIndex: item.installmentIndex,
      installmentNumber: item.installmentNumber,
      paymentDate: item.paymentDate,
      amount: item.amount,
      status: item.status as PaymentPlanItemStatus,
      paidAt: item.paidAt,
    })),
  } satisfies PaymentPlanRecord;
}

export async function loadPaymentPlansByTransactionIds(
  transactionIds: string[],
): Promise<Map<string, PaymentPlanRecord>> {
  if (transactionIds.length === 0) return new Map();

  const plans = await db
    .select()
    .from(creditPaymentPlan)
    .where(inArray(creditPaymentPlan.transactionId, transactionIds));

  if (plans.length === 0) return new Map();

  const planIds = plans.map((plan) => plan.id);
  const items = await db
    .select()
    .from(creditPaymentPlanItem)
    .where(inArray(creditPaymentPlanItem.planId, planIds))
    .orderBy(asc(creditPaymentPlanItem.installmentIndex));

  const itemsByPlanId = new Map<string, PaymentPlanItemRecord[]>();

  for (const item of items) {
    const current = itemsByPlanId.get(item.planId) ?? [];
    current.push({
      id: item.id,
      installmentIndex: item.installmentIndex,
      installmentNumber: item.installmentNumber,
      paymentDate: item.paymentDate,
      amount: item.amount,
      status: item.status as PaymentPlanItemStatus,
      paidAt: item.paidAt,
    });
    itemsByPlanId.set(item.planId, current);
  }

  const result = new Map<string, PaymentPlanRecord>();

  for (const plan of plans) {
    result.set(plan.transactionId, {
      id: plan.id,
      transactionId: plan.transactionId,
      confirmedAt: plan.confirmedAt,
      items: itemsByPlanId.get(plan.id) ?? [],
    });
  }

  return result;
}

export async function deletePaymentPlanForTransaction(transactionId: string) {
  await db
    .delete(creditPaymentPlan)
    .where(eq(creditPaymentPlan.transactionId, transactionId));
}

export async function syncPaymentPlanDraft(
  userId: string,
  row: TransactionRecord,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  if (!isCreditInstallmentExpense(row)) {
    await deletePaymentPlanForTransaction(row.id);
    return null;
  }

  const draftItems = buildDraftItems(row, settings);
  const existing = await getPlanRecordByTransactionId(row.id);

  if (existing) {
    const structureChanged = hasCreditStructureChanged(existing, row, settings);

    if (structureChanged && existing.confirmedAt) {
      await db
        .update(creditPaymentPlan)
        .set({ confirmedAt: null })
        .where(eq(creditPaymentPlan.id, existing.id));
    }

    await db
      .delete(creditPaymentPlanItem)
      .where(eq(creditPaymentPlanItem.planId, existing.id));

    if (draftItems.length > 0) {
      await db.insert(creditPaymentPlanItem).values(
        draftItems.map((item) => ({
          id: crypto.randomUUID(),
          planId: existing.id,
          installmentIndex: item.installmentIndex,
          installmentNumber: item.installmentNumber,
          paymentDate: item.paymentDate,
          amount: item.amount,
          status: item.status,
        })),
      );
    }

    return getPlanRecordByTransactionId(row.id);
  }

  const planId = crypto.randomUUID();

  await db.insert(creditPaymentPlan).values({
    id: planId,
    userId,
    transactionId: row.id,
  });

  if (draftItems.length > 0) {
    await db.insert(creditPaymentPlanItem).values(
      draftItems.map((item) => ({
        id: crypto.randomUUID(),
        planId,
        installmentIndex: item.installmentIndex,
        installmentNumber: item.installmentNumber,
        paymentDate: item.paymentDate,
        amount: item.amount,
        status: item.status,
      })),
    );
  }

  return getPlanRecordByTransactionId(row.id);
}

export async function getOrCreatePaymentPlan(
  userId: string,
  transactionId: string,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  const [row] = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.id, transactionId), eq(transaction.userId, userId)))
    .limit(1);

  if (!row) {
    throw new Error("Movimiento no encontrado");
  }

  if (!isCreditInstallmentExpense(row)) {
    return null;
  }

  return syncPaymentPlanDraft(userId, mapTransactionRow(row), settings);
}

export async function confirmPaymentPlan(userId: string, transactionId: string) {
  const [plan] = await db
    .select()
    .from(creditPaymentPlan)
    .where(
      and(
        eq(creditPaymentPlan.transactionId, transactionId),
        eq(creditPaymentPlan.userId, userId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new Error("No hay plan de pago para confirmar");
  }

  if (plan.confirmedAt) {
    return getPlanRecordByTransactionId(transactionId);
  }

  await db
    .update(creditPaymentPlan)
    .set({ confirmedAt: new Date() })
    .where(eq(creditPaymentPlan.id, plan.id));

  return getPlanRecordByTransactionId(transactionId);
}

export async function syncAndConfirmPaymentPlan(
  userId: string,
  row: TransactionRecord,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  const plan = await syncPaymentPlanDraft(userId, row, settings);
  if (!plan) return null;

  if (plan.confirmedAt) {
    return plan;
  }

  return confirmPaymentPlan(userId, row.id);
}

export async function markPlanInstallmentPaid(
  transactionId: string,
  installmentIndex: number,
) {
  const plan = await getPlanRecordByTransactionId(transactionId);
  if (!plan) return;

  const item = plan.items.find(
    (entry) => entry.installmentIndex === installmentIndex,
  );
  if (!item || item.status === "paid") return;

  await db
    .update(creditPaymentPlanItem)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(creditPaymentPlanItem.id, item.id));
}

export async function getPaymentPlanForTransaction(
  userId: string,
  transactionId: string,
  settings?: Partial<FinancePeriodSettings> | null,
) {
  return getOrCreatePaymentPlan(userId, transactionId, settings);
}

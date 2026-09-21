import type { ExpenseCalculationRow } from "@/lib/transactions/installments";

export type PaymentPlanItemStatus = "pending" | "paid";

export type PaymentPlanItemRecord = {
  id: string;
  installmentIndex: number;
  installmentNumber: number;
  paymentDate: Date;
  amount: number;
  status: PaymentPlanItemStatus;
  paidAt: Date | null;
};

export type PaymentPlanRecord = {
  id: string;
  transactionId: string;
  confirmedAt: Date | null;
  items: PaymentPlanItemRecord[];
};

export type PaymentPlanData = {
  confirmed: boolean;
  items: Array<{
    installmentIndex: number;
    paymentDate: Date;
    amount: number;
    status: PaymentPlanItemStatus;
    paidAt: Date | null;
  }>;
};

export type SerializedPaymentPlanItem = Omit<
  PaymentPlanItemRecord,
  "paymentDate" | "paidAt"
> & {
  paymentDate: string;
  paidAt: string | null;
};

export type SerializedPaymentPlan = {
  id: string;
  transactionId: string;
  confirmedAt: string | null;
  items: SerializedPaymentPlanItem[];
};

function serializePaymentPlanItem(
  item: PaymentPlanItemRecord,
): SerializedPaymentPlanItem {
  return {
    ...item,
    paymentDate: item.paymentDate.toISOString(),
    paidAt: item.paidAt?.toISOString() ?? null,
  };
}

export function serializePaymentPlan(
  plan: PaymentPlanRecord,
): SerializedPaymentPlan {
  return {
    id: plan.id,
    transactionId: plan.transactionId,
    confirmedAt: plan.confirmedAt?.toISOString() ?? null,
    items: plan.items.map(serializePaymentPlanItem),
  };
}

function toPaymentPlanData(plan: PaymentPlanRecord | null): PaymentPlanData | null {
  if (!plan) return null;

  return {
    confirmed: plan.confirmedAt != null,
    items: plan.items.map((item) => ({
      installmentIndex: item.installmentIndex,
      paymentDate: item.paymentDate,
      amount: item.amount,
      status: item.status,
      paidAt: item.paidAt,
    })),
  };
}

export function attachPaymentPlan<T extends ExpenseCalculationRow>(
  row: T,
  plan: PaymentPlanRecord | null | undefined,
): T & { paymentPlan?: PaymentPlanData | null } {
  const paymentPlan = toPaymentPlanData(plan ?? null);
  if (!paymentPlan) return row;

  return {
    ...row,
    paymentPlan,
  };
}

export function attachPaymentPlansToRows<
  T extends ExpenseCalculationRow & { id: string },
>(rows: T[], plans: Map<string, PaymentPlanRecord>) {
  return rows.map((row) => attachPaymentPlan(row, plans.get(row.id)));
}

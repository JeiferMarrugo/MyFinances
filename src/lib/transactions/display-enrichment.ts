import type { FinancePeriodSettings } from "@/lib/finance-settings/periods";
import {
  attachPaymentPlan,
  loadPaymentPlansByTransactionIds,
} from "@/lib/transactions/payment-plan";
import type { TransactionRecord } from "@/lib/transactions/types";
import { enrichDisplayTransaction } from "@/lib/transactions/utils";

export async function enrichDisplayTransactionWithPlan(
  row: TransactionRecord,
  settings?: Partial<FinancePeriodSettings> | null,
  referenceDate = new Date(),
) {
  const paymentPlans = await loadPaymentPlansByTransactionIds([row.id]);
  return enrichDisplayTransaction(
    attachPaymentPlan(row, paymentPlans.get(row.id)),
    settings,
    referenceDate,
  );
}

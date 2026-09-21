import { NextResponse } from "next/server";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { getSavingsWithdrawalAmount } from "@/lib/format/gmf";
import { validateSavingsPayment } from "@/lib/savings-goals/service";
import {
  getMonthlySummary,
  getTransactionsByUserId,
} from "@/lib/transactions/queries";
import { insertTransactionWithSavings } from "@/lib/transactions/savings";
import { syncAndConfirmPaymentPlan } from "@/lib/transactions/payment-plan";
import { enrichDisplayTransactionWithPlan } from "@/lib/transactions/display-enrichment";
import {
  mapTransactionRow,
  toDisplayTransactions,
} from "@/lib/transactions/utils";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { getRequiredSession } from "@/lib/session";
import { transactionSchema } from "@/lib/validations/transaction";

export async function GET() {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [transactions, summary, merchants] = await Promise.all([
    getTransactionsByUserId(session.user.id),
    getMonthlySummary(session.user.id),
    getMerchantsByUserId(session.user.id),
  ]);

  return NextResponse.json({
    transactions: toDisplayTransactions(transactions),
    summary,
    merchants,
  });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    if (parsed.data.merchantId) {
      const merchants = await getMerchantsByUserId(session.user.id);
      const selectedMerchant = merchants.find(
        (item) => item.id === parsed.data.merchantId,
      );

      if (!selectedMerchant) {
        return NextResponse.json(
          { error: "La empresa seleccionada no existe" },
          { status: 400 },
        );
      }

      if (
        parsed.data.type === "expense" &&
        selectedMerchant.allowsCredit &&
        parsed.data.method === "Tarjeta crédito"
      ) {
        if (!parsed.data.installmentsCount || !parsed.data.installmentAmount) {
          return NextResponse.json(
            { error: "Ingresa el número de cuotas y el valor de cada cuota" },
            { status: 400 },
          );
        }
      }
    }

    const occurredAt = new Date(parsed.data.occurredAt);

    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json(
        { error: "La fecha del movimiento no es válida" },
        { status: 400 },
      );
    }

    if (parsed.data.paidFromSavings && parsed.data.savingsGoalId) {
      const savingsError = await validateSavingsPayment(
        session.user.id,
        parsed.data.savingsGoalId,
        getSavingsWithdrawalAmount(parsed.data),
      );

      if (savingsError) {
        return NextResponse.json({ error: savingsError }, { status: 400 });
      }
    }

    const settings = await getOrCreateFinanceSettings(session.user.id);
    const created = await insertTransactionWithSavings(
      session.user.id,
      parsed.data,
      occurredAt,
    );

    await syncAndConfirmPaymentPlan(
      session.user.id,
      mapTransactionRow(created),
      settings,
    );

    const summary = await getMonthlySummary(session.user.id, new Date(), settings);

    return NextResponse.json(
      {
        transaction: await enrichDisplayTransactionWithPlan(
          mapTransactionRow(created),
          settings,
        ),
        summary,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar el movimiento" },
      { status: 500 },
    );
  }
}

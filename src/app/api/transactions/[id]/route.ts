import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { getSavingsWithdrawalAmount } from "@/lib/format/gmf";
import {
  validateSavingsPayment,
  validateSavingsPaymentForUpdate,
} from "@/lib/savings-goals/service";
import { getMonthlySummary } from "@/lib/transactions/queries";
import {
  buildTransactionValues,
  revertSavingsForTransaction,
  syncSavingsOnTransactionUpdate,
} from "@/lib/transactions/savings";
import { syncAndConfirmPaymentPlan } from "@/lib/transactions/payment-plan";
import { enrichDisplayTransactionWithPlan } from "@/lib/transactions/display-enrichment";
import { mapTransactionRow } from "@/lib/transactions/utils";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { getRequiredSession } from "@/lib/session";
import { transactionSchema } from "@/lib/validations/transaction";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function validateTransactionPayload(
  userId: string,
  data: ReturnType<typeof transactionSchema.parse>,
) {
  if (data.merchantId) {
    const merchants = await getMerchantsByUserId(userId);
    const selectedMerchant = merchants.find((item) => item.id === data.merchantId);

    if (!selectedMerchant) {
      return "La empresa seleccionada no existe";
    }

    if (
      data.type === "expense" &&
      selectedMerchant.allowsCredit &&
      data.method === "Tarjeta crédito"
    ) {
      if (!data.installmentsCount || !data.installmentAmount) {
        return "Ingresa el número de cuotas y el valor de cada cuota";
      }
    }
  }

  const occurredAt = new Date(data.occurredAt);

  if (Number.isNaN(occurredAt.getTime())) {
    return "La fecha del movimiento no es válida";
  }

  return occurredAt;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const validationResult = await validateTransactionPayload(
      session.user.id,
      parsed.data,
    );

    if (typeof validationResult === "string") {
      return NextResponse.json({ error: validationResult }, { status: 400 });
    }

    if (parsed.data.paidFromSavings && parsed.data.savingsGoalId) {
      const savingsError = await validateSavingsPaymentForUpdate(
        session.user.id,
        parsed.data.savingsGoalId,
        getSavingsWithdrawalAmount(parsed.data),
        id,
      );

      if (savingsError) {
        return NextResponse.json({ error: savingsError }, { status: 400 });
      }
    }

    const savingsFields = await syncSavingsOnTransactionUpdate(
      session.user.id,
      id,
      parsed.data,
      validationResult,
    );

    const [updated] = await db
      .update(transaction)
      .set(buildTransactionValues(session.user.id, parsed.data, validationResult, savingsFields))
      .where(and(eq(transaction.id, id), eq(transaction.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 },
      );
    }

    const settings = await getOrCreateFinanceSettings(session.user.id);
    await syncAndConfirmPaymentPlan(
      session.user.id,
      mapTransactionRow(updated),
      settings,
    );
    const summary = await getMonthlySummary(session.user.id, new Date(), settings);

    return NextResponse.json({
      transaction: await enrichDisplayTransactionWithPlan(
        mapTransactionRow(updated),
        settings,
      ),
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos actualizar el movimiento",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  await revertSavingsForTransaction(id);

  const [deleted] = await db
    .delete(transaction)
    .where(and(eq(transaction.id, id), eq(transaction.userId, session.user.id)))
    .returning({ id: transaction.id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Movimiento no encontrado" },
      { status: 404 },
    );
  }

  const summary = await getMonthlySummary(session.user.id);

  return NextResponse.json({ success: true, summary });
}

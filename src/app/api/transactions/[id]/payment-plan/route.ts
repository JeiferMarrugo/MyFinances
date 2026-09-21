import { NextResponse } from "next/server";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import {
  confirmPaymentPlan,
  getPaymentPlanForTransaction,
  serializePaymentPlan,
} from "@/lib/transactions/payment-plan";
import { enrichDisplayTransactionWithPlan } from "@/lib/transactions/display-enrichment";
import { getTransactionById } from "@/lib/transactions/queries";
import { getRequiredSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const transaction = await getTransactionById(session.user.id, id);

    if (!transaction) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 },
      );
    }

    const settings = await getOrCreateFinanceSettings(session.user.id);
    const plan = await getPaymentPlanForTransaction(session.user.id, id, settings);

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        title: transaction.title,
        type: transaction.type,
        occurredAt: transaction.occurredAt.toISOString(),
        installmentsCount: transaction.installmentsCount,
        installmentAmount: transaction.installmentAmount,
      },
      plan: plan ? serializePaymentPlan(plan) : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos cargar el plan de pago",
      },
      { status: 400 },
    );
  }
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const transaction = await getTransactionById(session.user.id, id);

    if (!transaction) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 },
      );
    }

    const settings = await getOrCreateFinanceSettings(session.user.id);
    await getPaymentPlanForTransaction(session.user.id, id, settings);
    const plan = await confirmPaymentPlan(session.user.id, id);

    if (!plan) {
      return NextResponse.json(
        { error: "Este movimiento no tiene cuotas de crédito" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      plan: serializePaymentPlan(plan),
      transaction: await enrichDisplayTransactionWithPlan(transaction, settings),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos confirmar el plan de pago",
      },
      { status: 400 },
    );
  }
}

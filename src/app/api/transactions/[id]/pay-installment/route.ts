import { NextResponse } from "next/server";
import { getMonthlySummary } from "@/lib/transactions/queries";
import { payCreditInstallment } from "@/lib/transactions/credit-installments";
import { enrichDisplayTransactionWithPlan } from "@/lib/transactions/display-enrichment";
import { mapTransactionRow } from "@/lib/transactions/utils";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { getRequiredSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const settings = await getOrCreateFinanceSettings(session.user.id);
    const updated = await payCreditInstallment(session.user.id, id, settings);
    const summary = await getMonthlySummary(session.user.id);

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
            : "No pudimos registrar el pago de la cuota",
      },
      { status: 400 },
    );
  }
}

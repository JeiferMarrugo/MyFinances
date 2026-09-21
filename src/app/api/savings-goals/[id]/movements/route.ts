import { NextResponse } from "next/server";
import {
  createSavingsMovement,
  getSavingsGoalById,
  getSavingsGoalsByUserId,
} from "@/lib/savings-goals/queries";
import { getRequiredSession } from "@/lib/session";
import { savingsDepositSchema } from "@/lib/validations/savings-goal";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const goal = await getSavingsGoalById(session.user.id, id);

    if (!goal) {
      return NextResponse.json({ error: "Ahorro no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = savingsDepositSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const occurredAt = new Date(parsed.data.occurredAt);

    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json({ error: "La fecha no es válida" }, { status: 400 });
    }

    await createSavingsMovement({
      userId: session.user.id,
      savingsGoalId: id,
      type: "deposit",
      amount: parsed.data.amount,
      occurredAt,
      notes: parsed.data.notes ?? null,
    });

    const updatedGoal = (await getSavingsGoalsByUserId(session.user.id)).find(
      (item) => item.id === id,
    );

    return NextResponse.json({ goal: updatedGoal }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar el aporte" },
      { status: 500 },
    );
  }
}

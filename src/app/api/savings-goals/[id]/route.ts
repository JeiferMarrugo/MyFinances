import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savingsGoal } from "@/db/schema";
import { getSavingsGoalsByUserId } from "@/lib/savings-goals/queries";
import {
  adjustSavingsGoalBalance,
  validateSavingsGoalCard,
} from "@/lib/savings-goals/service";
import { getRequiredSession } from "@/lib/session";
import { savingsGoalSchema } from "@/lib/validations/savings-goal";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = savingsGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const cardError = await validateSavingsGoalCard(
      session.user.id,
      parsed.data.cardId ?? null,
    );

    if (cardError) {
      return NextResponse.json({ error: cardError }, { status: 400 });
    }

    const [updated] = await db
      .update(savingsGoal)
      .set({
        name: parsed.data.name.trim(),
        cardId: parsed.data.cardId ?? null,
        targetAmount: parsed.data.targetAmount ?? null,
        targetMonths: parsed.data.targetMonths ?? null,
        color: parsed.data.color,
        notes: parsed.data.notes?.trim() || null,
        isActive: parsed.data.isActive ?? true,
      })
      .where(and(eq(savingsGoal.id, id), eq(savingsGoal.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Ahorro no encontrado" }, { status: 404 });
    }

    if (parsed.data.currentBalance != null) {
      await adjustSavingsGoalBalance(
        session.user.id,
        id,
        parsed.data.currentBalance,
      );
    }

    const goal = (await getSavingsGoalsByUserId(session.user.id)).find(
      (item) => item.id === id,
    );

    return NextResponse.json({ goal });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos actualizar el ahorro",
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

  const [deleted] = await db
    .delete(savingsGoal)
    .where(and(eq(savingsGoal.id, id), eq(savingsGoal.userId, session.user.id)))
    .returning({ id: savingsGoal.id });

  if (!deleted) {
    return NextResponse.json({ error: "Ahorro no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

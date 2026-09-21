import { NextResponse } from "next/server";
import { db } from "@/db";
import { savingsGoal } from "@/db/schema";
import { getCardsByUserId } from "@/lib/cards/queries";
import {
  createSavingsMovement,
  getSavingsGoalsByUserId,
} from "@/lib/savings-goals/queries";
import { validateSavingsGoalCard } from "@/lib/savings-goals/service";
import { getRequiredSession } from "@/lib/session";
import { savingsGoalSchema } from "@/lib/validations/savings-goal";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const goals = await getSavingsGoalsByUserId(session.user.id);
  return NextResponse.json({ goals });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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

    const cards = await getCardsByUserId(session.user.id);
    if (parsed.data.cardId && !cards.some((card) => card.id === parsed.data.cardId)) {
      return NextResponse.json({ error: "La tarjeta no existe" }, { status: 400 });
    }

    const [created] = await db
      .insert(savingsGoal)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: parsed.data.name.trim(),
        cardId: parsed.data.cardId ?? null,
        targetAmount: parsed.data.targetAmount ?? null,
        targetMonths: parsed.data.targetMonths ?? null,
        color: parsed.data.color,
        notes: parsed.data.notes?.trim() || null,
      })
      .returning();

    if (parsed.data.initialBalance && parsed.data.initialBalance > 0) {
      await createSavingsMovement({
        userId: session.user.id,
        savingsGoalId: created.id,
        type: "deposit",
        amount: parsed.data.initialBalance,
        occurredAt: new Date(),
        notes: "Saldo inicial",
      });
    }

    const [mapped] = await getSavingsGoalsByUserId(session.user.id).then((items) =>
      items.filter((item) => item.id === created.id),
    );

    return NextResponse.json({ goal: mapped ?? created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No pudimos crear el ahorro" },
      { status: 500 },
    );
  }
}

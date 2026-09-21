import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { card } from "@/db/schema";
import { getBankById } from "@/lib/banks/queries";
import { getCardById, getCardsByUserId } from "@/lib/cards/queries";
import { getRequiredSession } from "@/lib/session";
import { cardSchema } from "@/lib/validations/card";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await getCardById(session.user.id, id);
    if (!existing) {
      return NextResponse.json(
        { error: "Tarjeta no encontrada" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = cardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    if (parsed.data.bankId) {
      const linkedBank = await getBankById(session.user.id, parsed.data.bankId);
      if (!linkedBank) {
        return NextResponse.json(
          { error: "Selecciona un banco válido" },
          { status: 400 },
        );
      }
    }

    const cards = await getCardsByUserId(session.user.id);
    const duplicate = cards.find(
      (item) =>
        item.id !== id &&
        item.name.trim().toLowerCase() ===
          parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes una tarjeta registrada con ese nombre" },
        { status: 409 },
      );
    }

    await db
      .update(card)
      .set({
        bankId: parsed.data.bankId || null,
        name: parsed.data.name.trim(),
        cardType: parsed.data.cardType,
        lastFourDigits: parsed.data.lastFourDigits || null,
        brandColor: parsed.data.brandColor || null,
        isActive: parsed.data.isActive,
      })
      .where(and(eq(card.id, id), eq(card.userId, session.user.id)));

    const [updated] = await getCardsByUserId(session.user.id).then((items) =>
      items.filter((item) => item.id === id),
    );

    return NextResponse.json({ card: updated });
  } catch {
    return NextResponse.json(
      { error: "No pudimos actualizar la tarjeta" },
      { status: 500 },
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
    .delete(card)
    .where(and(eq(card.id, id), eq(card.userId, session.user.id)))
    .returning({ id: card.id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Tarjeta no encontrada" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}

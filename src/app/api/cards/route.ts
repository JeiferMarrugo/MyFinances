import { NextResponse } from "next/server";
import { db } from "@/db";
import { card } from "@/db/schema";
import { getBankById } from "@/lib/banks/queries";
import { getCardsByUserId } from "@/lib/cards/queries";
import { getRequiredSession } from "@/lib/session";
import { cardSchema } from "@/lib/validations/card";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cards = await getCardsByUserId(session.user.id);
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
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

    const existing = await getCardsByUserId(session.user.id);
    const duplicate = existing.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes una tarjeta registrada con ese nombre" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(card)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        bankId: parsed.data.bankId || null,
        name: parsed.data.name.trim(),
        cardType: parsed.data.cardType,
        lastFourDigits: parsed.data.lastFourDigits || null,
        brandColor: parsed.data.brandColor || null,
        isActive: parsed.data.isActive,
      })
      .returning();

    const [withBank] = await getCardsByUserId(session.user.id).then((items) =>
      items.filter((item) => item.id === created.id),
    );

    return NextResponse.json(
      { card: withBank ?? created },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar la tarjeta" },
      { status: 500 },
    );
  }
}

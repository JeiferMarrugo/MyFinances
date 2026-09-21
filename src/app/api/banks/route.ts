import { NextResponse } from "next/server";
import { db } from "@/db";
import { bank } from "@/db/schema";
import { getBanksByUserId } from "@/lib/banks/queries";
import { getRequiredSession } from "@/lib/session";
import { bankSchema } from "@/lib/validations/bank";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const banks = await getBanksByUserId(session.user.id);
  return NextResponse.json({ banks });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bankSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const existing = await getBanksByUserId(session.user.id);
    const duplicate = existing.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes un banco registrado con ese nombre" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(bank)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: parsed.data.name.trim(),
        logoUrl: parsed.data.logoUrl || null,
        brandColor: parsed.data.brandColor,
      })
      .returning();

    return NextResponse.json({ bank: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar el banco" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { merchant } from "@/db/schema";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { getRequiredSession } from "@/lib/session";
import { merchantSchema } from "@/lib/validations/merchant";

export async function GET() {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const merchants = await getMerchantsByUserId(session.user.id);
  return NextResponse.json({ merchants });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = merchantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const existing = await getMerchantsByUserId(session.user.id);
    const duplicate = existing.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes una empresa registrada con ese nombre" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(merchant)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: parsed.data.name.trim(),
        logoUrl: parsed.data.logoUrl || null,
        allowsCredit: parsed.data.allowsCredit,
      })
      .returning();

    return NextResponse.json({ merchant: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar la empresa" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { merchant } from "@/db/schema";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { getRequiredSession } from "@/lib/session";
import { merchantSchema } from "@/lib/validations/merchant";

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
        item.id !== id &&
        item.name.trim().toLowerCase() ===
          parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes una empresa registrada con ese nombre" },
        { status: 409 },
      );
    }

    const [updated] = await db
      .update(merchant)
      .set({
        name: parsed.data.name.trim(),
        logoUrl: parsed.data.logoUrl || null,
        allowsCredit: parsed.data.allowsCredit,
      })
      .where(and(eq(merchant.id, id), eq(merchant.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ merchant: updated });
  } catch {
    return NextResponse.json(
      { error: "No pudimos actualizar la empresa" },
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
    .delete(merchant)
    .where(and(eq(merchant.id, id), eq(merchant.userId, session.user.id)))
    .returning({ id: merchant.id });

  if (!deleted) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

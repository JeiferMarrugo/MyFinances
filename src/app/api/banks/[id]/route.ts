import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bank } from "@/db/schema";
import { getBankById, getBanksByUserId } from "@/lib/banks/queries";
import { getRequiredSession } from "@/lib/session";
import { bankSchema } from "@/lib/validations/bank";

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
    const existing = await getBankById(session.user.id, id);
    if (!existing) {
      return NextResponse.json({ error: "Banco no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = bankSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const banks = await getBanksByUserId(session.user.id);
    const duplicate = banks.find(
      (item) =>
        item.id !== id &&
        item.name.trim().toLowerCase() ===
          parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes un banco registrado con ese nombre" },
        { status: 409 },
      );
    }

    const [updated] = await db
      .update(bank)
      .set({
        name: parsed.data.name.trim(),
        logoUrl: parsed.data.logoUrl || null,
        brandColor: parsed.data.brandColor,
      })
      .where(and(eq(bank.id, id), eq(bank.userId, session.user.id)))
      .returning();

    return NextResponse.json({ bank: updated });
  } catch {
    return NextResponse.json(
      { error: "No pudimos actualizar el banco" },
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
    .delete(bank)
    .where(and(eq(bank.id, id), eq(bank.userId, session.user.id)))
    .returning({ id: bank.id });

  if (!deleted) {
    return NextResponse.json({ error: "Banco no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

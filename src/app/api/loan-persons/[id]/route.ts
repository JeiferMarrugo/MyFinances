import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { loan, loanPerson } from "@/db/schema";
import { getLoanPersonById } from "@/lib/loans/queries";
import { getRequiredSession } from "@/lib/session";
import { loanPersonSchema } from "@/lib/validations/loan";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getLoanPersonById(session.user.id, id);

  if (!existing) {
    return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = loanPersonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(loanPerson)
      .set({
        name: parsed.data.name.trim(),
        notes: parsed.data.notes?.trim() || null,
      })
      .where(eq(loanPerson.id, id))
      .returning();

    return NextResponse.json({ person: updated });
  } catch {
    return NextResponse.json(
      { error: "No pudimos actualizar la persona" },
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
  const existing = await getLoanPersonById(session.user.id, id);

  if (!existing) {
    return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 });
  }

  const [linkedLoan] = await db
    .select({ id: loan.id })
    .from(loan)
    .where(eq(loan.borrowerId, id))
    .limit(1);

  if (linkedLoan) {
    return NextResponse.json(
      { error: "Esta persona tiene préstamos asociados y no se puede eliminar" },
      { status: 409 },
    );
  }

  await db.delete(loanPerson).where(eq(loanPerson.id, id));
  return NextResponse.json({ ok: true });
}

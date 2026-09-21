import { NextResponse } from "next/server";
import { db } from "@/db";
import { loanPerson } from "@/db/schema";
import { getLoanPersonsByUserId } from "@/lib/loans/queries";
import { getRequiredSession } from "@/lib/session";
import { loanPersonSchema } from "@/lib/validations/loan";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const persons = await getLoanPersonsByUserId(session.user.id);
  return NextResponse.json({ persons });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

    const existing = await getLoanPersonsByUserId(session.user.id);
    const duplicate = existing.find(
      (person) =>
        person.name.trim().toLowerCase() === parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes registrada a esta persona" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(loanPerson)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: parsed.data.name.trim(),
        notes: parsed.data.notes?.trim() || null,
      })
      .returning();

    return NextResponse.json({ person: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar la persona" },
      { status: 500 },
    );
  }
}

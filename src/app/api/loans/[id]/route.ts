import { NextResponse } from "next/server";
import { getLoanById } from "@/lib/loans/queries";
import { updateLoanNotes } from "@/lib/loans/service";
import { getRequiredSession } from "@/lib/session";
import { updateLoanSchema } from "@/lib/validations/loan";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getLoanById(session.user.id, id);

  if (!existing) {
    return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = updateLoanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const loanRecord = await updateLoanNotes(session.user.id, id, parsed.data);
    return NextResponse.json({ loan: loanRecord });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos actualizar el préstamo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

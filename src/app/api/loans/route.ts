import { NextResponse } from "next/server";
import { getLoansByUserId, getLoansOverview } from "@/lib/loans/queries";
import { createLoan } from "@/lib/loans/service";
import { getRequiredSession } from "@/lib/session";
import { createLoanSchema } from "@/lib/validations/loan";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [loans, overview] = await Promise.all([
    getLoansByUserId(session.user.id),
    getLoansOverview(session.user.id),
  ]);

  return NextResponse.json({ loans, overview });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createLoanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const loanRecord = await createLoan(session.user.id, parsed.data);
    const overview = await getLoansOverview(session.user.id);

    return NextResponse.json({ loan: loanRecord, overview }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos registrar el préstamo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

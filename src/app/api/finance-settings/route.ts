import { NextResponse } from "next/server";
import {
  getOrCreateFinanceSettings,
  upsertFinanceSettings,
} from "@/lib/finance-settings/queries";
import { getRequiredSession } from "@/lib/session";
import { financeSettingsSchema } from "@/lib/validations/finance-settings";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const settings = await getOrCreateFinanceSettings(session.user.id);
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = financeSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const settings = await upsertFinanceSettings(session.user.id, parsed.data);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: "No pudimos guardar la configuración" },
      { status: 500 },
    );
  }
}

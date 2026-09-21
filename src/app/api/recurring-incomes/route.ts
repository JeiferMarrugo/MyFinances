import { NextResponse } from "next/server";
import { db } from "@/db";
import { recurringIncome } from "@/db/schema";
import {
  computeInitialNextRunAt,
  parseRecurringStartDate,
} from "@/lib/recurring-incomes/schedule";
import {
  getRecurringIncomesByUserId,
  mapRecurringIncomeRow,
} from "@/lib/recurring-incomes/queries";
import { serializeRecurringIncome } from "@/lib/recurring-incomes/utils";
import { getRequiredSession } from "@/lib/session";
import { recurringIncomeSchema } from "@/lib/validations/recurring-income";

export async function GET() {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const items = await getRecurringIncomesByUserId(session.user.id);

  return NextResponse.json({
    recurringIncomes: items.map(serializeRecurringIncome),
  });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = recurringIncomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const startDate = parseRecurringStartDate(parsed.data.startDate);

    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "La fecha de inicio no es válida" },
        { status: 400 },
      );
    }

    const nextRunAt = computeInitialNextRunAt(
      parsed.data.frequency,
      startDate,
      parsed.data.dayOfMonth,
    );

    const [created] = await db
      .insert(recurringIncome)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        title: parsed.data.title.trim(),
        category: parsed.data.category,
        method: parsed.data.method,
        amount: parsed.data.amount,
        frequency: parsed.data.frequency,
        dayOfMonth: parsed.data.dayOfMonth,
        startDate,
        nextRunAt,
        isActive: true,
        notes: parsed.data.notes?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { recurringIncome: serializeRecurringIncome(mapRecurringIncomeRow(created)) },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "No pudimos crear el ingreso recurrente" },
      { status: 500 },
    );
  }
}

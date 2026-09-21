import { NextResponse } from "next/server";
import { db } from "@/db";
import { recurringExpense } from "@/db/schema";
import { computeInitialNextRunAt, parseRecurringStartDate } from "@/lib/recurring-incomes/schedule";
import {
  getRecurringExpensesWithSpending,
  mapRecurringExpenseRow,
} from "@/lib/recurring-expenses/queries";
import { serializeRecurringExpense } from "@/lib/recurring-expenses/utils";
import { getRequiredSession } from "@/lib/session";
import { recurringExpenseSchema } from "@/lib/validations/recurring-expense";

export async function GET() {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const items = await getRecurringExpensesWithSpending(session.user.id);

  return NextResponse.json({
    recurringExpenses: items.map(serializeRecurringExpense),
  });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = recurringExpenseSchema.safeParse(body);

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
      .insert(recurringExpense)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        title: parsed.data.title.trim(),
        category: parsed.data.category,
        method: parsed.data.method,
        budgetAmount: parsed.data.budgetAmount,
        frequency: parsed.data.frequency,
        dayOfMonth: parsed.data.dayOfMonth,
        startDate,
        nextRunAt,
        autoRegister: parsed.data.autoRegister,
        isActive: true,
        notes: parsed.data.notes?.trim() || null,
      })
      .returning();

    const [withSpending] = await getRecurringExpensesWithSpending(
      session.user.id,
    ).then((items) => items.filter((item) => item.id === created.id));

    return NextResponse.json(
      {
        recurringExpense: serializeRecurringExpense(
          withSpending ?? {
            ...mapRecurringExpenseRow(created),
            spentThisMonth: 0,
            progressPercent: 0,
          },
        ),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "No pudimos crear el gasto fijo" },
      { status: 500 },
    );
  }
}

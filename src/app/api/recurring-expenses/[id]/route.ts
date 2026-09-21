import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { recurringExpense } from "@/db/schema";
import { computeNextRunAt, parseRecurringStartDate, startOfDay } from "@/lib/recurring-incomes/schedule";
import {
  getRecurringExpenseById,
  getRecurringExpensesWithSpending,
  mapRecurringExpenseRow,
} from "@/lib/recurring-expenses/queries";
import { serializeRecurringExpense } from "@/lib/recurring-expenses/utils";
import { getRequiredSession } from "@/lib/session";
import { recurringExpenseUpdateSchema } from "@/lib/validations/recurring-expense";

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
    const existing = await getRecurringExpenseById(session.user.id, id);

    if (!existing) {
      return NextResponse.json(
        { error: "Gasto fijo no encontrado" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = recurringExpenseUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const startDate = parsed.data.startDate
      ? parseRecurringStartDate(parsed.data.startDate)
      : existing.startDate;
    const frequency = parsed.data.frequency ?? existing.frequency;
    const dayOfMonth = parsed.data.dayOfMonth ?? existing.dayOfMonth;

    let nextRunAt = existing.nextRunAt;

    if (
      parsed.data.startDate ||
      parsed.data.frequency ||
      parsed.data.dayOfMonth !== undefined
    ) {
      nextRunAt = computeNextRunAt(frequency, startDate, dayOfMonth);
      while (startOfDay(nextRunAt).getTime() < startOfDay(new Date()).getTime()) {
        nextRunAt = computeNextRunAt(frequency, nextRunAt, dayOfMonth);
      }
    }

    const [updated] = await db
      .update(recurringExpense)
      .set({
        title: parsed.data.title?.trim() ?? existing.title,
        category: parsed.data.category ?? existing.category,
        method: parsed.data.method ?? existing.method,
        budgetAmount: parsed.data.budgetAmount ?? existing.budgetAmount,
        frequency,
        dayOfMonth,
        startDate,
        nextRunAt,
        autoRegister: parsed.data.autoRegister ?? existing.autoRegister,
        isActive: parsed.data.isActive ?? existing.isActive,
        notes:
          parsed.data.notes !== undefined
            ? parsed.data.notes?.trim() || null
            : existing.notes,
      })
      .where(
        and(
          eq(recurringExpense.id, id),
          eq(recurringExpense.userId, session.user.id),
        ),
      )
      .returning();

    const withSpending = await getRecurringExpensesWithSpending(
      session.user.id,
    ).then((items) => items.find((item) => item.id === updated.id));

    return NextResponse.json({
      recurringExpense: serializeRecurringExpense(
        withSpending ?? {
          ...mapRecurringExpenseRow(updated),
          spentThisMonth: 0,
          progressPercent: 0,
        },
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos actualizar el gasto fijo" },
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
    .delete(recurringExpense)
    .where(
      and(
        eq(recurringExpense.id, id),
        eq(recurringExpense.userId, session.user.id),
      ),
    )
    .returning({ id: recurringExpense.id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Gasto fijo no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}

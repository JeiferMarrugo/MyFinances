import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { recurringIncome } from "@/db/schema";
import { computeNextRunAt, isRecurringRunDue, parseRecurringStartDate, startOfDay } from "@/lib/recurring-incomes/schedule";
import {
  getRecurringIncomeById,
  mapRecurringIncomeRow,
} from "@/lib/recurring-incomes/queries";
import { serializeRecurringIncome } from "@/lib/recurring-incomes/utils";
import { getRequiredSession } from "@/lib/session";
import { recurringIncomeUpdateSchema } from "@/lib/validations/recurring-income";

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
    const existing = await getRecurringIncomeById(session.user.id, id);

    if (!existing) {
      return NextResponse.json(
        { error: "Ingreso recurrente no encontrado" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = recurringIncomeUpdateSchema.safeParse(body);

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
      .update(recurringIncome)
      .set({
        title: parsed.data.title?.trim() ?? existing.title,
        category: parsed.data.category ?? existing.category,
        method: parsed.data.method ?? existing.method,
        amount: parsed.data.amount ?? existing.amount,
        frequency,
        dayOfMonth,
        startDate,
        nextRunAt,
        isActive: parsed.data.isActive ?? existing.isActive,
        notes:
          parsed.data.notes !== undefined
            ? parsed.data.notes?.trim() || null
            : existing.notes,
      })
      .where(
        and(
          eq(recurringIncome.id, id),
          eq(recurringIncome.userId, session.user.id),
        ),
      )
      .returning();

    return NextResponse.json({
      recurringIncome: serializeRecurringIncome(mapRecurringIncomeRow(updated)),
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos actualizar el ingreso recurrente" },
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
    .delete(recurringIncome)
    .where(
      and(
        eq(recurringIncome.id, id),
        eq(recurringIncome.userId, session.user.id),
      ),
    )
    .returning({ id: recurringIncome.id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Ingreso recurrente no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}

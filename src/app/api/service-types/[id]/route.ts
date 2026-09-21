import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceType } from "@/db/schema";
import {
  getServiceTypeById,
  getServiceTypesByUserId,
} from "@/lib/service-types/queries";
import { getRequiredSession } from "@/lib/session";
import { serviceTypeSchema } from "@/lib/validations/service-type";

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
    const existing = await getServiceTypeById(session.user.id, id);
    if (!existing) {
      return NextResponse.json(
        { error: "Tipo de servicio no encontrado" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = serviceTypeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const items = await getServiceTypesByUserId(session.user.id);
    const duplicate = items.find(
      (item) =>
        item.id !== id &&
        item.name.trim().toLowerCase() ===
          parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes un tipo de servicio con ese nombre" },
        { status: 409 },
      );
    }

    const [updated] = await db
      .update(serviceType)
      .set({
        name: parsed.data.name.trim(),
        category: parsed.data.category,
        description: parsed.data.description?.trim() || null,
        color: parsed.data.color,
      })
      .where(
        and(eq(serviceType.id, id), eq(serviceType.userId, session.user.id)),
      )
      .returning();

    return NextResponse.json({ serviceType: updated });
  } catch {
    return NextResponse.json(
      { error: "No pudimos actualizar el tipo de servicio" },
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
    .delete(serviceType)
    .where(
      and(eq(serviceType.id, id), eq(serviceType.userId, session.user.id)),
    )
    .returning({ id: serviceType.id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Tipo de servicio no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceType } from "@/db/schema";
import { getServiceTypesByUserId } from "@/lib/service-types/queries";
import { getRequiredSession } from "@/lib/session";
import { serviceTypeSchema } from "@/lib/validations/service-type";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const serviceTypes = await getServiceTypesByUserId(session.user.id);
  return NextResponse.json({ serviceTypes });
}

export async function POST(request: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = serviceTypeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const existing = await getServiceTypesByUserId(session.user.id);
    const duplicate = existing.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        parsed.data.name.trim().toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "Ya tienes un tipo de servicio con ese nombre" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(serviceType)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: parsed.data.name.trim(),
        category: parsed.data.category,
        description: parsed.data.description?.trim() || null,
        color: parsed.data.color,
      })
      .returning();

    return NextResponse.json({ serviceType: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar el tipo de servicio" },
      { status: 500 },
    );
  }
}

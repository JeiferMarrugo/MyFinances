import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceType } from "@/db/schema";
import type { ServiceTypeRecord } from "@/lib/service-types/types";

export async function getServiceTypesByUserId(
  userId: string,
): Promise<ServiceTypeRecord[]> {
  return db
    .select()
    .from(serviceType)
    .where(eq(serviceType.userId, userId))
    .orderBy(asc(serviceType.name));
}

export async function getServiceTypeById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(serviceType)
    .where(eq(serviceType.id, id))
    .limit(1);

  if (!row || row.userId !== userId) {
    return null;
  }

  return row;
}

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { merchant } from "@/db/schema";
import type { MerchantRecord } from "@/lib/merchants/types";

export async function getMerchantsByUserId(
  userId: string,
): Promise<MerchantRecord[]> {
  return db
    .select()
    .from(merchant)
    .where(eq(merchant.userId, userId))
    .orderBy(asc(merchant.name));
}

export async function getMerchantById(userId: string, merchantId: string) {
  const [record] = await db
    .select()
    .from(merchant)
    .where(eq(merchant.id, merchantId))
    .limit(1);

  if (!record || record.userId !== userId) {
    return null;
  }

  return record;
}

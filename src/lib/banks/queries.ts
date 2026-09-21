import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bank } from "@/db/schema";
import type { BankRecord } from "@/lib/banks/types";

export async function getBanksByUserId(userId: string): Promise<BankRecord[]> {
  return db
    .select()
    .from(bank)
    .where(eq(bank.userId, userId))
    .orderBy(asc(bank.name));
}

export async function getBankById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(bank)
    .where(eq(bank.id, id))
    .limit(1);

  if (!row || row.userId !== userId) {
    return null;
  }

  return row;
}

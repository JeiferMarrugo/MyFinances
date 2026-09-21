import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bank, card } from "@/db/schema";
import type { CardType } from "@/lib/cards/constants";
import type { CardRecord } from "@/lib/cards/types";

export async function getCardsByUserId(userId: string): Promise<CardRecord[]> {
  const rows = await db
    .select({
      id: card.id,
      userId: card.userId,
      bankId: card.bankId,
      name: card.name,
      cardType: card.cardType,
      lastFourDigits: card.lastFourDigits,
      brandColor: card.brandColor,
      isActive: card.isActive,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      bankName: bank.name,
      bankBrandColor: bank.brandColor,
    })
    .from(card)
    .leftJoin(bank, eq(card.bankId, bank.id))
    .where(eq(card.userId, userId))
    .orderBy(asc(card.name));

  return rows.map((row) => ({
    ...row,
    cardType: row.cardType as CardType,
  }));
}

export async function getCardById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(card)
    .where(eq(card.id, id))
    .limit(1);

  if (!row || row.userId !== userId) {
    return null;
  }

  return {
    ...row,
    cardType: row.cardType as CardType,
  };
}

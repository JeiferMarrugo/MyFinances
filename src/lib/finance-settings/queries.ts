import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userFinanceSettings } from "@/db/schema";
import type { FinanceSettingsRecord } from "@/lib/finance-settings/types";

export function mapFinanceSettingsRow(
  row: typeof userFinanceSettings.$inferSelect,
): FinanceSettingsRecord {
  return {
    userId: row.userId,
    biweeklyFirstStartDay: row.biweeklyFirstStartDay,
    biweeklyFirstEndDay: row.biweeklyFirstEndDay,
    biweeklySecondStartDay: row.biweeklySecondStartDay,
    biweeklySecondEndDay: row.biweeklySecondEndDay,
    monthStartDay: row.monthStartDay,
    quarterStartMonth: row.quarterStartMonth,
    yearStartMonth: row.yearStartMonth,
    yearStartDay: row.yearStartDay,
    installmentDueOffset: row.installmentDueOffset,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getFinanceSettingsByUserId(userId: string) {
  const [row] = await db
    .select()
    .from(userFinanceSettings)
    .where(eq(userFinanceSettings.userId, userId))
    .limit(1);

  return row ? mapFinanceSettingsRow(row) : null;
}

export async function getOrCreateFinanceSettings(userId: string) {
  const existing = await getFinanceSettingsByUserId(userId);

  if (existing) {
    return existing;
  }

  try {
    const [created] = await db
      .insert(userFinanceSettings)
      .values({ userId })
      .returning();

    return mapFinanceSettingsRow(created);
  } catch {
    const retry = await getFinanceSettingsByUserId(userId);
    if (retry) {
      return retry;
    }

    throw new Error("No pudimos inicializar la configuración financiera");
  }
}

export async function upsertFinanceSettings(
  userId: string,
  values: Omit<FinanceSettingsRecord, "userId" | "createdAt" | "updatedAt">,
) {
  const payload = {
    biweeklyFirstStartDay: values.biweeklyFirstStartDay,
    biweeklyFirstEndDay: values.biweeklyFirstEndDay,
    biweeklySecondStartDay: values.biweeklySecondStartDay,
    biweeklySecondEndDay: values.biweeklySecondEndDay,
    monthStartDay: values.monthStartDay,
    quarterStartMonth: values.quarterStartMonth,
    yearStartMonth: values.yearStartMonth,
    yearStartDay: values.yearStartDay,
    installmentDueOffset: values.installmentDueOffset,
  };

  const [saved] = await db
    .insert(userFinanceSettings)
    .values({
      userId,
      ...payload,
    })
    .onConflictDoUpdate({
      target: userFinanceSettings.userId,
      set: {
        ...payload,
        updatedAt: new Date(),
      },
    })
    .returning();

  return mapFinanceSettingsRow(saved);
}

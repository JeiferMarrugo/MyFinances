import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { installmentPaymentReminder, transaction, user } from "@/db/schema";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";
import { buildPaymentReminderEmail } from "@/lib/email/templates/payment-reminder-email";
import type { PaymentReminderKind } from "@/lib/email/templates/payment-reminder-email";
import { formatCurrency } from "@/lib/format/currency";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import { mapTransactionRow } from "@/lib/transactions/utils";
import {
  getDaysUntilPayment,
} from "@/lib/transactions/pending-payments";
import {
  getNextInstallmentIndex,
  getNextInstallmentPaymentDate,
  isCreditInstallmentExpense,
} from "@/lib/transactions/installments";

export type { PaymentReminderKind } from "@/lib/email/templates/payment-reminder-email";

const reminderKindByDays: Record<number, PaymentReminderKind> = {
  3: "3_days",
  1: "1_day",
  0: "due_day",
};

function getReminderCopy(kind: PaymentReminderKind) {
  switch (kind) {
    case "3_days":
      return {
        subject: "Recordatorio: cuota de crédito en 3 días",
        lead: "Te recordamos que tu próximo pago de cuota es en 3 días.",
      };
    case "1_day":
      return {
        subject: "Recordatorio: cuota de crédito mañana",
        lead: "Te recordamos que tu próximo pago de cuota es mañana.",
      };
    case "due_day":
      return {
        subject: "Recordatorio: pago de cuota hoy",
        lead: "Hoy te toca pagar una cuota de crédito pendiente en MyFinances.",
      };
  }
}

function formatPaymentDateLabel(paymentDate: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(paymentDate);
}

async function wasReminderSent(
  transactionId: string,
  installmentIndex: number,
  reminderKind: PaymentReminderKind,
) {
  const [existing] = await db
    .select({ id: installmentPaymentReminder.id })
    .from(installmentPaymentReminder)
    .where(
      and(
        eq(installmentPaymentReminder.transactionId, transactionId),
        eq(installmentPaymentReminder.installmentIndex, installmentIndex),
        eq(installmentPaymentReminder.reminderKind, reminderKind),
      ),
    )
    .limit(1);

  return Boolean(existing);
}

async function markReminderSent(
  userId: string,
  transactionId: string,
  installmentIndex: number,
  reminderKind: PaymentReminderKind,
) {
  await db.insert(installmentPaymentReminder).values({
    id: crypto.randomUUID(),
    userId,
    transactionId,
    installmentIndex,
    reminderKind,
  });
}

export async function processPaymentReminders(referenceDate = new Date()) {
  if (!isEmailConfigured()) {
    return {
      processedUsers: 0,
      sent: 0,
      skipped: 0,
      disabled: true,
    };
  }

  const users = await db.select().from(user);
  let sent = 0;
  let skipped = 0;

  for (const currentUser of users) {
    const settings = await getOrCreateFinanceSettings(currentUser.id);
    const expenseRows = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, currentUser.id),
          eq(transaction.type, "expense"),
        ),
      );

    for (const row of expenseRows) {
      if (!isCreditInstallmentExpense(row) || row.paidFromSavings) {
        continue;
      }

      const installmentIndex = getNextInstallmentIndex(row);
      if (installmentIndex == null) continue;

      const record = mapTransactionRow(row);
      const paymentDate = getNextInstallmentPaymentDate(record, settings);
      if (!paymentDate) continue;

      const daysUntilPayment = getDaysUntilPayment(paymentDate, referenceDate);
      const reminderKind = reminderKindByDays[daysUntilPayment];

      if (!reminderKind) {
        skipped += 1;
        continue;
      }

      const alreadySent = await wasReminderSent(
        row.id,
        installmentIndex,
        reminderKind,
      );

      if (alreadySent) {
        skipped += 1;
        continue;
      }

      const copy = getReminderCopy(reminderKind);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const paymentDateLabel = formatPaymentDateLabel(paymentDate);
      const amountLabel = formatCurrency(row.installmentAmount!);
      const installmentNumber = installmentIndex + 1;

      const emailContent = buildPaymentReminderEmail({
        userName: currentUser.name,
        title: row.title,
        installmentNumber,
        totalInstallments: row.installmentsCount!,
        amountLabel,
        paymentDateLabel,
        appUrl,
        kind: reminderKind,
      });

      await sendEmail({
        to: currentUser.email,
        subject: copy.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      await markReminderSent(
        currentUser.id,
        row.id,
        installmentIndex,
        reminderKind,
      );
      sent += 1;
    }
  }

  return {
    processedUsers: users.length,
    sent,
    skipped,
    disabled: false,
  };
}

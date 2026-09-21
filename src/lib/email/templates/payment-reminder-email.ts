import { appBrand } from "@/lib/branding";

export type PaymentReminderKind = "3_days" | "1_day" | "due_day";

type PaymentReminderEmailInput = {
  userName: string;
  title: string;
  installmentNumber: number;
  totalInstallments: number;
  amountLabel: string;
  paymentDateLabel: string;
  appUrl: string;
  kind: PaymentReminderKind;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function capitalizeFirst(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getKindMeta(kind: PaymentReminderKind) {
  switch (kind) {
    case "3_days":
      return {
        subjectLead: "Tu próxima cuota vence en 3 días",
        badge: "En 3 días",
        badgeBg: "#ede9fe",
        badgeColor: "#5b21b6",
        accent: "#7c3aed",
      };
    case "1_day":
      return {
        subjectLead: "Tu cuota vence mañana",
        badge: "Mañana",
        badgeBg: "#fef3c7",
        badgeColor: "#b45309",
        accent: "#d97706",
      };
    case "due_day":
      return {
        subjectLead: "Hoy vence una cuota pendiente",
        badge: "Vence hoy",
        badgeBg: "#ffe4e6",
        badgeColor: "#be123c",
        accent: "#e11d48",
      };
  }
}

function getProgressPercent(installmentNumber: number, totalInstallments: number) {
  if (totalInstallments <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round((installmentNumber / totalInstallments) * 100)),
  );
}

export function buildPaymentReminderEmail(input: PaymentReminderEmailInput) {
  const meta = getKindMeta(input.kind);
  const safeName = escapeHtml(input.userName);
  const safeTitle = escapeHtml(input.title);
  const paymentDateLabel = capitalizeFirst(input.paymentDateLabel);
  const movementsUrl = `${input.appUrl}/dashboard/movimientos`;
  const progress = getProgressPercent(
    input.installmentNumber,
    input.totalInstallments,
  );

  const text = [
    `Hola ${input.userName},`,
    "",
    meta.subjectLead,
    "",
    `Crédito: ${input.title}`,
    `Cuota: ${input.installmentNumber}/${input.totalInstallments}`,
    `Monto: ${input.amountLabel}`,
    `Día de pago: ${paymentDateLabel}`,
    "",
    `Confirmar o revisar en ${movementsUrl}`,
    "",
    `${appBrand.name} · ${appBrand.tagline}`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(meta.subjectLead)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;-webkit-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f5;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e4e4e7;box-shadow:0 10px 30px rgba(91,33,182,0.08);">
            <tr>
              <td style="padding:0;background:linear-gradient(135deg,#5b21b6 0%,#7c3aed 55%,#9333ea 100%);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:28px 28px 24px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,0.16);text-align:center;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#ffffff;">
                            ${appBrand.logoLetter}
                          </td>
                          <td style="padding-left:14px;font-family:Arial,Helvetica,sans-serif;">
                            <div style="font-size:18px;font-weight:700;color:#ffffff;line-height:1.2;">${appBrand.name}</div>
                            <div style="font-size:12px;color:rgba(255,255,255,0.82);margin-top:2px;">${appBrand.tagline}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${meta.badgeBg};color:${meta.badgeColor};font-size:12px;font-weight:700;letter-spacing:0.02em;">
                  ${meta.badge}
                </span>
                <h1 style="margin:16px 0 8px;font-size:24px;line-height:1.3;font-weight:700;color:#18181b;">
                  ${escapeHtml(meta.subjectLead)}
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:#52525b;">
                  Hola <strong style="color:#18181b;">${safeName}</strong>, te avisamos sobre una cuota de crédito que tienes pendiente.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 28px 24px;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #ede9fe;border-radius:16px;background:linear-gradient(180deg,#faf5ff 0%,#ffffff 100%);">
                  <tr>
                    <td style="padding:22px;">
                      <div style="font-size:13px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                        Próximo pago
                      </div>
                      <div style="font-size:18px;font-weight:700;color:#18181b;line-height:1.4;margin-bottom:18px;">
                        ${safeTitle}
                      </div>

                      <div style="font-size:34px;line-height:1.1;font-weight:800;color:#5b21b6;margin-bottom:18px;">
                        ${escapeHtml(input.amountLabel)}
                      </div>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="50%" style="padding:0 8px 0 0;vertical-align:top;">
                            <div style="padding:12px 14px;border-radius:12px;background:#ffffff;border:1px solid #f4f4f5;">
                              <div style="font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Cuota</div>
                              <div style="font-size:16px;font-weight:700;color:#18181b;">${input.installmentNumber} de ${input.totalInstallments}</div>
                            </div>
                          </td>
                          <td width="50%" style="padding:0 0 0 8px;vertical-align:top;">
                            <div style="padding:12px 14px;border-radius:12px;background:#ffffff;border:1px solid #f4f4f5;">
                              <div style="font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Fecha</div>
                              <div style="font-size:14px;font-weight:700;color:#18181b;line-height:1.4;">${escapeHtml(paymentDateLabel)}</div>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <div style="margin-top:18px;">
                        <div style="font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
                          Progreso del crédito
                        </div>
                        <div style="height:8px;border-radius:999px;background:#ede9fe;overflow:hidden;">
                          <div style="width:${progress}%;height:8px;border-radius:999px;background:linear-gradient(90deg,#5b21b6 0%,#7c3aed 100%);"></div>
                        </div>
                        <div style="margin-top:6px;font-size:12px;color:#71717a;">${progress}% completado</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 28px;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                  <tr>
                    <td align="center" style="border-radius:14px;background:linear-gradient(135deg,#5b21b6 0%,#7c3aed 100%);">
                      <a href="${movementsUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                        Ver movimientos y confirmar pago
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#71717a;text-align:center;">
                  Abre MyFinances para marcar la cuota como pagada cuando la completes.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 24px;border-top:1px solid #f4f4f5;background:#fafafa;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;text-align:center;">
                  Recibes este correo porque tienes cuotas activas en ${appBrand.name}.<br />
                  Recordatorio automático · 3 días antes, 1 día antes y el día del pago.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return { html, text };
}

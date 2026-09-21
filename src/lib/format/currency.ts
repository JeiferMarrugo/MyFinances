import { appLocale } from "@/lib/branding";

const amountFormatter = new Intl.NumberFormat(appLocale.locale, {
  maximumFractionDigits: 0,
});

export function formatAmountInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return amountFormatter.format(Number(digits));
}

export function parseAmountInput(value: string): number {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return Number.NaN;
  }

  return Number(digits);
}

export function formatCurrency(
  amount: number,
  currency: string = appLocale.currency,
  locale: string = appLocale.locale,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(
  value: number,
  locale: string = appLocale.locale,
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatCompactCurrency(
  amount: number,
  locale: string = appLocale.locale,
) {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M`;
  }

  if (Math.abs(amount) >= 1_000) {
    return `$${Math.round(amount / 1_000)}k`;
  }

  return formatCurrency(amount, appLocale.currency, locale);
}

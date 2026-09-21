import type { ReportsData } from "@/lib/reports/types";
import { formatCurrency } from "@/lib/format/currency";
import { appBrand } from "@/lib/branding";

export type ReportExportFormat = "csv" | "xlsx" | "pdf";

export function parseReportExportFormat(
  value: string | null | undefined,
): ReportExportFormat {
  if (value === "xlsx" || value === "pdf") return value;
  return "csv";
}

export function buildReportsExportFilename(
  periodLabel: string,
  format: ReportExportFormat = "csv",
) {
  const slug = periodLabel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const extensions: Record<ReportExportFormat, string> = {
    csv: "csv",
    xlsx: "xlsx",
    pdf: "pdf",
  };

  return `reporte-${slug || "finanzas"}.${extensions[format]}`;
}

export function getReportExportContentType(format: ReportExportFormat) {
  const types: Record<ReportExportFormat, string> = {
    csv: "text/csv; charset=utf-8",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf: "application/pdf",
  };

  return types[format];
}

export function formatReportMoney(amount: number) {
  return formatCurrency(amount);
}

export function formatReportDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getReportExportMeta(data: ReportsData) {
  return {
    appName: appBrand.name,
    generatedAt: new Date().toISOString(),
    periodLabel: data.periodLabel,
    periodRangeLabel: data.periodRangeLabel,
  };
}

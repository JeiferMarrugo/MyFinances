import ExcelJS from "exceljs";
import type { ReportsData } from "@/lib/reports/types";
import {
  formatReportDate,
  formatReportMoney,
  getReportExportMeta,
} from "@/lib/reports/export";

const brandPurple = "FF7C3AED";
const brandGreen = "FF059669";
const brandRed = "FFDC2626";
const headerFill = "FFF5F3FF";
const borderColor = "FFE2E8F0";

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FF1E293B" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: headerFill },
  };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 24;
}

function applyTableBorders(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, cols: number) {
  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    for (let colIndex = 1; colIndex <= cols; colIndex += 1) {
      const cell = sheet.getCell(rowIndex, colIndex);
      cell.border = {
        top: { style: "thin", color: { argb: borderColor } },
        left: { style: "thin", color: { argb: borderColor } },
        bottom: { style: "thin", color: { argb: borderColor } },
        right: { style: "thin", color: { argb: borderColor } },
      };
    }
  }
}

function addSummarySheet(workbook: ExcelJS.Workbook, data: ReportsData) {
  const meta = getReportExportMeta(data);
  const sheet = workbook.addWorksheet("Resumen", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = `${meta.appName} · Reporte financiero`;
  sheet.getCell("A1").font = { bold: true, size: 16, color: { argb: brandPurple } };
  sheet.getCell("A1").alignment = { horizontal: "left" };

  sheet.getCell("A3").value = "Periodo";
  sheet.getCell("B3").value = data.periodLabel;
  sheet.getCell("A4").value = "Rango";
  sheet.getCell("B4").value = data.periodRangeLabel;
  sheet.getCell("A5").value = "Generado";
  sheet.getCell("B5").value = formatReportDate(meta.generatedAt);

  const metrics = [
    ["Ingresos", data.summary.income, brandGreen],
    ["Gastos", data.summary.expenses, brandRed],
    ["Balance", data.summary.balance, brandPurple],
    ["Cuotas pagadas", data.summary.creditInstallmentsPaid, "FF2563EB"],
    ["Créditos pendientes", data.summary.pendingCreditAmount, "FFD97706"],
  ] as const;

  sheet.getCell("A7").value = "Indicador";
  sheet.getCell("B7").value = "Valor";
  styleHeaderRow(sheet.getRow(7));

  metrics.forEach(([label, value, color], index) => {
    const rowNumber = 8 + index;
    sheet.getCell(`A${rowNumber}`).value = label;
    const valueCell = sheet.getCell(`B${rowNumber}`);
    valueCell.value = value;
    valueCell.numFmt = '"$"#,##0';
    valueCell.font = { bold: true, color: { argb: color } };
  });

  sheet.getCell("A14").value = "Comparativa";
  sheet.getCell("A14").font = { bold: true, size: 12 };

  const comparisonHeaders = ["Periodo", "Ingresos", "Gastos", "Balance"];
  comparisonHeaders.forEach((header, index) => {
    sheet.getCell(15, index + 1).value = header;
  });
  styleHeaderRow(sheet.getRow(15));

  const comparisonRows = [
    [data.periodLabel, data.summary.income, data.summary.expenses, data.summary.balance],
    [
      data.comparison.previous.label,
      data.comparison.previous.income,
      data.comparison.previous.expenses,
      data.comparison.previous.balance,
    ],
    ...(data.comparison.yearAgo
      ? [[
          data.comparison.yearAgo.label,
          data.comparison.yearAgo.income,
          data.comparison.yearAgo.expenses,
          data.comparison.yearAgo.balance,
        ]]
      : []),
  ];

  comparisonRows.forEach((rowValues, index) => {
    const rowNumber = 16 + index;
    rowValues.forEach((value, colIndex) => {
      const cell = sheet.getCell(rowNumber, colIndex + 1);
      cell.value = value;
      if (colIndex > 0) cell.numFmt = '"$"#,##0';
    });
  });

  sheet.columns = [
    { width: 28 },
    { width: 22 },
    { width: 18 },
    { width: 18 },
  ];
}

function addMovementsSheet(workbook: ExcelJS.Workbook, data: ReportsData) {
  const sheet = workbook.addWorksheet("Movimientos");
  const headers = ["Fecha", "Tipo", "Concepto", "Categoría", "Método", "Monto"];

  headers.forEach((header, index) => {
    sheet.getCell(1, index + 1).value = header;
  });
  styleHeaderRow(sheet.getRow(1));

  data.exportRows.forEach((row, index) => {
    const rowNumber = index + 2;
    sheet.getCell(rowNumber, 1).value = new Date(row.date);
    sheet.getCell(rowNumber, 1).numFmt = "dd/mm/yyyy";
    sheet.getCell(rowNumber, 2).value = row.type;
    sheet.getCell(rowNumber, 3).value = row.title;
    sheet.getCell(rowNumber, 4).value = row.category;
    sheet.getCell(rowNumber, 5).value = row.method;
    sheet.getCell(rowNumber, 6).value = row.amount;
    sheet.getCell(rowNumber, 6).numFmt = '"$"#,##0';
  });

  applyTableBorders(
    sheet,
    1,
    Math.max(data.exportRows.length + 1, 1),
    headers.length,
  );

  sheet.columns = [
    { width: 14 },
    { width: 16 },
    { width: 34 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
  ];
}

function addCategoriesSheet(workbook: ExcelJS.Workbook, data: ReportsData) {
  const sheet = workbook.addWorksheet("Categorías");
  ["Categoría", "Monto", "Participación"].forEach((header, index) => {
    sheet.getCell(1, index + 1).value = header;
  });
  styleHeaderRow(sheet.getRow(1));

  data.categories.forEach((category, index) => {
    const rowNumber = index + 2;
    sheet.getCell(rowNumber, 1).value = category.name;
    sheet.getCell(rowNumber, 2).value = category.spent;
    sheet.getCell(rowNumber, 2).numFmt = '"$"#,##0';
    sheet.getCell(rowNumber, 3).value = `${category.share}%`;
  });

  applyTableBorders(
    sheet,
    1,
    Math.max(data.categories.length + 1, 1),
    3,
  );
  sheet.columns = [{ width: 24 }, { width: 18 }, { width: 16 }];
}

function addCreditsSheet(workbook: ExcelJS.Workbook, data: ReportsData) {
  const sheet = workbook.addWorksheet("Créditos");
  [
    "Crédito",
    "Cuotas pagadas",
    "Cuotas pendientes",
    "Saldo pendiente",
    "Próximo pago",
  ].forEach((header, index) => {
    sheet.getCell(1, index + 1).value = header;
  });
  styleHeaderRow(sheet.getRow(1));

  data.credits.forEach((credit, index) => {
    const rowNumber = index + 2;
    sheet.getCell(rowNumber, 1).value = credit.title;
    sheet.getCell(rowNumber, 2).value = `${credit.paidInstallments}/${credit.totalInstallments}`;
    sheet.getCell(rowNumber, 3).value = credit.pendingInstallments;
    sheet.getCell(rowNumber, 4).value = credit.totalPendingAmount;
    sheet.getCell(rowNumber, 4).numFmt = '"$"#,##0';
    sheet.getCell(rowNumber, 5).value = credit.nextPaymentDate
      ? formatReportDate(credit.nextPaymentDate)
      : "Completado";
  });

  applyTableBorders(sheet, 1, Math.max(data.credits.length + 1, 1), 5);
  sheet.columns = [{ width: 28 }, { width: 16 }, { width: 16 }, { width: 18 }, { width: 18 }];
}

export async function buildReportsXlsx(data: ReportsData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = getReportExportMeta(data).appName;
  workbook.created = new Date();

  addSummarySheet(workbook, data);
  addMovementsSheet(workbook, data);
  addCategoriesSheet(workbook, data);
  addCreditsSheet(workbook, data);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function buildReportsCsv(rows: ReportsData["exportRows"]) {
  const headers = ["Fecha", "Tipo", "Concepto", "Categoría", "Método", "Monto"];

  const escapeCsvValue = (value: string | number) => {
    const text = String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        formatReportDate(row.date),
        row.type,
        row.title,
        row.category,
        row.method,
        row.amount,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  return `\uFEFF${lines.join("\n")}`;
}

export { formatReportMoney };

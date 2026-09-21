import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportsData } from "@/lib/reports/types";
import {
  formatReportDate,
  formatReportMoney,
  getReportExportMeta,
} from "@/lib/reports/export";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#1e293b",
    fontFamily: "Helvetica",
  },
  hero: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    padding: 20,
    marginBottom: 18,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 700,
  },
  heroSubtitle: {
    color: "#ede9fe",
    marginTop: 6,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metaText: {
    color: "#64748b",
    fontSize: 9,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  kpiCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  kpiLabel: {
    color: "#64748b",
    fontSize: 9,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    color: "#5b21b6",
  },
  sectionDescription: {
    color: "#64748b",
    marginBottom: 10,
    fontSize: 9,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f3ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  cell: {
    flex: 1,
    fontSize: 9,
  },
  cellWide: {
    flex: 2,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  alertBox: {
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#92400e",
    marginBottom: 3,
  },
  alertText: {
    fontSize: 9,
    color: "#78350f",
  },
});

function PdfTable({
  headers,
  rows,
  wideColumnIndex,
}: {
  headers: string[];
  rows: string[][];
  wideColumnIndex?: number;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {headers.map((header) => (
          <Text
            key={header}
            style={wideColumnIndex === headers.indexOf(header) ? styles.cellWide : styles.cell}
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View key={`${row[0]}-${index}`} style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <Text
              key={`${cell}-${cellIndex}`}
              style={cellIndex === wideColumnIndex ? styles.cellWide : styles.cell}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function ReportPdfDocument({ data }: { data: ReportsData }) {
  const meta = getReportExportMeta(data);

  const kpis = [
    { label: "Ingresos", value: formatReportMoney(data.summary.income), color: "#059669" },
    { label: "Gastos", value: formatReportMoney(data.summary.expenses), color: "#dc2626" },
    { label: "Balance", value: formatReportMoney(data.summary.balance), color: "#7c3aed" },
    {
      label: "Créditos pendientes",
      value: formatReportMoney(data.summary.pendingCreditAmount),
      color: "#d97706",
    },
  ];

  const categoryRows = data.categories.slice(0, 8).map((item) => [
    item.name,
    formatReportMoney(item.spent),
    `${item.share}%`,
  ]);

  const merchantRows = data.merchants.slice(0, 8).map((item) => [
    item.name,
    formatReportMoney(item.amount),
    `${item.share}%`,
    String(item.transactions),
  ]);

  const creditRows = data.credits.slice(0, 10).map((item) => [
    item.title,
    `${item.paidInstallments}/${item.totalInstallments}`,
    formatReportMoney(item.totalPendingAmount),
    item.nextPaymentDate ? formatReportDate(item.nextPaymentDate) : "Completado",
  ]);

  const movementRows = data.exportRows.slice(0, 25).map((item) => [
    formatReportDate(item.date),
    item.type,
    item.title,
    formatReportMoney(item.amount),
  ]);

  return (
    <Document title={`Reporte ${data.periodLabel}`} author={meta.appName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{meta.appName}</Text>
          <Text style={styles.heroSubtitle}>
            Reporte financiero · {data.periodLabel} ({data.periodRangeLabel})
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Periodo: {data.periodLabel}</Text>
          <Text style={styles.metaText}>
            Generado: {formatReportDate(meta.generatedAt)}
          </Text>
        </View>

        <View style={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Comparativa de periodos</Text>
        <PdfTable
          headers={["Periodo", "Ingresos", "Gastos", "Balance"]}
          rows={[
            [
              data.periodLabel,
              formatReportMoney(data.summary.income),
              formatReportMoney(data.summary.expenses),
              formatReportMoney(data.summary.balance),
            ],
            [
              data.comparison.previous.label,
              formatReportMoney(data.comparison.previous.income),
              formatReportMoney(data.comparison.previous.expenses),
              formatReportMoney(data.comparison.previous.balance),
            ],
            ...(data.comparison.yearAgo
              ? [[
                  data.comparison.yearAgo.label,
                  formatReportMoney(data.comparison.yearAgo.income),
                  formatReportMoney(data.comparison.yearAgo.expenses),
                  formatReportMoney(data.comparison.yearAgo.balance),
                ]]
              : []),
          ]}
          wideColumnIndex={0}
        />

        {data.alerts.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Alertas</Text>
            {data.alerts.slice(0, 3).map((alert) => (
              <View key={alert.id} style={styles.alertBox}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertText}>{alert.description}</Text>
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Gastos por categoría</Text>
        <PdfTable
          headers={["Categoría", "Monto", "Participación"]}
          rows={categoryRows.length > 0 ? categoryRows : [["Sin datos", "-", "-"]]}
          wideColumnIndex={0}
        />

        <View style={styles.footer} fixed>
          <Text>{meta.appName}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Top comercios</Text>
        <Text style={styles.sectionDescription}>
          Principales conceptos donde más gastaste en el periodo.
        </Text>
        <PdfTable
          headers={["Concepto", "Monto", "Share", "Movs."]}
          rows={merchantRows.length > 0 ? merchantRows : [["Sin datos", "-", "-", "-"]]}
          wideColumnIndex={0}
        />

        <Text style={styles.sectionTitle}>Créditos e instalmentos</Text>
        <PdfTable
          headers={["Crédito", "Cuotas", "Pendiente", "Próximo pago"]}
          rows={creditRows.length > 0 ? creditRows : [["Sin créditos activos", "-", "-", "-"]]}
          wideColumnIndex={0}
        />

        <Text style={styles.sectionTitle}>Ahorros del periodo</Text>
        <PdfTable
          headers={["Indicador", "Valor"]}
          rows={[
            ["Balance total", formatReportMoney(data.savings.totalBalance)],
            ["Depósitos", formatReportMoney(data.savings.periodDeposits)],
            ["Retiros", formatReportMoney(data.savings.periodWithdrawals)],
            ["Metas activas", String(data.savings.activeGoals)],
          ]}
          wideColumnIndex={0}
        />

        <View style={styles.footer} fixed>
          <Text>{meta.appName}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Movimientos del periodo</Text>
        <Text style={styles.sectionDescription}>
          Primeros 25 movimientos. Exporta Excel para ver el listado completo.
        </Text>
        <PdfTable
          headers={["Fecha", "Tipo", "Concepto", "Monto"]}
          rows={movementRows.length > 0 ? movementRows : [["Sin movimientos", "-", "-", "-"]]}
          wideColumnIndex={2}
        />

        <View style={styles.footer} fixed>
          <Text>{meta.appName}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

import { renderToBuffer } from "@react-pdf/renderer";
import type { ReportsData } from "@/lib/reports/types";
import { ReportPdfDocument } from "@/lib/reports/report-pdf-document";

export async function buildReportsPdf(data: ReportsData) {
  const buffer = await renderToBuffer(<ReportPdfDocument data={data} />);
  return Buffer.from(buffer);
}

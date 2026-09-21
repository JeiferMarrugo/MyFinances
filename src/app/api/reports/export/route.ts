import { requireApiSession } from "@/lib/api/auth";
import { apiUnauthorized, fileDownload } from "@/lib/api/responses";
import { buildReportsPdf } from "@/lib/reports/export-pdf";
import {
  buildReportsCsv,
  buildReportsXlsx,
} from "@/lib/reports/export-xlsx";
import {
  buildReportsExportFilename,
  getReportExportContentType,
  parseReportExportFormat,
} from "@/lib/reports/export";
import { getReportsData, parseReportPeriod } from "@/lib/reports/queries";

export async function GET(request: Request) {
  const { session, error } = await requireApiSession();
  if (error || !session) {
    return error ?? apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const periodType = parseReportPeriod(searchParams.get("period"));
  const format = parseReportExportFormat(searchParams.get("format"));
  const data = await getReportsData(session.user.id, periodType);
  const filename = buildReportsExportFilename(data.periodLabel, format);

  if (format === "xlsx") {
    const buffer = await buildReportsXlsx(data);
    return fileDownload(
      new Uint8Array(buffer),
      filename,
      getReportExportContentType("xlsx"),
    );
  }

  if (format === "pdf") {
    const buffer = await buildReportsPdf(data);
    return fileDownload(
      new Uint8Array(buffer),
      filename,
      getReportExportContentType("pdf"),
    );
  }

  const csv = buildReportsCsv(data.exportRows);
  return fileDownload(csv, filename, getReportExportContentType("csv"));
}

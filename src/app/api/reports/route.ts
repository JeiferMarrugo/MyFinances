import { requireApiSession } from "@/lib/api/auth";
import { apiOk } from "@/lib/api/responses";
import { getReportsData, parseReportPeriod } from "@/lib/reports/queries";

export async function GET(request: Request) {
  const { session, error } = await requireApiSession();
  if (error || !session) return error;

  const { searchParams } = new URL(request.url);
  const periodType = parseReportPeriod(searchParams.get("period"));
  const data = await getReportsData(session.user.id, periodType);

  return apiOk(data);
}

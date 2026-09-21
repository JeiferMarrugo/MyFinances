import { ReportsManager } from "@/components/reports/reports-manager";
import { getReportsData, parseReportPeriod } from "@/lib/reports/queries";
import { getRequiredPageSession } from "@/lib/session";

type ReportsPageProps = {
  searchParams: Promise<{ period?: string }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await getRequiredPageSession();
  const params = await searchParams;
  const periodType = parseReportPeriod(params.period);
  const data = await getReportsData(session.user.id, periodType);

  return <ReportsManager data={data} />;
}

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { getDashboardStats } from "@/lib/dashboard/queries";
import { getRecentExpensesByUserId } from "@/lib/transactions/queries";
import { toDisplayTransactions } from "@/lib/transactions/utils";
import { getRequiredPageSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getRequiredPageSession();
  const userId = session.user.id;

  const [merchants, transactions, stats] = await Promise.all([
    getMerchantsByUserId(userId),
    getRecentExpensesByUserId(userId, 5),
    getDashboardStats(userId),
  ]);

  return (
    <DashboardOverview
      userName={session.user.name}
      merchants={merchants}
      transactions={toDisplayTransactions(transactions)}
      summary={stats.summary}
      monthlyTrend={stats.monthlyTrend}
      categorySpending={stats.categorySpending}
      paymentMethods={stats.paymentMethods}
      savingsOverview={stats.savingsOverview}
      pendingPayments={stats.pendingPayments}
    />
  );
}

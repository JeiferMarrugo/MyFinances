import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getBalanceTrend } from "@/lib/dashboard/queries";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { dedupeAutoRegisteredTransactions } from "@/lib/recurring/dedupe";
import { processDueRecurringExpenses } from "@/lib/recurring-expenses/process";
import { processDueRecurringIncomes } from "@/lib/recurring-incomes/process";
import { getRequiredPageSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await getRequiredPageSession();

  const removedDuplicates = await dedupeAutoRegisteredTransactions(session.user.id);

  const [merchants, recurringIncomeResult, recurringExpenseResult, balanceTrend] =
    await Promise.all([
    getMerchantsByUserId(session.user.id),
    processDueRecurringIncomes(session.user.id),
    processDueRecurringExpenses(session.user.id),
    getBalanceTrend(session.user.id),
  ]);

  return (
    <DashboardShell
      userName={session.user.name}
      userEmail={session.user.email}
      merchants={merchants}
      balance={balanceTrend.balance}
      balanceTrendPercent={balanceTrend.trendPercent}
      balancePeriodLabel={balanceTrend.periodLabel}
      autoRegisteredIncomeCount={recurringIncomeResult.createdCount}
      autoRegisteredIncomeTitles={recurringIncomeResult.createdTitles}
      autoRegisteredExpenseCount={recurringExpenseResult.createdCount}
      autoRegisteredExpenseTitles={recurringExpenseResult.createdTitles}
    >
      {children}
    </DashboardShell>
  );
}

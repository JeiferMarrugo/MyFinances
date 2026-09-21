import { TransactionsManager } from "@/components/transactions/transactions-manager";
import { getMerchantsByUserId } from "@/lib/merchants/queries";
import { getRecurringExpensesWithSpending } from "@/lib/recurring-expenses/queries";
import { getRecurringIncomesByUserId } from "@/lib/recurring-incomes/queries";
import { getSavingsGoalsByUserId } from "@/lib/savings-goals/queries";
import { getOrCreateFinanceSettings } from "@/lib/finance-settings/queries";
import {
  getMonthlySummary,
  getTransactionsByUserId,
} from "@/lib/transactions/queries";
import { loadPaymentPlansByTransactionIds } from "@/lib/transactions/payment-plan";
import { enrichDisplayTransactions } from "@/lib/transactions/utils";
import { getRequiredPageSession } from "@/lib/session";

export default async function MovementsPage() {
  const session = await getRequiredPageSession();
  const userId = session.user.id;

  const settings = await getOrCreateFinanceSettings(userId);

  const [transactions, summary, merchants, recurringIncomes, recurringExpenses, savingsGoals] =
    await Promise.all([
    getTransactionsByUserId(userId),
    getMonthlySummary(userId),
    getMerchantsByUserId(userId),
    getRecurringIncomesByUserId(userId),
    getRecurringExpensesWithSpending(userId),
    getSavingsGoalsByUserId(userId).then((goals) =>
      goals.filter((goal) => goal.isActive),
    ),
  ]);

  const paymentPlans = await loadPaymentPlansByTransactionIds(
    transactions.map((transaction) => transaction.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold brand-text">Finanzas personales</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Ingresos y gastos
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Registra, consulta y administra todos tus movimientos financieros.
        </p>
      </div>

      <TransactionsManager
        initialTransactions={enrichDisplayTransactions(
          transactions,
          settings,
          new Date(),
          paymentPlans,
        )}
        initialSummary={summary}
        merchants={merchants}
        financeSettings={settings}
        initialRecurringIncomes={recurringIncomes}
        initialRecurringExpenses={recurringExpenses}
        initialSavingsGoals={savingsGoals}
      />
    </div>
  );
}

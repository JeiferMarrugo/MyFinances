import { LoansManager } from "@/components/loans/loans-manager";
import {
  getLoanPersonsByUserId,
  getLoansByUserId,
  getLoansOverview,
} from "@/lib/loans/queries";
import { getSavingsGoalsByUserId } from "@/lib/savings-goals/queries";
import { getRequiredPageSession } from "@/lib/session";

export default async function LoansPage() {
  const session = await getRequiredPageSession();
  const userId = session.user.id;

  const [loans, persons, overview, savingsGoals] = await Promise.all([
    getLoansByUserId(userId),
    getLoanPersonsByUserId(userId),
    getLoansOverview(userId),
    getSavingsGoalsByUserId(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold brand-text">Finanzas personales</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Préstamos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Registra dinero que prestas a otras personas. Queda en espera hasta que
          confirmes el cobro. Si sale de tus ahorros, al recibirlo eliges si vuelve
          a tu plata o al fondo de ahorro.
        </p>
      </div>

      <LoansManager
        initialLoans={loans}
        initialPersons={persons}
        initialOverview={overview}
        savingsGoals={savingsGoals}
      />
    </div>
  );
}

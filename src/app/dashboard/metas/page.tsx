import { SavingsGoalsManager } from "@/components/savings/savings-goals-manager";
import { getCardsByUserId } from "@/lib/cards/queries";
import { getSavingsGoalsByUserId } from "@/lib/savings-goals/queries";
import { getRequiredPageSession } from "@/lib/session";

export default async function GoalsPage() {
  const session = await getRequiredPageSession();
  const userId = session.user.id;

  const [goals, cards] = await Promise.all([
    getSavingsGoalsByUserId(userId),
    getCardsByUserId(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold brand-text">Metas</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Mis ahorros</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Guarda tu dinero en fondos asociados a tarjetas. Cuando pagues un gasto
          con ahorros, el movimiento queda registrado pero no resta de tu balance
          del periodo.
        </p>
      </div>

      <SavingsGoalsManager initialGoals={goals} cards={cards} />
    </div>
  );
}

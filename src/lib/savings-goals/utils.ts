export function getMonthlySavingsTarget(goal: {
  targetAmount: number | null;
  targetMonths: number | null;
  currentBalance: number;
}) {
  if (
    goal.targetAmount == null ||
    goal.targetMonths == null ||
    goal.targetMonths <= 0
  ) {
    return null;
  }

  const remaining = Math.max(goal.targetAmount - goal.currentBalance, 0);

  if (remaining <= 0) {
    return 0;
  }

  return remaining / goal.targetMonths;
}

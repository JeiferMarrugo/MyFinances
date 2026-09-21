"use client";

import { useEffect, useRef } from "react";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";

type AutoRegistrationNotifierProps = {
  incomeCreatedCount: number;
  incomeCreatedTitles: string[];
  expenseCreatedCount: number;
  expenseCreatedTitles: string[];
};

export function AutoRegistrationNotifier({
  incomeCreatedCount,
  incomeCreatedTitles,
  expenseCreatedCount,
  expenseCreatedTitles,
}: AutoRegistrationNotifierProps) {
  const hasNotifiedIncomes = useRef(false);
  const hasNotifiedExpenses = useRef(false);

  useEffect(() => {
    if (!hasNotifiedIncomes.current && incomeCreatedCount > 0) {
      hasNotifiedIncomes.current = true;

      appToast.success(toastCopy.recurringIncomes.autoRegisteredTitle, {
        description: toastCopy.recurringIncomes.autoRegisteredDescription(
          incomeCreatedCount,
          incomeCreatedTitles,
        ),
      });
    }
  }, [incomeCreatedCount, incomeCreatedTitles]);

  useEffect(() => {
    if (!hasNotifiedExpenses.current && expenseCreatedCount > 0) {
      hasNotifiedExpenses.current = true;

      appToast.success(toastCopy.recurringExpenses.autoRegisteredTitle, {
        description: toastCopy.recurringExpenses.autoRegisteredDescription(
          expenseCreatedCount,
          expenseCreatedTitles,
        ),
      });
    }
  }, [expenseCreatedCount, expenseCreatedTitles]);

  return null;
}

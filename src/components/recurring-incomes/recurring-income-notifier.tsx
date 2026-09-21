"use client";

import { useEffect, useRef } from "react";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";

type RecurringIncomeNotifierProps = {
  createdCount: number;
  createdTitles: string[];
};

export function RecurringIncomeNotifier({
  createdCount,
  createdTitles,
}: RecurringIncomeNotifierProps) {
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current || createdCount <= 0) return;

    hasNotified.current = true;

    appToast.success(toastCopy.recurringIncomes.autoRegisteredTitle, {
      description: toastCopy.recurringIncomes.autoRegisteredDescription(
        createdCount,
        createdTitles,
      ),
    });
  }, [createdCount, createdTitles]);

  return null;
}

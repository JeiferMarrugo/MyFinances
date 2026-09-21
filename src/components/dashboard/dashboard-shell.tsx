"use client";

import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { AutoRegistrationNotifier } from "@/components/recurring-incomes/auto-registration-notifier";
import { SessionInactivityGuard } from "@/components/auth/session-inactivity-guard";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { MerchantRecord } from "@/lib/merchants/types";

type DashboardShellProps = {
  userName: string;
  userEmail: string;
  merchants: MerchantRecord[];
  balance: number;
  balanceTrendPercent: number | null;
  balancePeriodLabel?: string;
  autoRegisteredIncomeCount?: number;
  autoRegisteredIncomeTitles?: string[];
  autoRegisteredExpenseCount?: number;
  autoRegisteredExpenseTitles?: string[];
  children: ReactNode;
};

export function DashboardShell({
  userName,
  userEmail,
  merchants,
  balance,
  balanceTrendPercent,
  balancePeriodLabel,
  autoRegisteredIncomeCount = 0,
  autoRegisteredIncomeTitles = [],
  autoRegisteredExpenseCount = 0,
  autoRegisteredExpenseTitles = [],
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <SessionInactivityGuard />
      <DashboardSidebar
        balance={balance}
        trendPercent={balanceTrendPercent}
        periodLabel={balancePeriodLabel}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader userName={userName} userEmail={userEmail} />
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
      <TransactionFormDialog merchants={merchants} />
      <ConfirmDialog />
      <AutoRegistrationNotifier
        incomeCreatedCount={autoRegisteredIncomeCount}
        incomeCreatedTitles={autoRegisteredIncomeTitles}
        expenseCreatedCount={autoRegisteredExpenseCount}
        expenseCreatedTitles={autoRegisteredExpenseTitles}
      />
    </div>
  );
}

"use client";

import { parseAsString, useQueryState } from "nuqs";
import { LiveClock } from "@/components/dashboard/live-clock";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useTransactionModalStore } from "@/stores/transaction-modal-store";

type DashboardHeaderProps = {
  userName: string;
  userEmail: string;
};

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsString.withDefault("30d"),
  );
  const openTransactionModal = useTransactionModalStore((state) => state.open);

  function handleNewTransaction() {
    openTransactionModal("expense");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-accent/10 bg-background/85 backdrop-blur-md">
      <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Buscar movimientos, categorías..."
              className="brand-input h-11 w-full rounded-xl border border-border bg-white/90 px-4 text-sm transition-shadow"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={period ?? "30d"}
              onChange={(event) => setPeriod(event.target.value)}
              searchable={false}
              className="min-w-[180px]"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </Select>

            <Button type="button" onClick={handleNewTransaction}>
              + Nueva transacción
            </Button>

            <LiveClock />

            <UserMenu userName={userName} userEmail={userEmail} />
          </div>
        </div>
      </div>
    </header>
  );
}

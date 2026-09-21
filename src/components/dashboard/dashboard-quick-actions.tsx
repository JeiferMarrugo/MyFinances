"use client";

import { useTransactionModalStore } from "@/stores/transaction-modal-store";

export function DashboardQuickActions() {
  const openTransactionModal = useTransactionModalStore((state) => state.open);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => openTransactionModal("income")}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-[#ecfdf5] px-4 text-sm font-semibold text-success shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        Agregar ingreso
      </button>
      <button
        type="button"
        onClick={() => openTransactionModal("expense")}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-[#fef2f2] px-4 text-sm font-semibold text-destructive shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        Registrar gasto
      </button>
      <a
        href="/dashboard/manejadores/empresas"
        className="brand-chip inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-accent"
      >
        Registrar empresa
      </a>
    </div>
  );
}

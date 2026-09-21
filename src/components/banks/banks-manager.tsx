"use client";

import { useState } from "react";
import { BankCard } from "@/components/banks/bank-card";
import { BankForm } from "@/components/banks/bank-form";
import { EmptyState } from "@/components/ui/empty-state";
import type { BankRecord } from "@/lib/banks/types";
import type { BankInput } from "@/lib/validations/bank";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { appConfirm } from "@/stores/confirm-dialog-store";

type BanksManagerProps = {
  initialBanks: BankRecord[];
};

export function BanksManager({ initialBanks }: BanksManagerProps) {
  const [banks, setBanks] = useState(initialBanks);
  const [editingBank, setEditingBank] = useState<BankRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createBank(values: BankInput) {
    const toastId = appToast.loading(toastCopy.banks.loadingCreate);
    const response = await fetch("/api/banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.banks.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.banks.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.banks.errorDescription);
    }

    setBanks((current) =>
      [...current, data.bank].sort((a, b) => a.name.localeCompare(b.name)),
    );
    appToast.success(toastCopy.banks.createSuccessTitle, {
      id: toastId,
      description: toastCopy.banks.createSuccessDescription(values.name),
    });
  }

  async function updateBank(values: BankInput) {
    if (!editingBank) return;

    const toastId = appToast.loading(toastCopy.banks.loadingUpdate);
    const response = await fetch(`/api/banks/${editingBank.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.banks.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.banks.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.banks.errorDescription);
    }

    setBanks((current) =>
      current
        .map((bank) => (bank.id === editingBank.id ? data.bank : bank))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingBank(null);
    appToast.success(toastCopy.banks.updateSuccessTitle, {
      id: toastId,
      description: toastCopy.banks.updateSuccessDescription(values.name),
    });
  }

  async function deleteBank(bank: BankRecord) {
    const confirmed = await appConfirm({
      title: "¿Eliminar banco?",
      description: "Las tarjetas vinculadas quedarán sin banco asignado:",
      highlight: bank.name,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    setDeletingId(bank.id);
    const toastId = appToast.loading(toastCopy.banks.loadingDelete);
    const response = await fetch(`/api/banks/${bank.id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.banks.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.banks.errorDescription,
      });
      setDeletingId(null);
      return;
    }

    setBanks((current) => current.filter((item) => item.id !== bank.id));
    if (editingBank?.id === bank.id) setEditingBank(null);
    appToast.success(toastCopy.banks.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.banks.deleteSuccessDescription(bank.name),
    });
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <BankForm onSubmit={createBank} />

      {editingBank ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Editar banco</h2>
          <BankForm
            initialValues={editingBank}
            onSubmit={updateBank}
            onCancel={() => setEditingBank(null)}
            submitLabel="Guardar cambios"
          />
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Tus bancos</h2>
          <p className="text-sm text-muted-foreground">
            {banks.length === 0
              ? "Aún no has registrado bancos."
              : `${banks.length} banco${banks.length === 1 ? "" : "s"} registrado${banks.length === 1 ? "" : "s"}.`}
          </p>
        </div>

        {banks.length === 0 ? (
          <EmptyState
            title="Organiza tus entidades financieras"
            description="Registra Bancolombia, Davivienda u otros bancos para vincular tus tarjetas."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {banks.map((bank) => (
              <BankCard
                key={bank.id}
                bank={bank}
                onEdit={setEditingBank}
                onDelete={deleteBank}
                isDeleting={deletingId === bank.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

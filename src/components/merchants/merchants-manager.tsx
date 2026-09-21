"use client";

import { useState } from "react";
import { MerchantCard } from "@/components/merchants/merchant-card";
import { MerchantForm } from "@/components/merchants/merchant-form";
import type { MerchantRecord } from "@/lib/merchants/types";
import type { MerchantInput } from "@/lib/validations/merchant";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { appConfirm } from "@/stores/confirm-dialog-store";

type MerchantsManagerProps = {
  initialMerchants: MerchantRecord[];
};

export function MerchantsManager({ initialMerchants }: MerchantsManagerProps) {
  const [merchants, setMerchants] = useState(initialMerchants);
  const [editingMerchant, setEditingMerchant] = useState<MerchantRecord | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createMerchant(values: MerchantInput) {
    const toastId = appToast.loading(toastCopy.merchants.loadingCreate);

    const response = await fetch("/api/merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.merchants.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.merchants.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.merchants.errorDescription);
    }

    setMerchants((current) =>
      [...current, data.merchant].sort((a, b) => a.name.localeCompare(b.name)),
    );
    appToast.success(toastCopy.merchants.createSuccessTitle, {
      id: toastId,
      description: toastCopy.merchants.createSuccessDescription(values.name),
    });
  }

  async function updateMerchant(values: MerchantInput) {
    if (!editingMerchant) return;

    const toastId = appToast.loading(toastCopy.merchants.loadingUpdate);

    const response = await fetch(`/api/merchants/${editingMerchant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.merchants.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.merchants.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.merchants.errorDescription);
    }

    setMerchants((current) =>
      current
        .map((merchant) =>
          merchant.id === editingMerchant.id ? data.merchant : merchant,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingMerchant(null);
    appToast.success(toastCopy.merchants.updateSuccessTitle, {
      id: toastId,
      description: toastCopy.merchants.updateSuccessDescription(values.name),
    });
  }

  async function deleteMerchant(merchant: MerchantRecord) {
    const confirmed = await appConfirm({
      title: "¿Eliminar empresa?",
      description:
        "La empresa se removerá de tu catálogo. Los movimientos ya registrados no se eliminan:",
      highlight: merchant.name,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    setDeletingId(merchant.id);
    const toastId = appToast.loading(toastCopy.merchants.loadingDelete);

    const response = await fetch(`/api/merchants/${merchant.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.merchants.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.merchants.errorDescription,
      });
      setDeletingId(null);
      return;
    }

    setMerchants((current) => current.filter((item) => item.id !== merchant.id));
    if (editingMerchant?.id === merchant.id) {
      setEditingMerchant(null);
    }
    appToast.success(toastCopy.merchants.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.merchants.deleteSuccessDescription(merchant.name),
    });
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <MerchantForm onSubmit={createMerchant} />

      {editingMerchant ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Editar empresa</h2>
            <p className="text-sm text-muted-foreground">{editingMerchant.name}</p>
          </div>
          <MerchantForm
            initialValues={editingMerchant}
            onSubmit={updateMerchant}
            onCancel={() => setEditingMerchant(null)}
            submitLabel="Guardar cambios"
          />
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Tus empresas</h2>
            <p className="text-sm text-muted-foreground">
              {merchants.length === 0
                ? "Aún no has registrado empresas."
                : `${merchants.length} empresa${merchants.length === 1 ? "" : "s"} registrada${merchants.length === 1 ? "" : "s"}.`}
            </p>
          </div>
        </div>

        {merchants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Registra supermercados, suscripciones, tiendas y más.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cuando registres un gasto con el mismo nombre, verás su logo en
              tus movimientos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onEdit={setEditingMerchant}
                onDelete={deleteMerchant}
                isDeleting={deletingId === merchant.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

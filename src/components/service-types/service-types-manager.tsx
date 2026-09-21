"use client";

import { useState } from "react";
import { ServiceTypeCard } from "@/components/service-types/service-type-card";
import { ServiceTypeForm } from "@/components/service-types/service-type-form";
import { EmptyState } from "@/components/ui/empty-state";
import type { ServiceTypeRecord } from "@/lib/service-types/types";
import type { ServiceTypeInput } from "@/lib/validations/service-type";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { appConfirm } from "@/stores/confirm-dialog-store";

type ServiceTypesManagerProps = {
  initialServiceTypes: ServiceTypeRecord[];
};

export function ServiceTypesManager({
  initialServiceTypes,
}: ServiceTypesManagerProps) {
  const [serviceTypes, setServiceTypes] = useState(initialServiceTypes);
  const [editingItem, setEditingItem] = useState<ServiceTypeRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createServiceType(values: ServiceTypeInput) {
    const toastId = appToast.loading(toastCopy.serviceTypes.loadingCreate);
    const response = await fetch("/api/service-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.serviceTypes.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.serviceTypes.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.serviceTypes.errorDescription);
    }

    setServiceTypes((current) =>
      [...current, data.serviceType].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
    appToast.success(toastCopy.serviceTypes.createSuccessTitle, {
      id: toastId,
      description: toastCopy.serviceTypes.createSuccessDescription(values.name),
    });
  }

  async function updateServiceType(values: ServiceTypeInput) {
    if (!editingItem) return;

    const toastId = appToast.loading(toastCopy.serviceTypes.loadingUpdate);
    const response = await fetch(`/api/service-types/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.serviceTypes.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.serviceTypes.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.serviceTypes.errorDescription);
    }

    setServiceTypes((current) =>
      current
        .map((item) => (item.id === editingItem.id ? data.serviceType : item))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingItem(null);
    appToast.success(toastCopy.serviceTypes.updateSuccessTitle, {
      id: toastId,
      description: toastCopy.serviceTypes.updateSuccessDescription(values.name),
    });
  }

  async function deleteServiceType(item: ServiceTypeRecord) {
    const confirmed = await appConfirm({
      title: "¿Eliminar tipo de servicio?",
      description: "Se quitará de tu catálogo personal:",
      highlight: item.name,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    setDeletingId(item.id);
    const toastId = appToast.loading(toastCopy.serviceTypes.loadingDelete);
    const response = await fetch(`/api/service-types/${item.id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.serviceTypes.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.serviceTypes.errorDescription,
      });
      setDeletingId(null);
      return;
    }

    setServiceTypes((current) => current.filter((entry) => entry.id !== item.id));
    if (editingItem?.id === item.id) setEditingItem(null);
    appToast.success(toastCopy.serviceTypes.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.serviceTypes.deleteSuccessDescription(item.name),
    });
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <ServiceTypeForm onSubmit={createServiceType} />

      {editingItem ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Editar tipo de servicio</h2>
          <ServiceTypeForm
            initialValues={editingItem}
            onSubmit={updateServiceType}
            onCancel={() => setEditingItem(null)}
            submitLabel="Guardar cambios"
          />
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Tus tipos de servicio</h2>
          <p className="text-sm text-muted-foreground">
            {serviceTypes.length === 0
              ? "Aún no has registrado tipos de servicio."
              : `${serviceTypes.length} tipo${serviceTypes.length === 1 ? "" : "s"} registrado${serviceTypes.length === 1 ? "" : "s"}.`}
          </p>
        </div>

        {serviceTypes.length === 0 ? (
          <EmptyState
            title="Organiza tus pagos recurrentes"
            description="Define luz, gas, internet y otros servicios para clasificarlos mejor."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {serviceTypes.map((item) => (
              <ServiceTypeCard
                key={item.id}
                serviceType={item}
                onEdit={setEditingItem}
                onDelete={deleteServiceType}
                isDeleting={deletingId === item.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { CardForm } from "@/components/cards/card-form";
import { CardItem } from "@/components/cards/card-item";
import { EmptyState } from "@/components/ui/empty-state";
import type { BankRecord } from "@/lib/banks/types";
import type { CardRecord } from "@/lib/cards/types";
import type { CardInput } from "@/lib/validations/card";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";
import { appConfirm } from "@/stores/confirm-dialog-store";

type CardsManagerProps = {
  initialCards: CardRecord[];
  banks: BankRecord[];
};

export function CardsManager({ initialCards, banks }: CardsManagerProps) {
  const [cards, setCards] = useState(initialCards);
  const [editingCard, setEditingCard] = useState<CardRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createCard(values: CardInput) {
    const toastId = appToast.loading(toastCopy.cards.loadingCreate);
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.cards.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.cards.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.cards.errorDescription);
    }

    setCards((current) =>
      [...current, data.card].sort((a, b) => a.name.localeCompare(b.name)),
    );
    appToast.success(toastCopy.cards.createSuccessTitle, {
      id: toastId,
      description: toastCopy.cards.createSuccessDescription(values.name),
    });
  }

  async function updateCard(values: CardInput) {
    if (!editingCard) return;

    const toastId = appToast.loading(toastCopy.cards.loadingUpdate);
    const response = await fetch(`/api/cards/${editingCard.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.cards.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.cards.errorDescription,
      });
      throw new Error(data.error ?? toastCopy.cards.errorDescription);
    }

    setCards((current) =>
      current
        .map((item) => (item.id === editingCard.id ? data.card : item))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingCard(null);
    appToast.success(toastCopy.cards.updateSuccessTitle, {
      id: toastId,
      description: toastCopy.cards.updateSuccessDescription(values.name),
    });
  }

  async function deleteCard(card: CardRecord) {
    const confirmed = await appConfirm({
      title: "¿Eliminar tarjeta?",
      description: "Se quitará de tu catálogo personal:",
      highlight: card.name,
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    setDeletingId(card.id);
    const toastId = appToast.loading(toastCopy.cards.loadingDelete);
    const response = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      appToast.error(toastCopy.cards.errorTitle, {
        id: toastId,
        description: data.error ?? toastCopy.cards.errorDescription,
      });
      setDeletingId(null);
      return;
    }

    setCards((current) => current.filter((item) => item.id !== card.id));
    if (editingCard?.id === card.id) setEditingCard(null);
    appToast.success(toastCopy.cards.deleteSuccessTitle, {
      id: toastId,
      description: toastCopy.cards.deleteSuccessDescription(card.name),
    });
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      {banks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-5">
          <p className="text-sm font-medium text-foreground">
            Primero registra un banco
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Así podrás vincular tus tarjetas de crédito o débito con su entidad.
          </p>
          <Link
            href="/dashboard/manejadores/bancos"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Ir a bancos
          </Link>
        </div>
      ) : (
        <CardForm banks={banks} onSubmit={createCard} />
      )}

      {editingCard ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Editar tarjeta</h2>
          <CardForm
            banks={banks}
            initialValues={editingCard}
            onSubmit={updateCard}
            onCancel={() => setEditingCard(null)}
            submitLabel="Guardar cambios"
          />
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Tus tarjetas</h2>
          <p className="text-sm text-muted-foreground">
            {cards.length === 0
              ? "Aún no has registrado tarjetas."
              : `${cards.length} tarjeta${cards.length === 1 ? "" : "s"} registrada${cards.length === 1 ? "" : "s"}.`}
          </p>
        </div>

        {cards.length === 0 ? (
          <EmptyState
            title="Centraliza tus medios de pago"
            description="Registra tarjetas de crédito y débito para identificarlas fácilmente."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onEdit={setEditingCard}
                onDelete={deleteCard}
                isDeleting={deletingId === card.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
